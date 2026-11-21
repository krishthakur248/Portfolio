/**
 * leetcodeService.js
 *
 * Previously made browser-side calls to external LeetCode proxy APIs
 * which are blocked by CORS on the deployed site.
 *
 * Now sources data exclusively from activity.json (same-origin static file),
 * which is updated daily by the GitHub Actions workflow.
 *
 * All existing consumers (useLeetCodeCount, getCachedLeetCodeCount) keep
 * the same public API so no call-site changes are needed.
 */

import { useState, useEffect } from 'react';
import { getActivity, refreshActivity as refreshActivityData } from './activityService.js';

export const DEFAULT_LEETCODE_COUNT = '600+';
const STORAGE_KEY = 'leetcode_total_solved_v2'; // bumped to avoid stale old-API cached values

/** Persist to localStorage so other tabs and CLI commands see it instantly */
function persistCount(count) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, String(count)); } catch {}
  try {
    window.dispatchEvent(new CustomEvent('portfolio:leetcodeUpdated', { detail: String(count) }));
  } catch {}
}

/**
 * Returns the last-known LeetCode solved count from localStorage,
 * or DEFAULT_LEETCODE_COUNT if nothing valid is stored.
 */
export function getCachedLeetCodeCount() {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached && !isNaN(Number(cached)) && Number(cached) > 0) return cached;
    } catch {}
  }
  return DEFAULT_LEETCODE_COUNT;
}

/**
 * Fetches the LeetCode solved count from activity.json (same-origin, no CORS issues).
 * Persists to localStorage and broadcasts an event so all components update.
 */
export async function fetchLeetCodeCount(forceRefresh = false) {
  try {
    const fetcher = forceRefresh ? refreshActivityData : getActivity;
    const activity = await fetcher();
    const lc = activity?.leetcode;
    if (lc?.status === 'ok' && typeof lc.data?.totalSolved === 'number' && lc.data.totalSolved > 0) {
      const count = String(lc.data.totalSolved);
      persistCount(count);
      return count;
    }
  } catch {}
  return getCachedLeetCodeCount();
}

/**
 * React hook — returns the LeetCode solved count.
 * Initialises from localStorage immediately (no flash), loads from
 * activity.json on mount, and updates when new data is broadcast.
 */
export function useLeetCodeCount() {
  const [count, setCount] = useState(() => getCachedLeetCodeCount());

  useEffect(() => {
    let isMounted = true;

    function handleUpdate(e) {
      if (isMounted && e.detail) setCount(String(e.detail));
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('portfolio:leetcodeUpdated', handleUpdate);
    }

    fetchLeetCodeCount().then((live) => {
      if (isMounted && live) setCount(String(live));
    });

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('portfolio:leetcodeUpdated', handleUpdate);
      }
    };
  }, []);

  return count;
}
