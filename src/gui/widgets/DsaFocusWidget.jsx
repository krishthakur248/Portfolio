import React, { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';
import { getWidgetsDataSync } from '../../services/dataService.js';
import styles from '../../styles/gui/Widgets.module.css';

export default function DsaFocusWidget() {
  const widgetsData = getWidgetsDataSync();
  const dsa = widgetsData?.dsaFocus ?? {
    badge: 'DSA FOCUS',
    stat: '600+',
    label: 'LeetCode Solved',
    sub: 'Arrays · Trees · Graphs',
    url: 'https://leetcode.com/krishthakur248',
  };

  // Display cached live count if available, otherwise fallback to static stat
  const [count, setCount] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('leetcode_total_solved');
        if (cached && !isNaN(Number(cached)) && Number(cached) > 0) {
          return cached;
        }
      } catch (e) {}
    }
    return dsa.stat;
  });

  // Fetch live LeetCode solved count on mount
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchLiveCount() {
      // Primary proxy endpoint
      try {
        const res = await fetch('https://leetcode-stats-api.herokuapp.com/krishthakur248', {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.totalSolved === 'number' && data.totalSolved > 0) {
            if (isMounted) {
              const liveSolved = String(data.totalSolved);
              setCount(liveSolved);
              try {
                localStorage.setItem('leetcode_total_solved', liveSolved);
              } catch (e) {}
            }
            return;
          }
        }
      } catch (err) {
        // Silently continue to fallback endpoint
      }

      // Secondary fallback proxy endpoint
      try {
        const res2 = await fetch('https://alfa-leetcode-api.onrender.com/krishthakur248/solved', {
          signal: controller.signal,
        });
        if (res2.ok) {
          const data2 = await res2.json();
          const solved = data2?.solvedProblem ?? data2?.totalSolved;
          if (typeof solved === 'number' && solved > 0 && isMounted) {
            const liveSolved = String(solved);
            setCount(liveSolved);
            try {
              localStorage.setItem('leetcode_total_solved', liveSolved);
            } catch (e) {}
          }
        }
      } catch (err) {
        // Keeps fallback count from demoData.json
      }
    }

    fetchLiveCount();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  function handleClick() {
    if (dsa.url) {
      window.open(dsa.url, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div
      className={`${styles.glassCard} ${styles.smallCard}`}
      onClick={handleClick}
      title="Open LeetCode Profile"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={styles.cardTopBadge}>
        <span className={styles.badgePill}>{dsa.badge}</span>
        <Code2 size={16} className={styles.cardIcon} aria-hidden="true" />
      </div>

      <div>
        <div className={styles.cardBigStat}>{count}</div>
        <div className={styles.cardLabel}>{dsa.label}</div>
        <div className={styles.cardSub}>{dsa.sub}</div>
      </div>
    </div>
  );
}
