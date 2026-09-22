#!/usr/bin/env python3
"""
log_viewer.py — indexes a whole folder of log files into a local SQLite
database and serves a filterable web UI over it (time range, level, logger,
thread, source file, substring/regex search, HTTP status and latency).

Parsing is reused from log_dashboard.py, so both tools understand exactly the
same formats. Only the standard library is used — nothing to install.

Usage:
    python log_viewer.py backend/logs
    python log_viewer.py backend/logs frontend/logs --port 9000
    python log_viewer.py backend/logs --no-browser
    python log_viewer.py backend/logs --rebuild        # throw the index away first
"""
import argparse
import json
import re
import sqlite3
import threading
import webbrowser
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from log_dashboard import enrich, fmt_ts, parse_log

LOG_GLOBS = ('*.log', '*.log.*')
PAGE = Path(__file__).parent / 'viewer_page.html'

SCHEMA = """
CREATE TABLE IF NOT EXISTS files(
    path   TEXT PRIMARY KEY,   -- absolute path, identifies the file on disk
    label  TEXT NOT NULL,      -- path shown in the UI (relative to the scanned root)
    mtime  REAL NOT NULL,
    size   INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS entries(
    id          INTEGER PRIMARY KEY,
    ts          TEXT NOT NULL,     -- display timestamp, 'YYYY-MM-DD HH:MM:SS.mmm'
    ts_ms       INTEGER NOT NULL,  -- epoch ms, used for filtering/bucketing
    level       TEXT NOT NULL,
    logger      TEXT NOT NULL,
    thread      TEXT NOT NULL,
    source      TEXT NOT NULL,     -- files.label
    message     TEXT NOT NULL,
    body        TEXT,
    http_method TEXT,
    http_path   TEXT,
    http_status INTEGER,
    latency_ms  REAL
);
CREATE INDEX IF NOT EXISTS ix_entries_ts ON entries(ts_ms);
CREATE INDEX IF NOT EXISTS ix_entries_source ON entries(source);
CREATE INDEX IF NOT EXISTS ix_entries_level ON entries(level);
"""

INSERT_SQL = """INSERT INTO entries
    (ts, ts_ms, level, logger, thread, source, message, body,
     http_method, http_path, http_status, latency_ms)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"""

# ponytail: one global lock around every DB call instead of a connection pool.
# The server is single-user and queries take milliseconds; revisit only if a
# slow query ever noticeably blocks a concurrent one.
LOCK = threading.Lock()


def connect(db_path):
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    # Python's re is used instead of sqlite's LIKE so 're:' searches get real
    # regex syntax and case-insensitive matching for non-ASCII text as well.
    conn.create_function(
        'regexp', 2,
        lambda pattern, value: value is not None and re.search(pattern, value, re.I) is not None,
    )
    conn.executescript(SCHEMA)
    return conn


# ---------- indexing ----------

def iter_log_files(roots):
    """Yields (absolute path, label) for every log file under the given roots."""
    seen = set()
    for root in roots:
        root = root.resolve()
        candidates = [root] if root.is_file() else sorted({p for g in LOG_GLOBS for p in root.rglob(g)})
        for path in candidates:
            if not path.is_file() or path in seen:
                continue
            seen.add(path)
            label = path.name if path == root else str(path.relative_to(root)).replace('\\', '/')
            yield path, label


def index_folder(conn, roots, mask_fields):
    """Reparses every log file that changed since the last run. Unchanged files
    are skipped, so re-running on a big folder is cheap."""
    indexed, skipped, total_entries = 0, 0, 0
    known = {r['path']: r for r in conn.execute('SELECT path, label, mtime, size FROM files')}
    alive = set()

    for path, label in iter_log_files(roots):
        key = str(path)
        alive.add(key)
        st = path.stat()
        prev = known.get(key)
        if prev and prev['mtime'] == st.st_mtime and prev['size'] == st.st_size:
            skipped += 1
            continue

        entries = parse_log(path)
        enrich(entries, mask_fields)
        rows = []
        for e in entries:
            http = e['http'] or {}
            rows.append((
                fmt_ts(e['ts']), int(e['ts'].timestamp() * 1000),
                e['level'], e['logger'], e['thread'], label,
                e['message'], e['body'],
                http.get('method'), http.get('path'), http.get('status'), http.get('latency_ms'),
            ))
        # a changed file is reindexed whole: log files are small enough that
        # resuming from a byte offset would only buy complexity
        conn.execute('DELETE FROM entries WHERE source = ?', (label,))
        conn.executemany(INSERT_SQL, rows)
        conn.execute(
            'INSERT OR REPLACE INTO files(path, label, mtime, size) VALUES (?,?,?,?)',
            (key, label, st.st_mtime, st.st_size),
        )
        indexed += 1
        total_entries += len(rows)

    for key, row in known.items():          # files deleted or rotated away
        if key not in alive:
            conn.execute('DELETE FROM entries WHERE source = ?', (row['label'],))
            conn.execute('DELETE FROM files WHERE path = ?', (key,))
    conn.commit()
    return {'indexed': indexed, 'skipped': skipped, 'entries': total_entries}


# ---------- querying ----------

def build_where(q):
    """Turns the query string parameters into a WHERE clause + parameters."""
    where, params = [], []

    def multi(param, column):
        values = [v for v in q.get(param, []) if v]
        if values:
            where.append(f'{column} IN ({",".join("?" * len(values))})')
            params.extend(values)

    def num(param, expr):
        raw = (q.get(param) or [''])[0]
        if raw not in ('', None):
            where.append(expr)
            params.append(float(raw))

    num('from', 'ts_ms >= ?')
    num('to', 'ts_ms <= ?')
    multi('level', 'level')
    multi('logger', 'logger')
    multi('thread', 'thread')
    multi('source', 'source')
    num('min_latency', 'latency_ms >= ?')
    if (q.get('errors_only') or [''])[0] == '1':
        where.append('http_status >= 400')

    search = (q.get('q') or [''])[0].strip()
    if search.startswith('re:'):
        pattern = search[3:].strip()
        if pattern:
            re.compile(pattern)  # fail loudly here rather than once per row
            where.append('(message REGEXP ? OR body REGEXP ? OR logger REGEXP ?)')
            params.extend([pattern] * 3)
    elif search:
        like = f'%{search}%'
        where.append('(message LIKE ? OR body LIKE ? OR logger LIKE ? OR thread LIKE ?)')
        params.extend([like] * 4)

    return ('WHERE ' + ' AND '.join(where)) if where else '', params


def bucket_size_ms(span_ms, target_buckets=60):
    """Picks a round bucket width so the timeline holds ~target_buckets bars."""
    raw = max(span_ms / target_buckets, 1000)
    for step in (1000, 5000, 15000, 60000, 300000, 900000, 3600000, 21600000, 86400000):
        if raw <= step:
            return step
    return 86400000 * max(1, round(raw / 86400000))


def query_entries(conn, q):
    clause, params = build_where(q)
    limit = min(int((q.get('limit') or ['100'])[0]), 1000)
    offset = max(int((q.get('offset') or ['0'])[0]), 0)
    order = 'DESC' if (q.get('order') or ['asc'])[0] == 'desc' else 'ASC'
    http_clause = f'{clause} AND' if clause else 'WHERE'

    with LOCK:
        total, t0, t1 = conn.execute(
            f'SELECT COUNT(*), MIN(ts_ms), MAX(ts_ms) FROM entries {clause}', params
        ).fetchone()
        levels = {r[0]: r[1] for r in conn.execute(
            f'SELECT level, COUNT(*) FROM entries {clause} GROUP BY level', params
        )}
        rows = [dict(r) for r in conn.execute(
            f'SELECT ts, level, logger, thread, source, message, body, http_method, '
            f'http_path, http_status, latency_ms FROM entries {clause} '
            f'ORDER BY ts_ms {order}, id {order} LIMIT ? OFFSET ?',
            params + [limit, offset],
        )]
        requests_ = [dict(r) for r in conn.execute(
            f'SELECT ts, http_method, http_path, http_status, latency_ms FROM entries '
            f'{http_clause} http_status IS NOT NULL '
            f'ORDER BY latency_ms IS NULL, latency_ms DESC LIMIT 300',
            params,
        )]

        timeline = {'labels': [], 'series': {}, 'bucket_seconds': 1, 'start_ms': t0}
        if total:
            bucket = bucket_size_ms(t1 - t0)
            counts = conn.execute(
                f'SELECT (ts_ms - ?) / ? AS bkt, level, COUNT(*) FROM entries {clause} '
                f'GROUP BY bkt, level',
                [t0, bucket] + params,
            ).fetchall()
            n = int((t1 - t0) // bucket) + 1
            series = {lvl: [0] * n for lvl in levels}
            for bkt, level, count in counts:
                series[level][min(int(bkt), n - 1)] = count
            timeline = {
                'labels': [
                    datetime.fromtimestamp((t0 + i * bucket) / 1000).strftime('%Y-%m-%d %H:%M:%S')
                    for i in range(n)
                ],
                'series': series,
                'bucket_seconds': bucket / 1000,
                'start_ms': t0,
            }

    latencies = [r['latency_ms'] for r in requests_ if r['latency_ms'] is not None]
    return {
        'total': total, 'rows': rows, 'levels': levels, 'timeline': timeline,
        'requests': requests_, 'limit': limit, 'offset': offset,
        'range': {'from': t0, 'to': t1},
        'avg_latency': round(sum(latencies) / len(latencies), 1) if latencies else None,
        'http_errors': sum(1 for r in requests_ if (r['http_status'] or 0) >= 400),
    }


def query_facets(conn):
    """Distinct values for the filter dropdowns, most frequent first."""
    def facet(column):
        return [
            {'value': r[0], 'count': r[1]}
            for r in conn.execute(
                f'SELECT {column}, COUNT(*) c FROM entries GROUP BY {column} ORDER BY c DESC'
            )
        ]

    with LOCK:
        total, t0, t1 = conn.execute(
            'SELECT COUNT(*), MIN(ts_ms), MAX(ts_ms) FROM entries'
        ).fetchone()
        files = [dict(r) for r in conn.execute(
            'SELECT label, size, mtime FROM files ORDER BY label'
        )]
        return {
            'levels': facet('level'), 'loggers': facet('logger'),
            'threads': facet('thread'), 'sources': facet('source'),
            'files': files, 'total': total, 'range': {'from': t0, 'to': t1},
        }


# ---------- server ----------

class Handler(BaseHTTPRequestHandler):
    conn = None
    roots = ()
    mask_fields = ()

    def do_GET(self):
        url = urlparse(self.path)
        try:
            if url.path == '/':
                return self._send(PAGE.read_bytes(), 'text/html; charset=utf-8')
            if url.path == '/api/facets':
                return self._json(query_facets(self.conn))
            if url.path == '/api/entries':
                return self._json(query_entries(self.conn, parse_qs(url.query)))
            if url.path == '/api/reindex':
                with LOCK:
                    stats = index_folder(self.conn, self.roots, self.mask_fields)
                return self._json(stats)
        except re.error as exc:
            return self._json({'error': f'Invalid regex: {exc}'}, status=400)
        except Exception as exc:  # surfaced in the UI instead of a blank page
            return self._json({'error': f'{type(exc).__name__}: {exc}'}, status=500)
        self.send_error(404)

    def _json(self, payload, status=200):
        self._send(json.dumps(payload, ensure_ascii=False, default=str).encode('utf-8'),
                   'application/json; charset=utf-8', status)

    def _send(self, body, content_type, status=200):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass  # the console shows the indexing summary, not every request


def main():
    ap = argparse.ArgumentParser(description='Index a folder of logs and browse them in the browser')
    ap.add_argument('folder', nargs='+', help='folders (or single files) with logs')
    ap.add_argument('--db', default=str(Path(__file__).parent / 'log_index.db'),
                    help='SQLite index file (default: log_index.db next to this script)')
    ap.add_argument('--port', type=int, default=8777)
    ap.add_argument('--rebuild', action='store_true',
                    help='delete the index and parse everything again')
    ap.add_argument('--no-browser', action='store_true')
    ap.add_argument('--mask-fields', default='preview',
                    help="comma-separated substrings of JSON field names to mask in bodies "
                         "(same as log_dashboard.py; pass '' to disable)")
    args = ap.parse_args()

    roots = [Path(f) for f in args.folder]
    missing = [str(r) for r in roots if not r.exists()]
    if missing:
        ap.error(f'not found: {", ".join(missing)}')

    db_path = Path(args.db)
    if args.rebuild and db_path.exists():
        db_path.unlink()

    mask_fields = [s.strip().lower() for s in args.mask_fields.split(',') if s.strip()]
    conn = connect(db_path)
    stats = index_folder(conn, roots, mask_fields)
    total = conn.execute('SELECT COUNT(*) FROM entries').fetchone()[0]
    print(f'Indexed {stats["indexed"]} file(s), {stats["skipped"]} unchanged '
          f'— {total} entries in {db_path}')

    Handler.conn, Handler.roots, Handler.mask_fields = conn, roots, mask_fields
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    url = f'http://127.0.0.1:{args.port}/'
    print(f'Serving {url}  (Ctrl+C to stop)')
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nBye')


if __name__ == '__main__':
    main()
