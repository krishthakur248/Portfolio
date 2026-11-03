import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import styles from '../styles/gui/DesktopIcon.module.css';

/**
 * DesktopIcon — draggable macOS-style desktop icon.
 *
 * Interaction model:
 *  - Single click selects (shows blue highlight pill on label)
 *  - Second click on selected icon OR double-click opens the app
 *  - Dragging (> 6px movement) moves icon freely without opening
 *  - Enter key on focused icon opens the app
 */
export default function DesktopIcon({
  id,
  label,
  iconSrc,
  selected,
  onSelect,
  onOpen,
  defaultPos,
}) {
  const [pos, setPos] = useState(defaultPos ?? { x: 36, y: 60 });
  const nodeRef = useRef(null);

  // Position tracking to distinguish clicks from drags
  const startCoord = useRef({ x: 0, y: 0 });
  const hasMovedBeyondThreshold = useRef(false);
  const lastClickTimestamp = useRef(0);

  function handlePointerDown(e) {
    const pt = e.touches ? e.touches[0] : e;
    startCoord.current = { x: pt.clientX, y: pt.clientY };
    hasMovedBeyondThreshold.current = false;
  }

  function handleDrag(e) {
    const pt = e.touches ? e.touches[0] : e;
    if (pt) {
      const dist = Math.hypot(
        pt.clientX - startCoord.current.x,
        pt.clientY - startCoord.current.y
      );
      if (dist > 6) {
        hasMovedBeyondThreshold.current = true;
      }
    }
  }

  function handleStop(_, d) {
    setPos({ x: d.x, y: d.y });
  }

  function handleClick(e) {
    e.stopPropagation();

    // If actual drag occurred, don't trigger select or open
    if (hasMovedBeyondThreshold.current) {
      hasMovedBeyondThreshold.current = false;
      return;
    }

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimestamp.current;

    // Double-click detection (within 400ms) OR clicking an already selected icon -> open!
    if (timeSinceLastClick < 400 || selected) {
      lastClickTimestamp.current = 0;
      onSelect(null);
      onOpen();
      return;
    }

    // First click: select the icon
    lastClickTimestamp.current = now;
    onSelect(id);
  }

  function handleDoubleClick(e) {
    e.stopPropagation();
    if (hasMovedBeyondThreshold.current) {
      hasMovedBeyondThreshold.current = false;
      return;
    }
    onSelect(null);
    onOpen();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
    if (e.key === 'Escape') {
      onSelect(null);
    }
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      position={pos}
      onStart={handlePointerDown}
      onDrag={handleDrag}
      onStop={handleStop}
    >
      <button
        ref={nodeRef}
        className={`${styles.icon} ${selected ? styles.selected : ''}`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        aria-label={`${label} — double-click to open`}
        type="button"
      >
        <div className={styles.iconBox}>
          <div className={styles.iconClip}>
            <img
              src={iconSrc}
              alt=""
              className={styles.iconImg}
              draggable={false}
            />
          </div>
        </div>

        <span className={styles.label}>{label}</span>
      </button>
    </Draggable>
  );
}
