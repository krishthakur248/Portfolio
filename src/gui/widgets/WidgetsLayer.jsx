import React, { useState, useEffect, useCallback } from 'react';
import DraggableWidget from './DraggableWidget.jsx';
import CalendarWidget from './CalendarWidget.jsx';
import WorldClockWidget from './WorldClockWidget.jsx';
import WeatherWidget from './WeatherWidget.jsx';
import DsaFocusWidget from './DsaFocusWidget.jsx';
import StatusWidget from './StatusWidget.jsx';
import SpotlightBar from './SpotlightBar.jsx';
import {
  WIDGET_DIMENSIONS,
  MENU_BAR_HEIGHT,
  DOCK_HEIGHT,
  computeDefaultWidgetPositions,
} from './widgetLayout.js';
import styles from '../../styles/gui/Widgets.module.css';

const STORAGE_KEY = 'gui_widgets_positions_v2';

export default function WidgetsLayer({ switchMode }) {
  // Initialize positions from localStorage or compute clean default layout
  const [positions, setPositions] = useState(() => {
    if (typeof window !== 'undefined') {
      const defaults = computeDefaultWidgetPositions(window.innerWidth, window.innerHeight);
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            const validated = { ...defaults };
            Object.keys(defaults).forEach((key) => {
              const item = parsed[key];
              if (
                item &&
                typeof item.x === 'number' &&
                typeof item.y === 'number' &&
                !isNaN(item.x) &&
                !isNaN(item.y) &&
                item.x >= 0 &&
                item.y >= 30 &&
                item.x < window.innerWidth &&
                item.y < window.innerHeight
              ) {
                validated[key] = item;
              }
            });
            return validated;
          }
        }
      } catch (err) {
        console.warn('Could not read widget positions from localStorage:', err);
      }
      return defaults;
    }
    return computeDefaultWidgetPositions(1440, 900);
  });

  // Active z-index management to bring dragged widget to front
  const [zIndices, setZIndices] = useState({
    calendar: 20,
    dsaFocus: 20,
    status: 20,
    worldClock: 20,
    weather: 20,
    spotlight: 25,
  });
  const [highestZ, setHighestZ] = useState(25);

  const bringToFront = useCallback((id) => {
    setHighestZ((prev) => {
      const next = prev + 1;
      setZIndices((z) => ({ ...z, [id]: next }));
      return next;
    });
  }, []);

  // Update a single widget's position & save to localStorage
  const handlePosChange = useCallback((id, newPos) => {
    setPositions((prev) => {
      const updated = { ...prev, [id]: newPos };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save widget positions to localStorage:', err);
      }
      // Broadcast widget positions change so desktop icon collision check stays in sync
      window.dispatchEvent(
        new CustomEvent('portfolio:widgetPositionsChanged', { detail: updated })
      );
      return updated;
    });
  }, []);

  // Reset layout handler (triggered from MenuBar or right-click context menu)
  const handleResetLayout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Could not clear widget positions:', err);
    }
    const defaults = computeDefaultWidgetPositions(window.innerWidth, window.innerHeight);
    setPositions(defaults);
    window.dispatchEvent(
      new CustomEvent('portfolio:widgetPositionsChanged', { detail: defaults })
    );
  }, []);

  // Listen for reset layout event
  useEffect(() => {
    window.addEventListener('portfolio:resetLayout', handleResetLayout);
    return () => window.removeEventListener('portfolio:resetLayout', handleResetLayout);
  }, [handleResetLayout]);

  // Window resize handler: re-clamp or recalculate
  useEffect(() => {
    function handleResize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      setPositions((prev) => {
        let hasSaved = false;
        try {
          hasSaved = Boolean(localStorage.getItem(STORAGE_KEY));
        } catch (e) {}

        if (!hasSaved) {
          return computeDefaultWidgetPositions(vw, vh);
        }

        // Clamp saved positions inside new viewport dimensions
        const clamped = {};
        Object.entries(prev).forEach(([id, p]) => {
          const dim = WIDGET_DIMENSIONS[id] || { width: 180, height: 140 };
          const minX = 12;
          const maxX = Math.max(minX, vw - dim.width - 12);
          const minY = MENU_BAR_HEIGHT + 8;
          const maxY = Math.max(minY, vh - DOCK_HEIGHT - dim.height - 12);

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

  return (
    <div className={styles.widgetsCanvas} aria-label="Desktop Widgets">
      {/* ── 1. Calendar Widget ── */}
      <DraggableWidget
        id="calendar"
        pos={positions.calendar}
        onPosChange={handlePosChange}
        onDragStart={bringToFront}
        zIndex={zIndices.calendar}
        width={WIDGET_DIMENSIONS.calendar.width}
        height={WIDGET_DIMENSIONS.calendar.height}
      >
        <CalendarWidget />
      </DraggableWidget>

      {/* ── 2. DSA Focus Widget ── */}
      <DraggableWidget
        id="dsaFocus"
        pos={positions.dsaFocus}
        onPosChange={handlePosChange}
        onDragStart={bringToFront}
        zIndex={zIndices.dsaFocus}
        width={WIDGET_DIMENSIONS.dsaFocus.width}
        height={WIDGET_DIMENSIONS.dsaFocus.height}
      >
        <DsaFocusWidget />
      </DraggableWidget>

      {/* ── 3. Status Widget ── */}
      <DraggableWidget
        id="status"
        pos={positions.status}
        onPosChange={handlePosChange}
        onDragStart={bringToFront}
        zIndex={zIndices.status}
        width={WIDGET_DIMENSIONS.status.width}
        height={WIDGET_DIMENSIONS.status.height}
      >
        <StatusWidget />
      </DraggableWidget>

      {/* ── 4. World Clock Widget ── */}
      <DraggableWidget
        id="worldClock"
        pos={positions.worldClock}
        onPosChange={handlePosChange}
        onDragStart={bringToFront}
        zIndex={zIndices.worldClock}
        width={WIDGET_DIMENSIONS.worldClock.width}
        height={WIDGET_DIMENSIONS.worldClock.height}
      >
        <WorldClockWidget />
      </DraggableWidget>

      {/* ── 5. Weather Widget ── */}
      <DraggableWidget
        id="weather"
        pos={positions.weather}
        onPosChange={handlePosChange}
        onDragStart={bringToFront}
        zIndex={zIndices.weather}
        width={WIDGET_DIMENSIONS.weather.width}
        height={WIDGET_DIMENSIONS.weather.height}
      >
        <WeatherWidget />
      </DraggableWidget>

      {/* ── 6. Spotlight Search Bar + Quick Actions ── */}
      <DraggableWidget
        id="spotlight"
        pos={positions.spotlight}
        onPosChange={handlePosChange}
        onDragStart={bringToFront}
        zIndex={zIndices.spotlight}
        width={WIDGET_DIMENSIONS.spotlight.width}
        height={WIDGET_DIMENSIONS.spotlight.height}
        cancelSelector="input, button, [role='listbox'], [role='option'], .searchPillInput, .circleBtn"
      >
        <SpotlightBar switchMode={switchMode} />
      </DraggableWidget>
    </div>
  );
}
