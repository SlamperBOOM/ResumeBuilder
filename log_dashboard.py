#!/usr/bin/env python3
"""
log_dashboard.py — parses log files and generates a self-contained HTML
dashboard for visual analysis. Supported formats (can be mixed in one file):
  - backend (Quarkus): "2026-09-03 23:59:50,952 host proc[pid] LEVEL [logger] (thread) message"
  - frontend (electron-log main.log): "[2026-09-03 23:59:50.952] [info]  message"

Usage:
    python log_dashboard.py app.log
    python log_dashboard.py app.log main.log        # merged into one timeline
    python log_dashboard.py app.log -o report.html
    python log_dashboard.py app.log --mask-fields preview,photo
"""
import argparse
import json
import math
import re
import sys
from collections import deque
from datetime import datetime, timedelta
from pathlib import Path

LOG_RE = re.compile(
    r'^(?P<ts>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\s+'
    r'(?:(?P<host>\S+)\s+(?P<proc>\S+)\s+)?'  # absent in console output (forwarded to main.log)
    r'(?P<level>[A-Z]+)\s+'
    r'\[(?P<logger>[^\]]+)\]\s+'
    r'\((?P<thread>[^)]+)\)\s?(?P<message>.*)$'
)

ELECTRON_RE = re.compile(
    r'^\[(?P<ts>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\]\s+'
    r'\[(?P<level>[a-z]+)\]\s+(?P<message>.*)$'
)

# "[backend] spawning ..." -> logger "backend"; messages without a prefix get "main"
ELECTRON_PREFIX_RE = re.compile(r'^\[(?P<logger>[\w:-]+)\]\s?(?P<rest>.*)$')

# electron-log level names mapped onto the backend's naming
ELECTRON_LEVELS = {'silly': 'TRACE', 'verbose': 'DEBUG'}

HTTP_RE = re.compile(
    r'^(?P<dir>->|<-)\s+(?P<method>[A-Z]+)\s+(?P<path>\S+?)(?:\s+\[(?P<status>\d+)\])?\s*$'
)

# The app's own RequestResponseLoggingFilter truncates long bodies before
# writing them to the log and appends this marker — e.g.
# '...JVBERi0...KMSAw... [truncated, 59648 chars total]'. We strip it out
# and just note how many chars didn't make it into the log (no attempt to
# reconstruct the cut-off JSON — the data is simply gone from the source).
BACKEND_TRUNCATION_RE = re.compile(r'\.\.\.\s*\[truncated, (?P<total>\d+) chars total\]\s*$')


def mask_value(v):
    """Replaces a masked field's value with a short placeholder that still
    conveys its shape (type/length), so the surrounding JSON stays readable."""
    if isinstance(v, str):
        return f'[masked: string, {len(v)} chars]'
    if isinstance(v, list):
        return f'[masked: array, {len(v)} items]'
    if isinstance(v, dict):
        return f'[masked: object, {len(v)} keys]'
    return '[masked]'


def mask_json(obj, mask_substrings):
    """Recursively walks a parsed JSON body and masks the value of any key
    whose name contains one of the given substrings (case-insensitive),
    e.g. 'pdf_preview' is masked when mask_substrings includes 'preview'."""
    if not mask_substrings:
        return obj
    if isinstance(obj, dict):
        result = {}
        for k, v in obj.items():
            if any(sub in k.lower() for sub in mask_substrings):
                result[k] = mask_value(v)
            else:
                result[k] = mask_json(v, mask_substrings)
        return result
    if isinstance(obj, list):
        return [mask_json(item, mask_substrings) for item in obj]
    return obj


def parse_ts(ts, fmt):
    try:
        return datetime.strptime(ts, fmt)
    except ValueError:
        return None


def parse_line(line):
    """Returns a new entry if the line starts one (backend or frontend format), else None."""
    m = LOG_RE.match(line)
    if m:
        d = m.groupdict()
        return {
            'ts': parse_ts(d['ts'], '%Y-%m-%d %H:%M:%S,%f'),
            'host': d['host'] or '',
            'proc': d['proc'] or '',
            'level': d['level'],
            'logger': d['logger'],
            'thread': d['thread'],
            'message': d['message'],
            'extra': [],
        }
    m = ELECTRON_RE.match(line)
    if not m:
        return None
    d = m.groupdict()
    logger, message = 'main', d['message']
    p = ELECTRON_PREFIX_RE.match(message)
    if p:
        logger, message = p.group('logger'), p.group('rest')
        # backend-manager forwards Quarkus output as "[quarkus:err] <backend log line>"
        # (and, in logs written before the split, "[quarkus] ..."). When the forwarded
        # line is a real backend log line, use its own level instead of electron's.
        if logger.startswith('quarkus'):
            inner = parse_line(message)
            if inner:
                return inner
    return {
        'ts': parse_ts(d['ts'], '%Y-%m-%d %H:%M:%S.%f'),
        'host': '',
        'proc': 'electron',
        'level': ELECTRON_LEVELS.get(d['level'], d['level'].upper()),
        'logger': logger,
        'thread': 'electron',
        'message': message,
        'extra': [],
    }


def parse_log(path):
    """Splits the file into entries; lines that don't start an entry are
    treated as a continuation (e.g. 'Body: {...}') of the previous entry."""
    entries = []
    current = None
    with open(path, encoding='utf-8', errors='replace') as f:
        for raw in f:
            line = raw.rstrip('\n')
            entry = parse_line(line)
            if entry:
                if current:
                    entries.append(current)
                current = entry
            elif current is not None:
                current['extra'].append(line)
    if current:
        entries.append(current)
    # entries without a valid timestamp are useless for the timeline — drop them.
    # Sorted because main.log interleaves frontend entries with forwarded backend ones.
    return sorted((e for e in entries if e['ts'] is not None), key=lambda e: e['ts'])


def enrich(entries, mask_fields=()):
    """Detects HTTP requests/responses and pairs them up by path (FIFO per
    path — the log has no request id, so this is a best-effort estimate),
    computing latency. Also collapses 'Body: ...' continuation lines into a
    separate field, masking any JSON keys listed in mask_fields."""
    pending = {}
    requests_ = []
    for i, e in enumerate(entries):
        m = HTTP_RE.match(e['message'])
        e['http'] = None
        if m:
            d = m.groupdict()
            status = int(d['status']) if d['status'] else None
            e['http'] = {'dir': d['dir'], 'method': d['method'], 'path': d['path'], 'status': status}
            if d['dir'] == '->':
                pending.setdefault(d['path'], deque()).append(i)
            else:
                q = pending.get(d['path'])
                req_idx = q.popleft() if q else None
                latency_ms = None
                if req_idx is not None and entries[req_idx]['ts'] and e['ts']:
                    latency_ms = (e['ts'] - entries[req_idx]['ts']).total_seconds() * 1000
                e['http']['latency_ms'] = latency_ms
                requests_.append({
                    'method': d['method'], 'path': d['path'], 'status': status,
                    'ts': e['ts'], 'latency_ms': latency_ms,
                })

        body_raw = '\n'.join(e['extra']) if e['extra'] else None
        e['body'] = None
        if body_raw and body_raw.startswith('Body:'):
            content = body_raw[len('Body:'):].strip()

            backend_total = None
            m = BACKEND_TRUNCATION_RE.search(content)
            if m:
                backend_total = int(m.group('total'))
                content = BACKEND_TRUNCATION_RE.sub('', content).rstrip()
            captured_chars = len(content)

            try:
                parsed = json.loads(content)
                content = json.dumps(mask_json(parsed, mask_fields), ensure_ascii=False, indent=2)
            except json.JSONDecodeError:
                pass  # not valid JSON (often backend-truncated mid-value) — leave as-is, no reconstruction

            # apply our own display cap first, then append the truncation note
            # unconditionally so it's never itself cut off mid-sentence
            if backend_total is not None:
                not_shown = max(backend_total - captured_chars, 0)
                content += f'\n…truncated by backend, {not_shown} chars not shown'

            e['body'] = content
        elif body_raw:
            e['body'] = body_raw
    return requests_


def build_summary(entries, requests_):
    levels = {}
    for e in entries:
        levels[e['level']] = levels.get(e['level'], 0) + 1
    latencies = [r['latency_ms'] for r in requests_ if r['latency_ms'] is not None]
    errors = sum(1 for r in requests_ if r['status'] and r['status'] >= 400)
    return {
        'total': len(entries),
        'levels': levels,
        'loggers': len(set(e['logger'] for e in entries)),
        'threads': len(set(e['thread'] for e in entries)),
        'start': entries[0]['ts'] if entries else None,
        'end': entries[-1]['ts'] if entries else None,
        'requests': len(requests_),
        'avg_latency': round(sum(latencies) / len(latencies), 1) if latencies else None,
        'http_errors': errors,
        # from the first backend entry: frontend entries carry no host/pid
        'host': next((e['host'] for e in entries if e['host']), ''),
        'proc': next((e['proc'] for e in entries if e['host']), ''),
    }


def build_timeline(entries, target_buckets=60):
    if not entries:
        return {'labels': [], 'series': {}, 'bucket_seconds': 1}
    t0, t1 = entries[0]['ts'], entries[-1]['ts']
    duration = max((t1 - t0).total_seconds(), 1)
    bucket_seconds = max(1, math.ceil(duration / target_buckets))
    n = int(duration // bucket_seconds) + 1
    levels_present = sorted(set(e['level'] for e in entries))
    series = {lvl: [0] * n for lvl in levels_present}
    for e in entries:
        idx = min(int((e['ts'] - t0).total_seconds() // bucket_seconds), n - 1)
        series[e['level']][idx] += 1
    labels = [(t0 + timedelta(seconds=i * bucket_seconds)).strftime('%H:%M:%S') for i in range(n)]
    return {'labels': labels, 'series': series, 'bucket_seconds': bucket_seconds}


def fmt_ts(dt):
    return dt.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3] if dt else None


def render_html(entries, requests_, summary, timeline, source_name):
    data = {
        'entries': [{
            'ts': fmt_ts(e['ts']),
            'level': e['level'],
            'logger': e['logger'],
            'thread': e['thread'],
            'message': e['message'],
            'body': e['body'],
            'http': e['http'],
        } for e in entries],
        'requests': [{
            'ts': fmt_ts(r['ts']),
            'method': r['method'],
            'path': r['path'],
            'status': r['status'],
            'latency_ms': round(r['latency_ms'], 1) if r['latency_ms'] is not None else None,
        } for r in requests_],
        'summary': {**summary, 'start': fmt_ts(summary['start']), 'end': fmt_ts(summary['end'])},
        'timeline': timeline,
        'source': source_name,
    }
    template_path = Path(__file__).parent / 'dashboard_template.html'
    html = template_path.read_text(encoding='utf-8')
    html = html.replace('__SOURCE_NAME__', source_name)
    html = html.replace('__DATA_JSON__', json.dumps(data, ensure_ascii=False))
    return html


def main():
    ap = argparse.ArgumentParser(description='Parse log files into an HTML dashboard')
    ap.add_argument(
        'logfile', nargs='+',
        help='log files; pass several (app.log main.log) to merge them into one timeline',
    )
    ap.add_argument('-o', '--output', help='output HTML path (default: alongside the first log file)')
    ap.add_argument(
        '--mask-fields', default='preview',
        help=(
            "Comma-separated, case-insensitive substrings of JSON field names to mask "
            "inside request/response bodies (e.g. a 'pdf_preview' field is masked when "
            "this includes 'preview'). Pass '' to disable masking. Default: 'preview'."
        ),
    )
    args = ap.parse_args()

    mask_fields = [s.strip().lower() for s in args.mask_fields.split(',') if s.strip()]

    log_paths = [Path(p) for p in args.logfile]
    entries = sorted(
        (e for p in log_paths for e in parse_log(p)),
        key=lambda e: e['ts'],
    )
    if not entries:
        print('No lines matched the expected log format.', file=sys.stderr)
        sys.exit(1)

    requests_ = enrich(entries, mask_fields)
    summary = build_summary(entries, requests_)
    timeline = build_timeline(entries)

    out_path = Path(args.output) if args.output else log_paths[0].with_suffix('.html')
    html = render_html(entries, requests_, summary, timeline, ' + '.join(p.name for p in log_paths))
    out_path.write_text(html, encoding='utf-8')
    print(f'Done: {out_path} ({len(entries)} entries, {len(requests_)} HTTP requests)')


if __name__ == '__main__':
    main()
