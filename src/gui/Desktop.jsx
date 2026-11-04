import React, { useState, useEffect, useCallback, useRef } from 'react';
import MenuBar from './MenuBar.jsx';
import Dock from './Dock.jsx';
import DesktopIcon from './DesktopIcon.jsx';
import WindowManager from './WindowManager.jsx';
import WidgetsLayer from './widgets/WidgetsLayer.jsx';
import MobileView from './MobileView.jsx';
import useWindowStore from './store/useWindowStore.js';
import { getDesktopApps } from './appRegistry.js';
import { useIsMobile } from './hooks/useIsMobile.js';
import {
  computeDefaultWidgetPositions,
  resolveDesktopIconPositions,
} from './widgets/widgetLayout.js';
import { RotateCcw, Terminal, FolderGit2 } from 'lucide-react';
import styles from '../styles/gui/Desktop.module.css';

export default function Desktop({ switchMode }) {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  const { openApp, openWindows, getFocusedId } = useWindowStore();
  const isMobile = useIsMobile();
  const desktopApps = getDesktopApps();
  // Desktop icons order: Welcome on top, Experience & Education in the end
  const appIds = ['welcome', 'resume', 'contact', 'experience'];

  // Calculate dynamic collision-free icon positions
  const [iconPositions, setIconPositions] = useState(() => {
    if (typeof window !== 'undefined') {
      const widgetDefaults = computeDefaultWidgetPositions(window.innerWidth, window.innerHeight);
      return resolveDesktopIconPositions(
        window.innerWidth,
        window.innerHeight,
        widgetDefaults,
        appIds
      );
    }
    return {
      welcome:    { x: 1200, y: 60 },
      resume:     { x: 1200, y: 190 },
      contact:    { x: 1200, y: 320 },
      experience: { x: 1200, y: 450 },
    };
  });

  // Re-resolve icon positions on resize
  useEffect(() => {
    function recalc() {
      const widgetDefaults = computeDefaultWidgetPositions(window.innerWidth, window.innerHeight);
      setIconPositions(
        resolveDesktopIconPositions(
          window.innerWidth,
          window.innerHeight,
          widgetDefaults,
          appIds
        )
      );
    }
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  // Listen for widget position changes to keep layout collision-free
  useEffect(() => {
    function handleWidgetMove(e) {
      if (e.detail) {
        setIconPositions(
          resolveDesktopIconPositions(
            window.innerWidth,
            window.innerHeight,
            e.detail,
            appIds
          )
        );
      }
    }
    window.addEventListener('portfolio:widgetPositionsChanged', handleWidgetMove);
    return () => window.removeEventListener('portfolio:widgetPositionsChanged', handleWidgetMove);
  }, []);

  // Open Welcome on first visit
  useEffect(() => {
    if (!localStorage.getItem('gui_welcome_seen')) {
      setTimeout(() => openApp('welcome'), 500);
    }
  }, [openApp]);

  // Esc deselects & closes context menu
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setSelectedIcon(null);
        setContextMenu(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    function handleGlobalClick(e) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    }
    if (contextMenu) {
      document.addEventListener('mousedown', handleGlobalClick);
    }
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, [contextMenu]);

  // Right-click desktop background opens context menu
  function handleContextMenu(e) {
    // If right clicking directly on window or dock, let default or window handler take care
    if (e.target.closest('[role="dialog"]') || e.target.closest('[role="toolbar"]')) return;
    e.preventDefault();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 210),
      y: Math.min(e.clientY, window.innerHeight - 150),
    });
  }

  function handleResetDesktopLayout() {
    window.dispatchEvent(new CustomEvent('portfolio:resetLayout'));
    setContextMenu(null);
  }

  const focusedWin     = openWindows.find((w) => w.id === getFocusedId());
  const activeAppTitle = focusedWin?.title ?? null;

  if (isMobile) return <MobileView switchMode={switchMode} />;

  return (
    <div className={styles.desktop} onContextMenu={handleContextMenu}>
      {/* ── Wallpaper layers ── */}
      <div className={styles.wallpaper} aria-hidden="true" />
      <div className={styles.wallpaperTeal} aria-hidden="true" />
      <div className={styles.wallpaperNoise} aria-hidden="true" />

      {/* ── Menu bar ── */}
      <MenuBar switchMode={switchMode} activeAppTitle={activeAppTitle} />

      {/* ── Glassmorphic Widgets Layer (z-index: 15, sits above desktop icons) ── */}
      <WidgetsLayer switchMode={switchMode} />

      {/* ── Desktop icon area (z-index: 5) ── */}
      <div
        className={styles.iconArea}
        onClick={() => setSelectedIcon(null)}
        role="region"
        aria-label="Desktop"
      >
        <div className={styles.deselect} aria-hidden="true" />

        {desktopApps.map((app) => {
          const pos = iconPositions[app.id] ?? { x: window.innerWidth - 110, y: 60 };
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

      {/* ── Desktop Right-Click Glass Context Menu ── */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className={styles.contextMenu}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
        >
          <button
            type="button"
            className={styles.contextMenuItem}
            onClick={handleResetDesktopLayout}
            role="menuitem"
          >
            <RotateCcw size={14} />
            <span>Reset Desktop Layout</span>
          </button>
          <div className={styles.contextDivider} />
          <button
            type="button"
            className={styles.contextMenuItem}
            onClick={() => {
              openApp('terminal');
              setContextMenu(null);
            }}
            role="menuitem"
          >
            <Terminal size={14} />
            <span>New Terminal</span>
          </button>
          <button
            type="button"
            className={styles.contextMenuItem}
            onClick={() => {
              openApp('projects');
              setContextMenu(null);
            }}
            role="menuitem"
          >
            <FolderGit2 size={14} />
            <span>Open Projects</span>
          </button>
        </div>
      )}

      {/* ── Open windows (z-index: 100+) ── */}
      <WindowManager />

      {/* ── Dock ── */}
      <Dock />
    </div>
  );
}
