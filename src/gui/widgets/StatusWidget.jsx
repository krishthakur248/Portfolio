import React from 'react';
import { Mail } from 'lucide-react';
import useWindowStore from '../store/useWindowStore.js';
import { getWidgetsDataSync } from '../../services/dataService.js';
import styles from '../../styles/gui/Widgets.module.css';

export default function StatusWidget() {
  const { openApp } = useWindowStore();
  const widgetsData = getWidgetsDataSync();
  const status = widgetsData?.status ?? {
    badge: 'STATUS',
    headline: 'Open to Roles',
    label: 'Full-stack / Android',
    sub: 'Chitkara · CGPA 9.94',
    appTarget: 'contact',
  };

  function handleClick() {
    if (status.appTarget) {
      openApp(status.appTarget);
    }
  }

  return (
    <div
      className={`${styles.glassCard} ${styles.smallCard}`}
      onClick={handleClick}
      title="Open Contact Dialog"
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
        <span
          className={styles.badgePill}
          style={{
            color: '#60a5fa',
            borderColor: 'rgba(96,165,250,0.35)',
            background: 'rgba(96,165,250,0.15)',
          }}
        >
          {status.badge}
        </span>
        <Mail size={16} className={styles.cardIcon} />
      </div>

      <div>
        <div className={styles.cardBigStat} style={{ fontSize: '18px', fontWeight: 600 }}>
          {status.headline}
        </div>
        <div className={styles.cardLabel}>{status.label}</div>
        <div className={styles.cardSub}>{status.sub}</div>
      </div>
    </div>
  );
}

