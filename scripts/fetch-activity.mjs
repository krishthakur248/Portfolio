#!/usr/bin/env node
/**
 * fetch-activity.mjs
 * Fetches public GitHub contribution and LeetCode activity for a user.
 * Run locally: node scripts/fetch-activity.mjs
 * Run in CI:   GITHUB_USERNAME=x LEETCODE_USERNAME=y node scripts/fetch-activity.mjs
 *
 * NO secrets. Uses only public APIs — no password, token, or session cookie.
 * Writes public/data/activity.json only when real data is available.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '..', 'public', 'data', 'activity.json');

const GITHUB_USERNAME   = process.env.GITHUB_USERNAME   || 'krishthakur248';
const LEETCODE_USERNAME = process.env.LEETCODE_USERNAME || 'krishthakur248';

// ── helpers ────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** YYYY-MM-DD, 365 days ago from today */
function yearAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 364);
  return d.toISOString().slice(0, 10);
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

/** level 0-4 from a contribution count */
function level(count, max) {
  if (!count || count <= 0) return 0;
  if (max <= 0) return 1;
  const pct = count / max;
  if (pct < 0.15) return 1;
  if (pct < 0.40) return 2;
  if (pct < 0.70) return 3;
  return 4;
}

/**
 * Compute max streak, current streak, activeDays from a days array.
 * days: [{ date: 'YYYY-MM-DD', count: n }]
 */
function computeStreaks(days) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let maxStreak = 0, curStreak = 0, activeDays = 0;
  let prev = null;
  const todayStr = today();

  for (const d of sorted) {
    if (d.count > 0) {
      activeDays++;
      if (prev) {
        const diff = (new Date(d.date) - new Date(prev)) / 86400000;
        curStreak = diff === 1 ? curStreak + 1 : 1;
      } else {
        curStreak = 1;
      }
      maxStreak = Math.max(maxStreak, curStreak);
      prev = d.date;
    } else {
      // Gap: only reset if it's not today (today might not have activity yet)
      if (d.date !== todayStr) {
        curStreak = 0;
        prev = null;
      }
    }
  }

  // If the last active day wasn't today or yesterday, current streak is 0
  const lastActive = sorted.filter(d => d.count > 0).at(-1)?.date;
  if (lastActive) {
    const gap = (new Date(todayStr) - new Date(lastActive)) / 86400000;
    if (gap > 1) curStreak = 0;
  } else {
    curStreak = 0;
  }

  return { maxStreak, currentStreak: curStreak, activeDays };
}

/** Load previous real data from activity.json (returns null if missing/invalid) */
function loadPreviousData() {
  if (!existsSync(OUT)) return null;
  try {
    const raw = readFileSync(OUT, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {}
  return null;
}

/** Validate a source data object */
function isValidSource(src) {
  if (!src || typeof src !== 'object') return false;
  if (!Array.isArray(src.days) || src.days.length === 0) return false;
  if (typeof src.total !== 'number' || src.total < 0) return false;
  // If total is 0 and all counts are 0, treat as suspicious (failed fetch)
  const hasActivity = src.days.some(d => d.count > 0);
  if (src.total === 0 && !hasActivity) return false;
  return true;
}

// ── GitHub ─────────────────────────────────────────────────────────────────

/**
 * Fetch GitHub public contribution data.
 * Uses the public contributions page (no token needed).
 * Returns { total, activeDays, maxStreak, currentStreak, days } or null.
 */
async function fetchGitHub(username) {
  const start = yearAgo();
  const end   = today();

  // Method 1: GitHub GraphQL public API (unauthenticated — only works for public data)
  // Note: GitHub's GraphQL requires a token for most queries, so we use the contributions SVG/page trick
  // or the public REST contributions-based approach.
  // We'll use the public contributions calendar via a GraphQL proxy or the REST events API.

  // Method 1: Use the public GitHub contributions page via a scraping proxy
  // Try github-contributions-api (public, no token needed)
  try {
    const url = `https://github-contributions-api.jogruber.de/v4/${username}?y=last`;
    console.log(`GitHub: trying ${url}`);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'portfolio-activity-fetcher/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // Response: { total: { [year]: n, lastYear: n }, contributions: [{ date, count, level, color }] }
    const contributions = json.contributions;
    if (!Array.isArray(contributions) || contributions.length === 0) throw new Error('Empty contributions');

    // Filter to rolling last 365 days
    const cutoff = start;
    const days365 = contributions
      .filter(c => c.date >= cutoff && c.date <= end)
      .map(c => ({ date: c.date, count: clamp(c.count, 0, 9999) }));

    if (days365.length === 0) throw new Error('No days in range');

    const total = days365.reduce((s, d) => s + d.count, 0);
    const maxCount = Math.max(...days365.map(d => d.count));
    const daysWithLevel = days365.map(d => ({ ...d, level: level(d.count, maxCount) }));
    const { maxStreak, currentStreak, activeDays } = computeStreaks(days365);

    console.log(`GitHub: ✓ ${total} contributions in last year (${activeDays} active days, streak ${currentStreak})`);
    return { total, activeDays, maxStreak, currentStreak, days: daysWithLevel };
  } catch (err) {
    console.warn(`GitHub method 1 failed: ${err.message}`);
  }

  // Method 2: Alternative public endpoint
  try {
    const url2 = `https://github-contributions-api.deno.dev/${username}.json`;
    console.log(`GitHub: trying fallback ${url2}`);
    const res2 = await fetch(url2, {
      headers: { 'User-Agent': 'portfolio-activity-fetcher/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
    const json2 = await res2.json();
    const contribs = json2.contributions ?? json2.data ?? json2;
    if (!Array.isArray(contribs) || contribs.length === 0) throw new Error('Empty');

    const cutoff = start;
    const days365 = contribs
      .filter(c => (c.date || c.day) >= cutoff && (c.date || c.day) <= end)
      .map(c => ({ date: c.date || c.day, count: clamp(c.count || c.contributionCount || 0, 0, 9999) }));

    if (days365.length === 0) throw new Error('No days in range');

    const total = days365.reduce((s, d) => s + d.count, 0);
    const maxCount = Math.max(...days365.map(d => d.count));
    const daysWithLevel = days365.map(d => ({ ...d, level: level(d.count, maxCount) }));
    const { maxStreak, currentStreak, activeDays } = computeStreaks(days365);

    console.log(`GitHub: ✓ fallback ${total} contributions (${activeDays} active days)`);
    return { total, activeDays, maxStreak, currentStreak, days: daysWithLevel };
  } catch (err) {
    console.warn(`GitHub method 2 failed: ${err.message}`);
  }

  console.error('GitHub: all methods failed');
  return null;
}

// ── LeetCode ───────────────────────────────────────────────────────────────

/**
 * Parse submissionCalendar: a JSON string mapping UTC unix timestamps (seconds) to counts.
 * Returns [{ date: 'YYYY-MM-DD', count }]
 */
function parseSubmissionCalendar(raw) {
  let obj;
  try {
    obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return [];
  }
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj).map(([ts, count]) => ({
    date: new Date(Number(ts) * 1000).toISOString().slice(0, 10),
    count: typeof count === 'number' ? clamp(count, 0, 9999) : 0,
  }));
}

/** Fetch a year's userCalendar from LeetCode public GraphQL */
async function fetchLCYear(username, year) {
  const query = `
    query userProfileCalendar($username: String!, $year: Int) {
      matchedUser(username: $username) {
        userCalendar(year: $year) {
          submissionCalendar
          streak
          totalActiveDays
        }
      }
    }
  `;
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'portfolio-activity-fetcher/1.0',
      'Referer': 'https://leetcode.com',
    },
    body: JSON.stringify({ query, variables: { username, year } }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const cal = json?.data?.matchedUser?.userCalendar;
  if (!cal) throw new Error('No calendar data in response');
  return cal;
}

/** Fetch total solved from LeetCode public GraphQL */
async function fetchLCTotalSolved(username) {
  const query = `
    query userSolvedProblemsCount($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'portfolio-activity-fetcher/1.0',
      'Referer': 'https://leetcode.com',
    },
    body: JSON.stringify({ query, variables: { username } }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const stats = json?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
  if (!Array.isArray(stats)) throw new Error('No stats');
  const all = stats.find(s => s.difficulty === 'All');
  return all?.count ?? null;
}

async function fetchLeetCode(username) {
  const cutoff  = yearAgo();
  const todayStr = today();
  const curYear = new Date().getFullYear();
  const prevYear = curYear - 1;

  // Try direct LeetCode GraphQL first
  let totalSolved = null;
  let allDays = [];
  let lcBlocked = false;

  try {
    // Fetch current and previous year calendars
    const [calCur, calPrev] = await Promise.all([
      fetchLCYear(username, curYear),
      fetchLCYear(username, prevYear),
    ]);

    const daysCur  = parseSubmissionCalendar(calCur.submissionCalendar);
    const daysPrev = parseSubmissionCalendar(calPrev.submissionCalendar);

    // Merge both years, dedupe by date (later entry wins)
    const map = new Map();
    for (const d of [...daysPrev, ...daysCur]) map.set(d.date, d);
    allDays = Array.from(map.values());

    // Try to get totalSolved from same endpoint
    try {
      totalSolved = await fetchLCTotalSolved(username);
      console.log(`LeetCode: ✓ direct GraphQL, totalSolved=${totalSolved}`);
    } catch (e) {
      console.warn(`LeetCode: totalSolved fetch failed: ${e.message}`);
    }
  } catch (err) {
    console.warn(`LeetCode: direct GraphQL failed: ${err.message}`);
    lcBlocked = true;
  }

  // Fallback: alfa-leetcode-api (public wrapper, no auth)
  if (lcBlocked || allDays.length === 0) {
    console.log('LeetCode: trying alfa-leetcode-api fallback...');
    try {
      const [calRes, solvedRes] = await Promise.all([
        fetch(`https://alfa-leetcode-api.onrender.com/${username}/calendar`, {
          headers: { 'User-Agent': 'portfolio-activity-fetcher/1.0' },
          signal: AbortSignal.timeout(20000),
        }),
        fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`, {
          headers: { 'User-Agent': 'portfolio-activity-fetcher/1.0' },
          signal: AbortSignal.timeout(20000),
        }),
      ]);

      if (calRes.ok) {
        const calData = await calRes.json();
        // Response might have submissionCalendar or calendar
        const rawCal = calData?.submissionCalendar ?? calData?.calendar ?? calData;
        if (rawCal) {
          allDays = parseSubmissionCalendar(typeof rawCal === 'string' ? rawCal : JSON.stringify(rawCal));
          console.log(`LeetCode: ✓ alfa fallback calendar, ${allDays.length} days`);
        }
      }

      if (solvedRes.ok && totalSolved === null) {
        const solvedData = await solvedRes.json();
        const s = solvedData?.solvedProblem ?? solvedData?.totalSolved;
        if (typeof s === 'number' && s > 0) {
          totalSolved = s;
          console.log(`LeetCode: ✓ alfa fallback totalSolved=${totalSolved}`);
        }
      }
    } catch (err2) {
      console.error(`LeetCode: alfa fallback also failed: ${err2.message}`);
    }
  }

  if (allDays.length === 0) {
    console.error('LeetCode: no calendar data from any source');
    return null;
  }

  // Filter to rolling last 365 days
  const days365 = allDays.filter(d => d.date >= cutoff && d.date <= todayStr);
  if (days365.length === 0) {
    console.error('LeetCode: no days in the last 365-day window');
    return null;
  }

  const total365 = days365.reduce((s, d) => s + d.count, 0);
  const maxCount = Math.max(...days365.map(d => d.count));
  const sorted = days365.sort((a, b) => a.date.localeCompare(b.date));
  const daysWithLevel = sorted.map(d => ({ ...d, level: level(d.count, maxCount) }));
  const { maxStreak, currentStreak, activeDays } = computeStreaks(sorted);

  console.log(`LeetCode: ✓ ${total365} submissions in last year (${activeDays} active days, streak ${currentStreak}, totalSolved=${totalSolved})`);

  return {
    total: total365,
    activeDays,
    maxStreak,
    currentStreak,
    totalSolved: totalSolved ?? null,
    days: daysWithLevel,
  };
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nfetch-activity.mjs — ${new Date().toISOString()}`);
  console.log(`GitHub username:   ${GITHUB_USERNAME}`);
  console.log(`LeetCode username: ${LEETCODE_USERNAME}\n`);

  const previous = loadPreviousData();

  // Fetch both sources in parallel
  const [githubResult, leetcodeResult] = await Promise.allSettled([
    fetchGitHub(GITHUB_USERNAME),
    fetchLeetCode(LEETCODE_USERNAME),
  ]);

  const githubData   = githubResult.status   === 'fulfilled' ? githubResult.value   : null;
  const leetcodeData = leetcodeResult.status === 'fulfilled' ? leetcodeResult.value : null;

  // Decide what to write for each source
  let finalGithub   = null;
  let finalLeetcode = null;

  if (isValidSource(githubData)) {
    finalGithub = githubData;
  } else {
    console.warn('GitHub: no valid data fetched — keeping previous data if available');
    finalGithub = (previous?.github && isValidSource(previous.github)) ? previous.github : null;
  }

  if (isValidSource(leetcodeData)) {
    finalLeetcode = leetcodeData;
  } else {
    console.warn('LeetCode: no valid data fetched — keeping previous data if available');
    finalLeetcode = (previous?.leetcode && isValidSource(previous.leetcode)) ? previous.leetcode : null;
  }

  // If both are null and there's no previous file, don't create the file
  if (finalGithub === null && finalLeetcode === null && !previous) {
    console.error('\nBoth sources failed and no previous data exists. NOT creating activity.json.');
    process.exit(1);
  }

  const output = {
    updatedAt:  new Date().toISOString(),
    github:    finalGithub,
    leetcode:  finalLeetcode,
  };

  writeFileSync(OUT, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n✓ Written to ${OUT}`);

  if (finalGithub) {
    console.log(`  GitHub:   ${finalGithub.total} contributions, ${finalGithub.activeDays} active days, streak ${finalGithub.currentStreak}`);
  } else {
    console.log('  GitHub:   null (error state)');
  }
  if (finalLeetcode) {
    console.log(`  LeetCode: ${finalLeetcode.total} submissions, totalSolved=${finalLeetcode.totalSolved}, streak ${finalLeetcode.currentStreak}`);
  } else {
    console.log('  LeetCode: null (error state)');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
