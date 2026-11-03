import React, { useState, useEffect, useCallback } from 'react';
import MenuBar from './MenuBar.jsx';
import Dock from './Dock.jsx';
import DesktopIcon from './DesktopIcon.jsx';
import WindowManager from './WindowManager.jsx';
import MobileView from './MobileView.jsx';
import useWindowStore from './store/useWindowStore.js';
import { getDesktopApps } from './appRegistry.js';
import { useIsMobile } from './hooks/useIsMobile.js';
import styles from '../styles/gui/Desktop.module.css';

/*
 * Scattered positions — match the reference: icons in the LEFT column,
 * vertically spaced by ~130px so labels never overlap.
 * Welcome goes top-right (computed on mount to stay responsive).
 */
const DESKTOP_POSITIONS = {
  experience: { x: 36, y: 60  },
  resume:     { x: 36, y: 200 },
  contact:    { x: 36, y: 340 },
  welcome:    { x: null, y: 60 }, // x set at runtime (right side)
};

export default function Desktop({ switchMode }) {
  const [selectedIcon, setSelectedIcon] = useState(null);
  // Lazy initializer reads window.innerWidth immediately so Welcome icon
  // is positioned correctly on the FIRST render — prevents overlap with Experience.
  const [welcomeX, setWelcomeX] = useState(
    () => Math.max(window.innerWidth - 150, 700)
  );
  const { openApp, openWindows, getFocusedId } = useWindowStore();
  const isMobile = useIsMobile();

  // Keep welcome icon pinned near the top-right
  useEffect(() => {
    function calcX() { setWelcomeX(Math.max(window.innerWidth - 150, 700)); }
    calcX();
    window.addEventListener('resize', calcX);
    return () => window.removeEventListener('resize', calcX);
  }, []);

  // Open Welcome on first-ever visit
  useEffect(() => {
    if (!localStorage.getItem('gui_welcome_seen')) {
      setTimeout(() => openApp('welcome'), 500);
    }
  }, [openApp]);

  // Esc deselects
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setSelectedIcon(null); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const focusedWin     = openWindows.find((w) => w.id === getFocusedId());
  const activeAppTitle = focusedWin?.title ?? null;
  const desktopApps    = getDesktopApps();

  if (isMobile) return <MobileView switchMode={switchMode} />;

  return (
    <div className={styles.desktop}>
      {/* ── Wallpaper layers ── */}
      <div className={styles.wallpaper} aria-hidden="true" />
      <div className={styles.wallpaperTeal} aria-hidden="true" />
      <div className={styles.wallpaperNoise} aria-hidden="true" />

      {/* ── Menu bar ── */}
      <MenuBar switchMode={switchMode} activeAppTitle={activeAppTitle} />

      {/* ── Desktop icon area ── */}
      <div
        className={styles.iconArea}
        onClick={() => setSelectedIcon(null)}
        role="region"
        aria-label="Desktop"
      >
        <div className={styles.deselect} aria-hidden="true" />

        {desktopApps.map((app) => {
          let pos = DESKTOP_POSITIONS[app.id] ?? { x: 36, y: 60 };
          if (app.id === 'welcome') pos = { x: welcomeX, y: 60 };
          return (
            <DesktopIcon
              key={app.id}
              id={app.id}
              label={app.title}
              iconSrc={app.iconSrc}
              selected={selectedIcon === app.id}
              onSelect={setSelectedIcon}
              onOpen={() => openApp(app.id)}
              defaultPos={pos}
            />
          );
        })}
      </div>

      {/* ── Open windows ── */}
      <WindowManager />

      {/* ── Dock ── */}
      <Dock />
    </div>
  );
}
