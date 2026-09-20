// Search over resume names: substring matches first, then close-enough fuzzy
// matches ranked by edit distance, so a typo still finds the resume.

/**
 * Levenshtein distance between two strings, with a rolling two-row matrix.
 */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, substitution);
    }
    previous = current;
  }

  return previous[b.length];
}

// Smallest edit distance between the query and any window of `text` the same
// length. Lets a short query match a long name without being penalised for
// everything it does not cover.
function bestWindowDistance(text: string, query: string): number {
  if (query.length >= text.length) {
    return editDistance(text, query);
  }

  let best = Number.POSITIVE_INFINITY;
  for (let start = 0; start + query.length <= text.length; start += 1) {
    best = Math.min(
      best,
      editDistance(text.slice(start, start + query.length), query),
    );
    if (best === 0) break;
  }
  return best;
}

/**
 * Relevance of `name` for `query`. Lower is better; `null` means "no match".
 * Exact substring hits score below every fuzzy hit, and among substring hits an
 * earlier position wins.
 */
export function searchScore(name: string, query: string): number | null {
  const haystack = name.trim().toLowerCase();
  const needle = query.trim().toLowerCase();

  if (needle === '') return 0;

  const index = haystack.indexOf(needle);
  if (index >= 0) {
    return index / (haystack.length + 1);
  }

  const distance = bestWindowDistance(haystack, needle);
  // Allow roughly one typo per three characters typed, at least one.
  const tolerance = Math.max(1, Math.floor(needle.length / 3));
  return distance <= tolerance ? 1 + distance : null;
}

/**
 * Keeps the resumes whose name matches `query` and sorts them by relevance.
 * An empty query returns `items` untouched (the backend's own ordering).
 */
export function searchByName<T>(
  items: T[],
  query: string,
  nameOf: (item: T) => string,
): T[] {
  if (query.trim() === '') return items;

  const matches: { item: T; index: number; score: number }[] = [];
  items.forEach((item, index) => {
    const score = searchScore(nameOf(item), query);
    if (score !== null) {
      matches.push({ item, index, score });
    }
  });

  return matches
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((entry) => entry.item);
}
