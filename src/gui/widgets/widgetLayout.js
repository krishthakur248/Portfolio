/**
 * widgetLayout.js
 * Centralized layout engine and collision detection for Desktop Widgets and Icons.
 */

export const WIDGET_DIMENSIONS = {
  calendar:   { width: 170, height: 170 },
  dsaFocus:   { width: 163, height: 140 },
  status:     { width: 163, height: 140 },
  worldClock: { width: 340, height: 170 },
  weather:    { width: 340, height: 170 },
  spotlight:  { width: 540, height: 50 },
};

export const MENU_BAR_HEIGHT = 32;
export const DOCK_HEIGHT = 88;

export const DEFAULT_WIDGET_POSITIONS = {
  calendar:   { x: 48,  y: 56 },
  dsaFocus:   { x: 48,  y: 490 },
  status:     { x: 224, y: 490 },
  worldClock: { x: 232, y: 56 },
  weather:    { x: 48,  y: 296 },
  spotlight:  { x: 552, y: 264 },
};

/**
 * Computes non-overlapping default positions for all widgets and spotlight.
 * Adheres precisely to the user's layout specification.
 */
export function computeDefaultWidgetPositions(vw = 1440, vh = 900) {
  const spotlightW = 540;
  let spotX = 552;
  // If viewport width is narrower than spotlight starting boundary, keep it within screen bounds
  if (vw < 552 + spotlightW + 20) {
    spotX = Math.max(48, vw - spotlightW - 20);
  }

  return {
    calendar:   { x: 48,  y: 56 },
    dsaFocus:   { x: 48,  y: 490 },
    status:     { x: 224, y: 490 },
    worldClock: { x: 232, y: 56 },
    weather:    { x: 48,  y: 296 },
    spotlight:  { x: spotX, y: 264 },
  };
}

/**
 * Checks if two bounding rectangles overlap.
 */
export function checkRectCollision(r1, r2, padding = 4) {
  return !(
    r1.x + r1.w + padding <= r2.x ||
    r1.x >= r2.x + r2.w + padding ||
    r1.y + r1.h + padding <= r2.y ||
    r1.y >= r2.y + r2.h + padding
  );
}

/**
 * Resolves desktop icon positions so they never collide with widgets or spotlight.
 */
export function resolveDesktopIconPositions(vw, vh, widgetPositions, desktopAppIds) {
  const rightX = Math.max(vw - 110, 750);
  const occupiedRects = [];

  // Add all widget rects
  Object.entries(widgetPositions).forEach(([id, pos]) => {
    const dim = WIDGET_DIMENSIONS[id] || { width: 180, height: 140 };
    occupiedRects.push({
      id,
      x: pos.x,
      y: pos.y,
      w: dim.width,
      h: dim.height,
    });
  });

  const finalIconPositions = {};
  const iconW = 90;
  const iconH = 90;
  const initialYList = [60, 190, 320, 450, 580];

  desktopAppIds.forEach((appId, index) => {
    let targetX = rightX;
    let targetY = initialYList[index % initialYList.length];

    // Check collision against all occupied rectangles
    let hasCollision = occupiedRects.some((r) =>
      checkRectCollision({ x: targetX, y: targetY, w: iconW, h: iconH }, r)
    );

    // If colliding, find nearest open grid slot starting from right column moving left
    if (hasCollision) {
      outer: for (let col = rightX; col >= 200; col -= 100) {
        for (let row = 60; row <= vh - DOCK_HEIGHT - 90; row += 120) {
          const testRect = { x: col, y: row, w: iconW, h: iconH };
          if (!occupiedRects.some((r) => checkRectCollision(testRect, r))) {
            targetX = col;
            targetY = row;
            break outer;
          }
        }
      }
    }

    const assigned = { x: targetX, y: targetY };
    finalIconPositions[appId] = assigned;
    occupiedRects.push({ id: `icon-${appId}`, x: targetX, y: targetY, w: iconW, h: iconH });
  });

  return finalIconPositions;
}

