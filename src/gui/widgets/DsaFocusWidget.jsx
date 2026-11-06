import React from 'react';
import { Code2 } from 'lucide-react';
import { getWidgetsDataSync } from '../../services/dataService.js';
import { useLeetCodeCount } from '../../services/leetcodeService.js';
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

  const count = useLeetCodeCount();

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
