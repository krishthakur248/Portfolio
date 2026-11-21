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

/**
 * Force-refresh activity data by re-fetching activity.json with cache-busting.
 * Clears the in-memory cache first, then fetches fresh data.
 * Returns the same shape as getActivity().
 */
export async function refreshActivity() {
  console.log('[activityService] refreshActivity() called');
  _cache = null;
  _promise = null;

  // In dev mode: call the Vite server middleware to actually re-run the fetch script
  // so activity.json gets fresh API data before we re-read it.
  if (import.meta.env.DEV) {
    try {
      console.log('[activityService] DEV mode — calling /api/refresh-activity to re-run fetch script...');
      const r = await fetch('/api/refresh-activity', { method: 'POST' });
      const json = await r.json();
      console.log('[activityService] fetch script result:', json);
    } catch (err) {
      console.warn('[activityService] /api/refresh-activity failed (continuing anyway):', err.message);
    }
  }

  const wrap = (src, name) => {
    const v = validateSource(src);
    if (v === null) return { status: 'null', reason: `${name} data was not available when last fetched` };
    if (v === 'invalid') return { status: 'error', reason: `${name} data failed validation` };
    return { status: 'ok', data: src };
  };

  try {
    const bustUrl = `${ACTIVITY_URL}?t=${Date.now()}`;
    console.log('[activityService] fetching:', bustUrl);
    const res = await fetch(bustUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
    });
    console.log('[activityService] fetch response status:', res.status);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    console.log('[activityService] parsed JSON, updatedAt=', raw?.updatedAt);
    if (!raw || typeof raw !== 'object') throw new Error('Invalid JSON');

    const result = {
      updatedAt: raw.updatedAt ?? null,
      github:    wrap(raw.github,   'GitHub'),
      leetcode:  wrap(raw.leetcode, 'LeetCode'),
    };
    console.log('[activityService] github status=', result.github.status, 'leetcode status=', result.leetcode.status);
    _cache = result;
    return result;
  } catch (err) {
    console.error('[activityService] refreshActivity failed:', err.message);
    return getActivity();
  }
}
