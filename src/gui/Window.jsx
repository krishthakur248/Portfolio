import React, { useRef, useEffect, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';
import useWindowStore from './store/useWindowStore.js';
import styles from '../styles/gui/Window.module.css';

const MENU_H = 28;
const DOCK_H = 88;

/**
 * Window — wraps react-rnd (drag/resize) with macOS chrome (title bar, traffic lights).
 *
 * Dragging & Hit-Target Polish:
 *   • cancel={`.${styles.lights}, .${styles.light}`} ensures traffic lights never trigger dragging.
 *   • .lights container stops mousedown propagation so cursor jitter near dots never moves the window.
 *   • .light has an invisible 25px hit target via ::before, keeping the visual dot strictly 13px.
 */
export default function Window({ win, isFocused, children }) {
  const { closeApp, focusApp, minimizeApp, toggleMaximize, updatePosition, updateSize } =
    useWindowStore();

  const firstFocusRef = useRef(null);

  // Move browser focus into the window when it becomes focused.
  // If the window contains an interactive input (e.g. Terminal), focus that directly!
  useEffect(() => {
    if (isFocused) {
      const activeInput = firstFocusRef.current?.querySelector('input:not([type="hidden"]), textarea');
      if (activeInput) {
        activeInput.focus();
      } else {
        firstFocusRef.current?.focus();
      }
    }
  }, [isFocused]);

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const maxPos  = { x: 0, y: MENU_H };
  const maxSize = { width: vw, height: vh - MENU_H - DOCK_H };

  const position = win.maximized ? maxPos  : win.position;
  const size     = win.maximized ? maxSize : win.size;

  function handleClose(e) {
    e.stopPropagation();
    closeApp(win.id);
  }
  function handleMinimize(e) {
    e.stopPropagation();
    minimizeApp(win.id);
  }
  function handleMaximize(e) {
    e.stopPropagation();
    toggleMaximize(win.id);
  }

  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape' && isFocused) closeApp(win.id); },
    [isFocused, win.id, closeApp]
  );

  return (
    <Rnd
      size={size}
      position={position}
      minWidth={360}
      minHeight={240}
      bounds="window"
      dragHandleClassName={styles.titleBar}
      cancel={`.${styles.lights}, .${styles.light}`}
      enableResizing={!win.maximized}
      disableDragging={win.maximized}
      onDragStart={() => focusApp(win.id)}
      onDragStop={(_, d) => updatePosition(win.id, { x: d.x, y: Math.max(28, d.y) })}
      onResizeStop={(_, __, ref, ___, pos) => {
        updateSize(win.id, {
          width:  parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        updatePosition(win.id, { x: pos.x, y: Math.max(28, pos.y) });
      }}
      style={{ zIndex: win.zIndex }}
    >
      {/* Animation lives inside Rnd — pure visual, no absolute positioning */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{    opacity: 0, scale: 0.88 }}
        transition={{ duration: 0.18, ease: [0.175, 0.885, 0.32, 1.1] }}
        style={{ width: '100%', height: '100%' }}
      >
        <div
          className={`${styles.windowWrap} ${isFocused ? styles.focused : ''} ${win.maximized ? styles.maximized : ''}`}
          style={{ width: '100%', height: '100%' }}
          role="dialog"
          aria-labelledby={`win-title-${win.id}`}
          aria-modal="false"
          onMouseDown={() => focusApp(win.id)}
          onKeyDown={handleKeyDown}
        >
          {/* ── Title bar (draggable area) ── */}
          <div className={styles.titleBar}>
            {/* Traffic lights: stops mousedown propagation so clicking near dots never drags window */}
            <div
              className={styles.lights}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <button
                className={`${styles.light} ${styles.lightClose}`}
                onClick={handleClose}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label={`Close ${win.title}`}
                type="button"
              >
                <X size={7} strokeWidth={2.5} />
              </button>
              <button
                className={`${styles.light} ${styles.lightMinimize}`}
                onClick={handleMinimize}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label={`Minimize ${win.title}`}
                type="button"
              >
                <Minus size={7} strokeWidth={2.5} />
              </button>
              <button
                className={`${styles.light} ${styles.lightMaximize}`}
                onClick={handleMaximize}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label={`${win.maximized ? 'Restore' : 'Maximize'} ${win.title}`}
                type="button"
              >
                <Maximize2 size={7} strokeWidth={2.5} />
              </button>
            </div>

            <span id={`win-title-${win.id}`} className={styles.title}>
              {win.title}
            </span>

            {/* Spacer to visually balance the traffic lights */}
            <div style={{ width: 58 }} />
          </div>

          {/* ── App body ── */}
          <div className={styles.body} ref={firstFocusRef} tabIndex={-1}>
            {children}
          </div>
        </div>
      </motion.div>
    </Rnd>
  );
}
