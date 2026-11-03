import React, { useState, Suspense } from 'react';
import { X } from 'lucide-react';
import registry from './appRegistry.js';
import styles from '../styles/gui/MobileView.module.css';

const ALL_APPS = Object.values(registry).filter((a) => a.id !== 'welcome');

/** Phone-style home screen for viewports under 768px. */
export default function MobileView({ switchMode }) {
  const [activeApp, setActiveApp] = useState(null);

  if (activeApp) {
    const app = registry[activeApp];
    const AppComponent = app.component;
    return (
      <div className={styles.sheet}>
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>{app.title}</span>
          <button
            className={styles.sheetClose}
            onClick={() => setActiveApp(null)}
            aria-label={`Close ${app.title}`}
            type="button"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.sheetBody}>
          <Suspense fallback={<div className={styles.loading}>loading…</div>}>
            <AppComponent winId="mobile" />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.home}>
      <div className={styles.header}>
        <h1 className={styles.name}>Krish Thakur</h1>
        <p className={styles.sub}>Portfolio</p>
      </div>
      <div className={styles.grid} role="list">
        {ALL_APPS.map((app) => (
          <button
            key={app.id}
            className={styles.appIcon}
            onClick={() => setActiveApp(app.id)}
            aria-label={`Open ${app.title}`}
            type="button"
            role="listitem"
          >
            <div className={styles.iconBox}>
              <div className={styles.iconClip}>
                <img
                  src={app.iconSrc}
                  alt=""
                  className={styles.iconImg}
                  draggable={false}
                />
              </div>
            </div>
            <span className={styles.label}>{app.title}</span>
          </button>
        ))}
      </div>
      <button
        className={styles.cliBtn}
        onClick={() => switchMode('cli')}
        type="button"
      >
        &gt;_ Switch to CLI
      </button>
    </div>
  );
}
