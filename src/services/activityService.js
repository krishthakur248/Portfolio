/**
 * activityService.js
 * Fetches /data/activity.json (produced by scripts/fetch-activity.mjs).
 * Caches in memory. Returns typed loading/error/success states.
 * No secrets, no direct API calls — browser only reads the static JSON file.
 */

const BASE = import.meta.env.BASE_URL ?? '/';
const ACTIVITY_URL = `${BASE}data/activity.json`.replace(/\/\//g, '/');

/** In-memory cache */
let _cache = null;
let _promise = null;

/** Validate a source entry (github or leetcode) */
function validateSource(src) {
  if (src === null) return null; // explicit null = fetch failed for this source
  if (typeof src !== 'object') return 'invalid';
  if (!Array.isArray(src.days) || src.days.length === 0) return 'invalid';
  if (typeof src.total !== 'number' || src.total < 0) return 'invalid';
  for (const d of src.days) {
    if (typeof d.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return 'invalid';
    if (typeof d.count !== 'number' || d.count < 0) return 'invalid';
    if (typeof d.level !== 'number' || d.level < 0 || d.level > 4) return 'invalid';
  }
  return 'ok';
}

/**
 * Fetches and validates activity.json.
 * Returns the parsed object or throws.
 */
async function fetchActivity() {
  const res = await fetch(ACTIVITY_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  if (!raw || typeof raw !== 'object') throw new Error('Invalid JSON structure');
  return raw;
}

/**
 * Returns a Promise that resolves to:
 * {
 *   github:   { status: 'ok', data: {...} } | { status: 'error', reason: string } | { status: 'null' }
 *   leetcode: { status: 'ok', data: {...} } | { status: 'error', reason: string } | { status: 'null' }
 *   updatedAt: string | null
 * }
 */
export async function getActivity() {
  if (_cache) return _cache;
  if (_promise) return _promise;

  _promise = (async () => {
    try {
      const raw = await fetchActivity();

      const wrap = (src, name) => {
        const v = validateSource(src);
        if (v === null) return { status: 'null', reason: `${name} data was not available when last fetched` };
        if (v === 'invalid') return { status: 'error', reason: `${name} data failed validation` };
        return { status: 'ok', data: src };
      };

      const result = {
        updatedAt: raw.updatedAt ?? null,
        github:    wrap(raw.github,   'GitHub'),
        leetcode:  wrap(raw.leetcode, 'LeetCode'),
      };
      _cache = result;
      return result;
    } catch (err) {
      // activity.json is missing or unreadable
      const errResult = {
        updatedAt: null,
        github:    { status: 'error', reason: 'activity.json not found — run the fetch script first' },
        leetcode:  { status: 'error', reason: 'activity.json not found — run the fetch script first' },
      };
      return errResult;
    } finally {
      _promise = null;
    }
  })();

  return _promise;
}

/** Invalidate the cache (useful for hot-reload in dev) */
export function invalidateActivityCache() {
  _cache = null;
  _promise = null;
}
