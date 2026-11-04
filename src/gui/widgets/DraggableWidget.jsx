import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import styles from '../../styles/gui/Widgets.module.css';

/**
 * DraggableWidget
 * Reusable wrapper providing:
 * - Direct, native drag tracking without re-render lag or transform conflicts
 * - 4px drag threshold to distinguish clicks from drags
 * - Viewport bounds clamping between MenuBar (top: 36px) and Dock (bottom: 88px)
 * - 8px grid snapping on drop
 * - Lift effect + grabbing cursor applied safely to inner container (does not fight react-draggable)
 * - prefers-reduced-motion compliance
 * - Touch support & disabled state on narrow mobile screens (< 768px)
 */
export default function DraggableWidget({
  id,
  pos: propPos,
  onPosChange,
  onDragStart,
  zIndex = 20,
  width,
  height,
  disabled = false,
  cancelSelector,
  children,
}) {
  const [pos, setPos] = useState(() => propPos || { x: 0, y: 0 });
  const nodeRef = useRef(null);
  const innerRef = useRef(null);
  const startCoord = useRef({ x: 0, y: 0 });
  const hasMovedBeyondThreshold = useRef(false);

  // Sync position if external position changes (e.g. window resize or Reset Layout)
  useEffect(() => {
    if (propPos && typeof propPos.x === 'number' && typeof propPos.y === 'number') {
      setPos(propPos);
    }
  }, [propPos?.x, propPos?.y]);

  function handleStart(e) {
    if (disabled) return;
    const pt = e.touches ? e.touches[0] : e;
    if (pt) {
      startCoord.current = { x: pt.clientX, y: pt.clientY };
    }
    hasMovedBeyondThreshold.current = false;
    onDragStart?.(id);
  }

  function handleDrag(e) {
    const pt = e.touches ? e.touches[0] : e;
    if (pt) {
      const dist = Math.hypot(
        pt.clientX - startCoord.current.x,
        pt.clientY - startCoord.current.y
      );
      if (dist > 4 && !hasMovedBeyondThreshold.current) {
        hasMovedBeyondThreshold.current = true;
        if (innerRef.current) {
          innerRef.current.classList.add(styles.widgetInnerDragging);
        }
      }
    }
  }

  function handleStop(e, data) {
    if (innerRef.current) {
      innerRef.current.classList.remove(styles.widgetInnerDragging);
    }

    const MENU_H = 32;
    const DOCK_H = 88;
    const pad = 12;

    const w = width || nodeRef.current?.offsetWidth || 180;
    const h = height || nodeRef.current?.offsetHeight || 140;

    const minX = pad;
    const maxX = Math.max(pad, window.innerWidth - w - pad);
    const minY = MENU_H + 8;
    const maxY = Math.max(minY, window.innerHeight - DOCK_H - h - pad);

    // Snap to 8px grid
    let snappedX = Math.round(data.x / 8) * 8;
    let snappedY = Math.round(data.y / 8) * 8;

    // Clamp inside viewport
    snappedX = Math.max(minX, Math.min(maxX, snappedX));
    snappedY = Math.max(minY, Math.min(maxY, snappedY));

    const finalPos = { x: snappedX, y: snappedY };
    setPos(finalPos);
    onPosChange?.(id, finalPos);

    setTimeout(() => {
      hasMovedBeyondThreshold.current = false;
    }, 50);
  }

  function handleClickCapture(e) {
    if (hasMovedBeyondThreshold.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <Draggable
      nodeRef={nodeRef}
      position={pos}
      disabled={disabled || isSmallScreen}
      cancel={cancelSelector || 'input, button, a, select, textarea, [role="listbox"], [role="option"]'}
      onStart={handleStart}
      onDrag={handleDrag}
      onStop={handleStop}
    >
      <div
        ref={nodeRef}
        onClickCapture={handleClickCapture}
        className={styles.draggableWidget}
        style={{ zIndex }}
      >
        <div ref={innerRef} className={styles.widgetInner}>
          {children}
        </div>
      </div>
    </Draggable>
  );
}
