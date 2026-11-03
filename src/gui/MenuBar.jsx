import React from 'react';
import { useClock } from './hooks/useClock.js';
import { getGuiConfigSync as getGuiConfig } from '../services/dataService.js';
import styles from '../styles/gui/MenuBar.module.css';

/**
 * MenuBar — fixed top bar with name, static menus, clock.
 * switchMode: function from App to go back to CLI or landing.
 */
export default function MenuBar({ switchMode, activeAppTitle }) {
  const { time, date } = useClock();
  const gui = getGuiConfig();
  const name = gui.menuBarName ?? 'Krish Thakur';

  function handleSwitchCLI() {
    switchMode('cli');
  }

  return (
    <nav className={styles.menuBar} role="navigation" aria-label="Menu bar">
      <div className={styles.left}>
        <span className={styles.appName}>{name}</span>
        <div className={styles.menus}>
          <button className={styles.menuItem} type="button">File</button>
          <button className={styles.menuItem} type="button">View</button>
          <button className={styles.menuItem} type="button">Window</button>
          {activeAppTitle && (
            <span style={{ color: 'var(--gui-text-muted)', fontSize: 13 }}>
              — {activeAppTitle}
            </span>
          )}
        </div>
      </div>
      <div className={styles.right}>
        <span className={styles.date}>{date}</span>
        <span className={styles.clock}>{time}</span>
        <button
          className={styles.switchBtn}
          onClick={handleSwitchCLI}
          type="button"
          aria-label="Switch to CLI mode"
        >
          &gt;_ CLI
        </button>
      </div>
    </nav>
  );
}
