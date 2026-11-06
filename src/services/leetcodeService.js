import { useState, useEffect } from 'react';

export const DEFAULT_LEETCODE_COUNT = '600+';
const STORAGE_KEY = 'leetcode_total_solved';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let inFlightPromise = null;
let lastFetchTimestamp = 0;

/**
 * Returns the cached LeetCode solved count from localStorage,
 * or the default fallback '600+' if nothing valid is stored.
 */
export function getCachedLeetCodeCount() {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached && !isNaN(Number(cached)) && Number(cached) > 0) {
        return cached;
      }
    } catch (e) {
      // Storage access blocked or unavailable
    }
  }
  return DEFAULT_LEETCODE_COUNT;
}

/**
 * Fetches the live LeetCode solved count for krishthakur248.
 * Tries the primary proxy first, then the secondary fallback proxy.
 * On success, persists to localStorage and broadcasts to all components.
 * On failure, returns the cached count (or '600+').
 */
export async function fetchLeetCodeCount(force = false) {
  const now = Date.now();
  const cachedVal = getCachedLeetCodeCount();

  if (!force && cachedVal !== DEFAULT_LEETCODE_COUNT && (now - lastFetchTimestamp < CACHE_TTL_MS)) {
    return cachedVal;
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    // 1. Primary proxy endpoint
    try {
      const res = await fetch('https://leetcode-stats-api.herokuapp.com/krishthakur248');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.totalSolved === 'number' && data.totalSolved > 0) {
          const liveSolved = String(data.totalSolved);
          persistCount(liveSolved);
          lastFetchTimestamp = Date.now();
          return liveSolved;
        }
      }
    } catch (err) {
      // Primary proxy failed, proceed to fallback
    }

    // 2. Secondary fallback proxy endpoint
    try {
      const res2 = await fetch('https://alfa-leetcode-api.onrender.com/krishthakur248/solved');
      if (res2.ok) {
        const data2 = await res2.json();
        const solved = data2?.solvedProblem ?? data2?.totalSolved;
        if (typeof solved === 'number' && solved > 0) {
          const liveSolved = String(solved);
          persistCount(liveSolved);
          lastFetchTimestamp = Date.now();
          return liveSolved;
        }
      }
    } catch (err) {
      // Secondary proxy failed
    }

    // 3. Tertiary fallback proxy endpoint
    try {
      const res3 = await fetch('https://leetcode-api-faisalshohag.vercel.app/krishthakur248');
      if (res3.ok) {
        const data3 = await res3.json();
        if (data3 && typeof data3.totalSolved === 'number' && data3.totalSolved > 0) {
          const liveSolved = String(data3.totalSolved);
          persistCount(liveSolved);
          lastFetchTimestamp = Date.now();
          return liveSolved;
        }
      }
    } catch (err) {
      // All API endpoints failed
    }

    return getCachedLeetCodeCount();
  })().finally(() => {
    inFlightPromise = null;
  });

  return inFlightPromise;
}

function persistCount(liveSolved) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, liveSolved);
    } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent('portfolio:leetcodeUpdated', { detail: liveSolved }));
    } catch (e) {}
  }
}

/**
 * React hook that returns the exact live LeetCode solved count.
 * Initializes from cache immediately (or '600+'), fetches in background,
 * and updates when new live data arrives.
 */
export function useLeetCodeCount() {
  const [count, setCount] = useState(() => getCachedLeetCodeCount());

  useEffect(() => {
    let isMounted = true;

    function handleUpdate(e) {
      if (isMounted && e.detail) {
        setCount(String(e.detail));
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('portfolio:leetcodeUpdated', handleUpdate);
    }

    fetchLeetCodeCount().then((live) => {
      if (isMounted && live) {
        setCount(String(live));
      }
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

