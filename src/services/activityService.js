/**
 * activityService.js
 *
 * getActivity()     — reads static /data/activity.json (cold-start cache, updated by GitHub Actions daily)
 * refreshActivity() — always fetches GitHub + LeetCode APIs directly from the browser (both DEV and PROD)
 *
 * Both DEV and PROD use live browser-side API calls so activity.json is never written
 * locally, eliminating merge conflicts between local dev and GitHub Actions commits.
 */

const BASE = import.meta.env.BASE_URL ?? '/';
const ACTIVITY_URL = `${BASE}data/activity.json`.replace(/\/\//g, '/');

const GITHUB_USER   = 'krishthakur248';
const LEETCODE_USER = 'krishthakur248';

/** In-memory cache */
let _cache   = null;
let _promise = null;

/**
 * Auto-refresh promise — created once per page load.
 * Both heatmaps share this same promise so only ONE API fetch happens on mount,
 * not two parallel fetches. Resets on every page load/refresh automatically
 * since it's a module-level variable (not persisted to storage).
 */
let _autoRefreshPromise = null;

/**
 * Called by heatmaps on mount. Triggers refreshActivity() once per page load
 * (shared across both GitHub and LeetCode widgets). Same code path in DEV and PROD —
 * both fetch live APIs from the browser. activity.json is only a cold-start fallback.
 */
export function getInitialActivity() {
  // Auto-refresh from live APIs once per page load, shared across both widgets
  if (!_autoRefreshPromise) {
    console.log('[activityService] Auto-refresh triggered on page load...');
    _autoRefreshPromise = refreshActivity();
  }
  return _autoRefreshPromise;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateSource(src) {
  if (src === null) return null;
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

function wrap(src, name) {
  const v = validateSource(src);
  if (v === null) return { status: 'null', reason: `${name} data was not available` };
  if (v === 'invalid') return { status: 'error', reason: `${name} data failed validation` };
  return { status: 'ok', data: src };
}

// ─── Static file reader ───────────────────────────────────────────────────────

async function fetchStaticFile() {
  const bustUrl = `${ACTIVITY_URL}?t=${Date.now()}`;
  const res = await fetch(bustUrl, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  if (!raw || typeof raw !== 'object') throw new Error('Invalid JSON');
  return raw;
}

// ─── Browser-side live API fetchers (used in PROD) ───────────────────────────

function computeLevel(count, max) {
  if (!count || count <= 0) return 0;
  if (max <= 0) return 1;
  const pct = count / max;
  if (pct < 0.15) return 1;
  if (pct < 0.40) return 2;
  if (pct < 0.70) return 3;
  return 4;
}

function computeStreaks(days) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const todayStr = new Date().toISOString().slice(0, 10);
  let maxStreak = 0, curStreak = 0, activeDays = 0, prev = null;
  for (const d of sorted) {
    if (d.count > 0) {
      activeDays++;
      if (prev) {
        const diff = (new Date(d.date) - new Date(prev)) / 86400000;
        curStreak = diff === 1 ? curStreak + 1 : 1;
      } else { curStreak = 1; }
      maxStreak = Math.max(maxStreak, curStreak);
      prev = d.date;
    } else {
      if (d.date !== todayStr) { curStreak = 0; prev = null; }
    }
  }
  const lastActive = sorted.filter(d => d.count > 0).at(-1)?.date;
  if (lastActive && (new Date(todayStr) - new Date(lastActive)) / 86400000 > 1) curStreak = 0;
  else if (!lastActive) curStreak = 0;
  return { maxStreak, currentStreak: curStreak, activeDays };
}

/** Fetch GitHub contributions directly from browser (jogruber API has CORS headers) */
async function browserFetchGitHub() {
  const today   = new Date().toISOString().slice(0, 10);
  const yearAgo = new Date(Date.now() - 364 * 86400000).toISOString().slice(0, 10);

  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`,
    { signal: AbortSignal.timeout(15000) }
  );
  if (!res.ok) throw new Error(`GitHub API HTTP ${res.status}`);
  const json = await res.json();

  const contribs = Array.isArray(json.contributions) ? json.contributions : [];
  const days365 = contribs
    .filter(c => c.date >= yearAgo && c.date <= today)
    .map(c => ({ date: c.date, count: Math.max(0, c.count || 0), level: c.level ?? 0 }));

  if (days365.length === 0) throw new Error('GitHub: no days in range');

  const total = days365.reduce((s, d) => s + d.count, 0);
  const { maxStreak, currentStreak, activeDays } = computeStreaks(days365);
  console.log(`[browser] GitHub: ${total} contributions, streak ${currentStreak}`);
  return { total, activeDays, maxStreak, currentStreak, days: days365 };
}

/** Parse unix-timestamp → {date, count} from LeetCode submissionCalendar */
function parseLC(raw) {
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Object.entries(obj).map(([ts, count]) => ({
      date:  new Date(Number(ts) * 1000).toISOString().slice(0, 10),
      count: Number(count) || 0,
    }));
  } catch { return []; }
}

/** Fetch LeetCode via alfa-leetcode-api (CORS-friendly wrapper) */
async function tryAlfaApi() {
  const base = `https://alfa-leetcode-api.onrender.com/${LEETCODE_USER}`;
  const [calRes, solvedRes] = await Promise.all([
    fetch(`${base}/calendar`,  { signal: AbortSignal.timeout(12000) }),
    fetch(`${base}/solved`,    { signal: AbortSignal.timeout(12000) }),
  ]);

  // Throw on rate-limit or server error so the caller's catch triggers the fallback
  if (!calRes.ok) throw new Error(`alfa-api calendar HTTP ${calRes.status}`);

  const d = await calRes.json();
  const raw = d?.submissionCalendar ?? d?.calendar;
  const days = parseLC(raw);

  let totalSolved = null;
  if (solvedRes.ok) {
    const sd = await solvedRes.json();
    totalSolved = sd?.solvedProblem ?? sd?.totalSolved ?? null;
  }

  return { days, totalSolved };
}

/** Fetch LeetCode via corsproxy → leetcode.com GraphQL (fallback) */
async function tryCorsproxy() {
  const curYear  = new Date().getFullYear();
  const prevYear = curYear - 1;
  const q = (year) => JSON.stringify({
    query: `query($u:String!,$y:Int){matchedUser(username:$u){userCalendar(year:$y){submissionCalendar}submitStatsGlobal{acSubmissionNum{difficulty count}}}}`,
    variables: { u: LEETCODE_USER, y: year },
  });

  const proxy = 'https://corsproxy.io/?url=https://leetcode.com/graphql';
  const opts = (year) => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-cors-api-key': 'temp_' },
    body: q(year),
    signal: AbortSignal.timeout(15000),
  });

  const [rCur, rPrev] = await Promise.all([
    fetch(proxy, opts(curYear)),
    fetch(proxy, opts(prevYear)),
  ]);

  let days = [];
  let totalSolved = null;

  for (const r of [rCur, rPrev]) {
    if (!r.ok) continue;
    const json = await r.json();
    const cal  = json?.data?.matchedUser?.userCalendar?.submissionCalendar;
    if (cal) days = [...days, ...parseLC(cal)];
    if (!totalSolved) {
      const stats = json?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
      const all   = Array.isArray(stats) ? stats.find(s => s.difficulty === 'All') : null;
      if (all?.count) totalSolved = all.count;
    }
  }

  return { days, totalSolved };
}

async function browserFetchLeetCode() {
  const today   = new Date().toISOString().slice(0, 10);
  const yearAgo = new Date(Date.now() - 364 * 86400000).toISOString().slice(0, 10);

  let days = [], totalSolved = null;

  // Try alfa API first; fall back to corsproxy → LeetCode GraphQL (PROD only —
  // corsproxy.io blocks localhost origins so we skip it in DEV to avoid console noise)
  try {
    const r = await tryAlfaApi();
    days = r.days; totalSolved = r.totalSolved;
    console.log('[browser] LeetCode: alfa-api ok, days=', days.length);
  } catch (e) {
    if (!import.meta.env.DEV) {
      console.warn('[browser] LeetCode alfa failed:', e.message, '— trying corsproxy...');
      try {
        const r = await tryCorsproxy();
        days = r.days; totalSolved = r.totalSolved;
        console.log('[browser] LeetCode: corsproxy ok, days=', days.length);
      } catch (e2) {
        console.error('[browser] LeetCode corsproxy also failed:', e2.message);
      }
    } else {
      console.warn('[browser] LeetCode alfa failed:', e.message, '— skipping corsproxy in DEV (blocked on localhost)');
    }
  }

  if (days.length === 0) throw new Error('LeetCode: no data from any source');
  // Dedupe by date and filter to rolling year
  const map = new Map();
  for (const d of days) map.set(d.date, d);
  const days365 = Array.from(map.values())
    .filter(d => d.date >= yearAgo && d.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  const maxCount = Math.max(...days365.map(d => d.count), 1);
  const daysWithLevel = days365.map(d => ({ ...d, level: computeLevel(d.count, maxCount) }));
  const total = days365.reduce((s, d) => s + d.count, 0);
  const { maxStreak, currentStreak, activeDays } = computeStreaks(days365);

  console.log(`[browser] LeetCode: ${total} submissions, solved=${totalSolved}, streak ${currentStreak}`);
  return { total, activeDays, maxStreak, currentStreak, totalSolved, days: daysWithLevel };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getActivity() {
  if (_cache) return _cache;
  if (_promise) return _promise;

  _promise = (async () => {
    try {
      const raw    = await fetchStaticFile();
      const result = {
        updatedAt: raw.updatedAt ?? null,
        github:    wrap(raw.github,   'GitHub'),
        leetcode:  wrap(raw.leetcode, 'LeetCode'),
      };
      _cache = result;
      return result;
    } catch {
      return {
        updatedAt: null,
        github:    { status: 'error', reason: 'activity.json not found' },
        leetcode:  { status: 'error', reason: 'activity.json not found' },
      };
    } finally { _promise = null; }
  })();

  return _promise;
}

export function invalidateActivityCache() {
  _cache = null; _promise = null;
}

export async function refreshActivity() {
  _cache = null; _promise = null;

  // Always fetch APIs directly from the browser (both DEV and PROD)
  // activity.json is only a cold-start cache written by GitHub Actions — never written locally.
  console.log('[activityService] Fetching live APIs from browser...');
  const [ghResult, lcResult] = await Promise.allSettled([
    browserFetchGitHub(),
    browserFetchLeetCode(),
  ]);

  // If GitHub also failed, fall back entirely to static file
  if (ghResult.status === 'rejected' && lcResult.status === 'rejected') {
    console.warn('[activityService] Both browser fetches failed, using static file');
    return getActivity();
  }

  // If only LeetCode failed (e.g. 429 + CORS proxy blocked on localhost),
  // fall back to cached activity.json data for LeetCode — keeps the widget working
  // with yesterday's data instead of showing an error.
  let lcData;
  if (lcResult.status === 'fulfilled') {
    lcData = wrap(lcResult.value, 'LeetCode');
  } else {
    console.warn('[activityService] LeetCode live fetch failed, using cached activity.json for LeetCode:', lcResult.reason?.message);
    try {
      const cached = await fetchStaticFile();
      lcData = wrap(cached.leetcode, 'LeetCode');
      console.log('[activityService] LeetCode: using cached data, days=', lcData?.data?.days?.length ?? 0);
    } catch {
      lcData = { status: 'error', reason: lcResult.reason?.message };
    }
  }

  const result = {
    updatedAt: new Date().toISOString(),
    github:   ghResult.status === 'fulfilled' ? wrap(ghResult.value, 'GitHub') : { status: 'error', reason: ghResult.reason?.message },
    leetcode: lcData,
  };
  _cache = result;
  return result;
}
