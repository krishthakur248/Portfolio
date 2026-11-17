import React, { useState, useEffect, useCallback } from 'react';
import DraggableWidget from './DraggableWidget.jsx';
import CalendarWidget from './CalendarWidget.jsx';
import ActivityHeatmap from './ActivityHeatmap.jsx';
import DsaFocusWidget from './DsaFocusWidget.jsx';
import StatusWidget from './StatusWidget.jsx';
import SpotlightBar from './SpotlightBar.jsx';
import {
  computeWidgetDimensions,
  MENU_BAR_HEIGHT,
  DOCK_HEIGHT,
  computeDefaultWidgetPositions,
} from './widgetLayout.js';
import styles from '../../styles/gui/Widgets.module.css';

// v8: user-defined hardcoded default positions. Old keys discarded.
const STORAGE_KEY     = 'gui_widgets_positions_v8';
const OLD_KEYS        = ['gui_widgets_positions_v7', 'gui_widgets_positions_v6', 'gui_widgets_positions_v5', 'gui_widgets_positions_v4', 'gui_widgets_positions_v3'];

const KNOWN_IDS = ['calendar', 'dsaFocus', 'status', 'githubActivity', 'leetcodeActivity', 'spotlight'];
const MARGIN = 16;

/** Safe per-viewport dim lookup */
function dim(id, vw) {
  const dims = computeWidgetDimensions(vw ?? (typeof window !== 'undefined' ? window.innerWidth : 1440));
  return dims[id] ?? { width: 180, height: 140 };
}

export default function WidgetsLayer({ switchMode }) {
  const [positions, setPositions] = useState(() => {
    if (typeof window === 'undefined') return computeDefaultWidgetPositions(1440, 900);
    const defaults = computeDefaultWidgetPositions(window.innerWidth, window.innerHeight);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const validated = { ...defaults };
          KNOWN_IDS.forEach((key) => {
            const item = parsed[key];
            if (
              item &&
              typeof item.x === 'number' &&
              typeof item.y === 'number' &&
              isFinite(item.x) && isFinite(item.y) &&
              item.x >= 0 && item.y >= 30 &&
              item.x < window.innerWidth &&
              item.y < window.innerHeight
            ) {
              validated[key] = item;
            }
          });
          return validated;
        }
      }
    } catch {}
    return defaults;
  });

  // Purge stale storage keys on mount
  useEffect(() => {
    OLD_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch {} });
  }, []);

  const [zIndices, setZIndices] = useState({
    calendar: 20, dsaFocus: 20, status: 20,
    githubActivity: 20, leetcodeActivity: 20, spotlight: 25,
  });
  const [highestZ, setHighestZ] = useState(25);

  const bringToFront = useCallback((id) => {
    setHighestZ((prev) => {
      const next = prev + 1;
      setZIndices((z) => ({ ...z, [id]: next }));
      return next;
    });
  }, []);

  const handlePosChange = useCallback((id, newPos) => {
    setPositions((prev) => {
      const updated = { ...prev, [id]: newPos };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      window.dispatchEvent(new CustomEvent('portfolio:widgetPositionsChanged', { detail: updated }));
      return updated;
    });
  }, []);

  const handleResetLayout = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    const defaults = computeDefaultWidgetPositions(window.innerWidth, window.innerHeight);
    setPositions(defaults);
    window.dispatchEvent(new CustomEvent('portfolio:widgetPositionsChanged', { detail: defaults }));
  }, []);

  useEffect(() => {
    window.addEventListener('portfolio:resetLayout', handleResetLayout);
    return () => window.removeEventListener('portfolio:resetLayout', handleResetLayout);
  }, [handleResetLayout]);

  useEffect(() => {
    function handleResize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setPositions((prev) => {
        let hasSaved = false;
        try { hasSaved = Boolean(localStorage.getItem(STORAGE_KEY)); } catch {}
        if (!hasSaved) return computeDefaultWidgetPositions(vw, vh);
        // Clamp KNOWN_IDS only
        const clamped = {};
        KNOWN_IDS.forEach((id) => {
          const p = prev[id];
          if (!p) return;
          const d = dim(id, vw);
          const minX = MARGIN;
          const maxX = Math.max(minX, vw - d.width - MARGIN);
          const minY = MENU_BAR_HEIGHT + 8;
          const maxY = Math.max(minY, vh - DOCK_HEIGHT - d.height - MARGIN);
          clamped[id] = {
            x: Math.max(minX, Math.min(maxX, p.x)),
            y: Math.max(minY, Math.min(maxY, p.y)),
          };
        });
        return clamped;
      });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    function handleBringWidget(e) {
      const { widgetId } = e.detail ?? {};
      if (widgetId && KNOWN_IDS.includes(widgetId)) bringToFront(widgetId);
    }
    window.addEventListener('portfolio:bringWidgetToFront', handleBringWidget);
    return () => window.removeEventListener('portfolio:bringWidgetToFront', handleBringWidget);
  }, [bringToFront]);

  const vw  = typeof window !== 'undefined' ? window.innerWidth  : 1440;
  const vh  = typeof window !== 'undefined' ? window.innerHeight : 900;
  const pos = (id) => positions[id] ?? computeDefaultWidgetPositions(vw, vh)[id] ?? { x: MARGIN, y: 56 };

  return (
    <div className={styles.widgetsCanvas} aria-label="Desktop Widgets">

      {/* ── GitHub Activity Heatmap ── */}
      <DraggableWidget
        id="githubActivity"
        pos={pos('githubActivity')}
        onPosChange={handlePosChange}
        onDragStart={bringToFront}
        zIndex={zIndices.githubActivity}
        width={dim('githubActivity', vw).width}
        height={dim('githubActivity', vw).height}
      >
        <ActivityHeatmap
          source="github"
          title="GitHub Activity"
          profileUrl="https://github.com/krishthakur248"
          profileLabel="GitHub profile"
          widgetWidth={dim('githubActivity', vw).width}
        />
      </DraggableWidget>

      {/* ── LeetCode Activity Heatmap ── */}
      <DraggableWidget
        id="leetcodeActivity"
        pos={pos('leetcodeActivity')}
        onPosChange={handlePosChange}
        onDragStart={bringToFront}
        zIndex={zIndices.leetcodeActivity}
        width={dim('leetcodeActivity', vw).width}
        height={dim('leetcodeActivity', vw).height}
      >
        <ActivityHeatmap
          source="leetcode"
          title="LeetCode Activity"
          profileUrl="https://leetcode.com/krishthakur248"
          profileLabel="LeetCode profile"
          widgetWidth={dim('leetcodeActivity', vw).width}
        />
      </DraggableWidget>

      {/* ── DSA Focus ── */}
      <DraggableWidget
        id="dsaFocus"
        pos={pos('dsaFocus')}
        onPosChange={handlePosChange}
        onDragStart={bringToFront}
        zIndex={zIndices.dsaFocus}
        width={dim('dsaFocus', vw).width}
        height={dim('dsaFocus', vw).height}
      >
        <DsaFocusWidget width={dim('dsaFocus', vw).width} />
      </DraggableWidget>

      {/* ── Status ── */}
      <DraggableWidget
        id="status"
        pos={pos('status')}
        onPosChange={handlePosChange}
        onDragStart={bringToFront}
        zIndex={zIndices.status}
        width={dim('status', vw).width}
        height={dim('status', vw).height}
      >
        <StatusWidget width={dim('status', vw).width} />
      </DraggableWidget>

      {/* ── Calendar ── */}
      <DraggableWidget
        id="calendar"
        pos={pos('calendar')}
        onPosChange={handlePosChange}
        onDragStart={bringToFront}
        zIndex={zIndices.calendar}
        width={dim('calendar', vw).width}
        height={dim('calendar', vw).height}
      >
        <CalendarWidget />
      </DraggableWidget>

      {/* ── Spotlight Search Bar ── */}
      <DraggableWidget
        id="spotlight"
        pos={pos('spotlight')}
        onPosChange={handlePosChange}
        onDragStart={bringToFront}
        zIndex={zIndices.spotlight}
        width={dim('spotlight', vw).width}
        height={dim('spotlight', vw).height}
        cancelSelector="input, button, a, [role='listbox'], [role='option'], .searchPillInput, .circleBtn, .filterChip, .spotlightDropdown, .spotlightFilterRow, .resultItem"
      >
        <SpotlightBar switchMode={switchMode} />
      </DraggableWidget>

    </div>
  );
}
