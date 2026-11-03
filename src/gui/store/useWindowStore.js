/**
 * useWindowStore.js — Zustand window-manager store.
 *
 * openWindows: array of window state objects
 * Each window: { id, appId, title, position, size, zIndex, minimized, maximized }
 */

import { create } from 'zustand';
import registry from '../appRegistry.js';

let zCounter = 100;

function makeWindow(appId, overridePos) {
  const app = registry[appId];
  if (!app) return null;

  const vw = typeof window !== 'undefined' ? window.innerWidth  : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const MENU_H = 28;
  const DOCK_H = 88;
  const availH = Math.max(300, vh - MENU_H - DOCK_H);

  // Clamp window dimensions to fit inside the viewport comfortably
  const maxW = Math.max(340, vw - 60);
  const maxH = Math.max(260, availH - 24);

  const w = Math.min(app.defaultSize.width, maxW);
  const h = Math.min(app.defaultSize.height, maxH);

  // Cascade offset: each new window shifts by 24px
  const cascade = (zCounter - 100) * 24;

  // Center horizontally and vertically within available area
  let x = Math.round((vw - w) / 2 + (cascade % 120));
  let y = Math.round((availH - h) / 2 + MENU_H + (cascade % 80));

  // Strict clamp bounds — y can NEVER be above MENU_H + 8!
  x = Math.max(20, Math.min(x, vw - w - 20));
  y = Math.max(MENU_H + 8, Math.min(y, vh - h - DOCK_H - 10));

  if (overridePos) {
    x = overridePos.x;
    y = overridePos.y;
  }

  zCounter += 1;

  return {
    id: `${appId}-${Date.now()}`,
    appId,
    title: app.title,
    position: { x, y },
    size: { width: w, height: h },
    zIndex: zCounter,
    minimized: false,
    maximized: false,
  };
}

const useWindowStore = create((set, get) => ({
  openWindows: [],

  /** Open an app. If already open and not minimized, just focus it. */
  openApp(appId, overridePos) {
    const { openWindows } = get();
    const existing = openWindows.find((w) => w.appId === appId);
    if (existing) {
      if (existing.minimized) {
        set((s) => ({
          openWindows: s.openWindows.map((w) =>
            w.id === existing.id
              ? { ...w, minimized: false, zIndex: ++zCounter }
              : w
          ),
        }));
      } else {
        get().focusApp(existing.id);
      }
      return;
    }
    const win = makeWindow(appId, overridePos);
    if (!win) return;
    set((s) => ({ openWindows: [...s.openWindows, win] }));
  },

  closeApp(id) {
    set((s) => ({ openWindows: s.openWindows.filter((w) => w.id !== id) }));
  },

  focusApp(id) {
    set((s) => ({
      openWindows: s.openWindows.map((w) =>
        w.id === id ? { ...w, zIndex: ++zCounter } : w
      ),
    }));
  },

  minimizeApp(id) {
    set((s) => ({
      openWindows: s.openWindows.map((w) =>
        w.id === id ? { ...w, minimized: true } : w
      ),
    }));
  },

  toggleMaximize(id) {
    set((s) => ({
      openWindows: s.openWindows.map((w) =>
        w.id === id ? { ...w, maximized: !w.maximized } : w
      ),
    }));
  },

  updatePosition(id, position) {
    // Keep window title bar below the menu bar
    const clampedY = Math.max(28, position.y);
    set((s) => ({
      openWindows: s.openWindows.map((w) =>
        w.id === id ? { ...w, position: { x: position.x, y: clampedY } } : w
      ),
    }));
  },

  updateSize(id, size) {
    set((s) => ({
      openWindows: s.openWindows.map((w) =>
        w.id === id ? { ...w, size } : w
      ),
    }));
  },

  getFocusedId() {
    const wins = get().openWindows.filter((w) => !w.minimized);
    if (wins.length === 0) return null;
    return wins.reduce((top, w) => (w.zIndex > top.zIndex ? w : top)).id;
  },
}));

export default useWindowStore;
