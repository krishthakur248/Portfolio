import React, { useState, useEffect, useRef } from 'react';
import { useClock } from './hooks/useClock.js';
import { getGuiConfigSync as getGuiConfig } from '../services/dataService.js';
import useWindowStore from './store/useWindowStore.js';
import { RotateCcw, XCircle } from 'lucide-react';
import styles from '../styles/gui/MenuBar.module.css';

/**
 * MenuBar — fixed top bar with name, menus (including Reset Layout), and clock.
 * switchMode: function from App to go back to CLI or landing.
 */
export default function MenuBar({ switchMode, activeAppTitle }) {
  const { time, date } = useClock();
  const gui = getGuiConfig();
  const name = gui.menuBarName ?? 'Krish Thakur';

  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);
  const { openWindows, closeApp } = useWindowStore();

  function handleSwitchCLI() {
    switchMode('cli');
  }

  // Click outside listener for menu dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    }
    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

  function handleResetLayout() {
    window.dispatchEvent(new CustomEvent('portfolio:resetLayout'));
    setActiveMenu(null);
  }

  function handleCloseAll() {
    openWindows.forEach((w) => closeApp(w.id));
    setActiveMenu(null);
  }

  return (
    <nav className={styles.menuBar} role="navigation" aria-label="Menu bar">
      <div className={styles.left}>
        <span className={styles.appName}>{name}</span>
        <div className={styles.menus} ref={menuRef}>
          <div className={styles.menuItemWrapper}>
            <button
              className={styles.menuItem}
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'window' ? null : 'window')}
              aria-expanded={activeMenu === 'window'}
              aria-haspopup="true"
            >
              Window
            </button>
            {activeMenu === 'window' && (
              <div className={styles.menuDropdown} role="menu">
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={handleResetLayout}
                  role="menuitem"
                >
                  <RotateCcw size={12} />
                  <span>Reset Desktop Layout</span>
                </button>
                {openWindows.length > 0 && (
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={handleCloseAll}
                    role="menuitem"
                  >
                    <XCircle size={12} />
                    <span>Close All Windows</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            className={styles.menuItem}
            type="button"
            onClick={handleResetLayout}
            title="Reset Widgets and Icons to Default Layout"
          >
            Reset Layout
          </button>

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
