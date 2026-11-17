/**
 * widgetLayout.js — layout v5
 * Margin = 16px, gap = 16px everywhere.
 * Left stack: heatmaps stacked, then DSA+Status side-by-side flush with heatmap right edge.
 * Center zone: Spotlight + Calendar.
 * Right zone: icons (untouched by widgets).
 */

export const MENU_BAR_HEIGHT = 32;
export const DOCK_HEIGHT     = 88;
const MARGIN = 16;
const GAP    = 16;

/** Icon column width — icons are 90px wide, we keep 110px reserved */
const ICON_COL_W = 110;

/** Clamp a value between lo and hi */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/**
 * Compute all widget dimensions from viewport width.
 * Returns the WIDGET_DIMENSIONS object for this viewport.
 */
export function computeWidgetDimensions(vw = 1440) {
  // Left-stack heatmap width: 46 vw, clamped 560–680
  const heatW  = clamp(Math.round(vw * 0.46), 560, 680);
  // DSA + Status: each half of heatW minus one gap
  const smallW = Math.floor((heatW - GAP) / 2);
  const smallH = 120;
  // Heatmap height: header(16) + gap(6) + stats(24) + gap(6) + gridWrap(3+14+3+89) + gap(6) + legend(16) + padding(12+12=24) ≈ 207px
  const heatH  = 210;

  return {
    githubActivity:   { width: heatW,  height: heatH  },
    leetcodeActivity: { width: heatW,  height: heatH  },
    dsaFocus:         { width: smallW, height: smallH },
    status:           { width: smallW, height: smallH },
    calendar:         { width: 170,    height: 170    },
    spotlight:        { width: 540,    height: 50     },
  };
}

/**
 * WIDGET_DIMENSIONS — static export at 1440 (used for drag clamping and icon collision).
 * Re-computed properly inside computeDefaultWidgetPositions for each viewport.
 */
export const WIDGET_DIMENSIONS = computeWidgetDimensions(1440);

/**
 * Compute default widget positions for a given viewport.
 * All positions are in desktop-coordinate space (y=0 is screen top, not menu bar).
 *
 * User-defined layout (designed for ~1366×768). Positions are clamped so
 * nothing falls off-screen on smaller viewports.
 */
export function computeDefaultWidgetPositions(vw = 1440, vh = 900) {
  // ── User's exact requested positions (reference: ~1366×768) ──
  const base = {
    githubActivity:   { x: 16,   y: 48  },
    leetcodeActivity: { x: 24,   y: 420 },
    dsaFocus:         { x: 32,   y: 275 },
    status:           { x: 264,  y: 275 },
    spotlight:        { x: 528,  y: 288 },
    calendar:         { x: 1216, y: 64  },
  };

  // Clamp each position so nothing exceeds the visible area
  const dockTop = vh - DOCK_HEIGHT;
  const dims    = computeWidgetDimensions(vw);
  const result  = {};

  for (const [id, pos] of Object.entries(base)) {
    const d = dims[id] || { width: 180, height: 140 };
    result[id] = {
      x: Math.max(MARGIN, Math.min(pos.x, vw - d.width  - MARGIN)),
      y: Math.max(MENU_BAR_HEIGHT + 8, Math.min(pos.y, dockTop - d.height - MARGIN)),
    };
  }

  return result;
}

/**
 * Checks if two bounding rectangles overlap (with optional padding).
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
 * Resolves desktop icon positions so they never collide with widgets.
 * Icons always prefer the right column; collision logic only moves them if needed.
 */
export function resolveDesktopIconPositions(vw, vh, widgetPositions, desktopAppIds) {
  const dims = computeWidgetDimensions(vw);
  // Right column: start at vw - ICON_COL_W, push left if needed
  const rightX = Math.max(vw - ICON_COL_W, 760);
  const occupiedRects = [];

  Object.entries(widgetPositions).forEach(([id, pos]) => {
    const d = dims[id] || { width: 180, height: 140 };
    occupiedRects.push({ id, x: pos.x, y: pos.y, w: d.width, h: d.height });
  });

  const finalIconPositions = {};
  const iconW = 90;
  const iconH = 90;
  const initialYList = [60, 190, 320, 450, 580];
  const dockTop = vh - DOCK_HEIGHT;

  desktopAppIds.forEach((appId, index) => {
    let targetX = rightX;
    let targetY = initialYList[index % initialYList.length];
    // Clamp to menu bar + margin
    targetY = Math.max(MENU_BAR_HEIGHT + MARGIN, targetY);

    let hasCollision = occupiedRects.some((r) =>
      checkRectCollision({ x: targetX, y: targetY, w: iconW, h: iconH }, r)
    );

    if (hasCollision) {
      outer: for (let col = rightX; col >= 300; col -= ICON_COL_W) {
        for (let row = MENU_BAR_HEIGHT + MARGIN; row <= dockTop - iconH - MARGIN; row += 130) {
          const testRect = { x: col, y: row, w: iconW, h: iconH };
          if (!occupiedRects.some((r) => checkRectCollision(testRect, r))) {
            targetX = col;
            targetY = row;
            break outer;
          }
        }
      }
    }

    finalIconPositions[appId] = { x: targetX, y: targetY };
    occupiedRects.push({ id: `icon-${appId}`, x: targetX, y: targetY, w: iconW, h: iconH });
  });

  return finalIconPositions;
}
