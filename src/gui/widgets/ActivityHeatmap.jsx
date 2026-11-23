import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getActivity, getInitialActivity, refreshActivity } from '../../services/activityService.js';
import styles from '../../styles/gui/ActivityHeatmap.module.css';

/** How long ago was updatedAt? Returns a string like "3 hours ago" */
function timeAgo(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)   return 'just now';
  if (mins < 60)  return `${mins} minutes ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

/** All weeks in a rolling 365-day window, padded to full Sun–Sat weeks */
function buildWeeks(days) {
  if (!days || days.length === 0) return [];

  const map = new Map(days.map(d => [d.date, d]));

  // Find the actual date range in the data
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const firstStr = sorted[0].date;

  // Always extend the grid to TODAY so days after the last submission
  // (e.g. Nov 20, 21 when last solve was Nov 19) show as empty cells, not missing.
  const todayStr = new Date().toISOString().slice(0, 10);
  const lastStr  = sorted[sorted.length - 1].date > todayStr
    ? sorted[sorted.length - 1].date  // future data (shouldn't happen, but safe)
    : todayStr;                        // always show up to today

  const firstDate = new Date(firstStr);
  const lastDate  = new Date(lastStr);

  // Pad back to the Sunday of the first week
  const startDate = new Date(firstDate);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // Pad forward to the Saturday of the last week
  const endDate = new Date(lastDate);
  const daysToSat = (6 - endDate.getDay() + 7) % 7;
  endDate.setDate(endDate.getDate() + daysToSat);

  const weeks = [];
  let week = [];
  const cur = new Date(startDate);

  while (cur <= endDate) {
    const dateStr = cur.toISOString().slice(0, 10);
    if (map.has(dateStr)) {
      // Real data day (may have count=0 for GitHub which includes all days)
      week.push(map.get(dateStr));
    } else if (dateStr < firstStr || dateStr > todayStr) {
      // Before data range starts, OR in the future (padding for week alignment) → invisible
      week.push({ date: dateStr, count: 0, level: 0, _pad: true });
    } else {
      // Inside data range but missing from API (zero-activity day) → visible empty cell
      week.push({ date: dateStr, count: 0, level: 0 });
    }
    if (cur.getDay() === 6) {
      weeks.push(week);
      week = [];
    }
    cur.setDate(cur.getDate() + 1);
  }
  if (week.length > 0) weeks.push(week);

  return weeks;
}

/** Month label positions: { label: 'Aug', weekIndex: n }[] */
function buildMonthLabels(weeks) {
  const labels = [];
  let lastYearMonth = null; // tracks 'YYYY-MM' to detect new month
  let isFirst = true;

  weeks.forEach((week, wi) => {
    // Use first real (non-pad) day of the week to decide month
    const firstReal = week.find(d => !d._pad);
    if (!firstReal) return;

    const ym = firstReal.date.slice(0, 7);   // 'YYYY-MM'
    if (ym === lastYearMonth) return;
    lastYearMonth = ym;

    const date  = new Date(firstReal.date + 'T12:00:00');
    const month = date.toLocaleString('en-US', { month: 'short' }); // 'Nov'
    const mm    = ym.slice(5, 7); // '01' – '12'

    // Show year suffix on: the very first label, or any January (year boundary)
    const showYear = isFirst || mm === '01';
    const yearSuffix = showYear ? ` '${date.getFullYear().toString().slice(2)}` : '';

    labels.push({ key: ym, label: month + yearSuffix, weekIndex: wi });
    isFirst = false;
  });

  return labels;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * ActivityHeatmap — reusable heatmap widget with glass styling.
 * Props:
 *   source:      'github' | 'leetcode'
 *   title:       string  (e.g. "GitHub Activity")
 *   profileUrl:  string
 *   profileLabel: string (e.g. "GitHub profile")
 *   widgetWidth: number  (px — from DraggableWidget, so cells never overflow)
 */
export default function ActivityHeatmap({ source, title, profileUrl, profileLabel, widgetWidth }) {
  const [state, setState]         = useState('loading'); // 'loading' | 'error' | 'ok'
  const [data, setData]           = useState(null);
  const [errorMsg, setErrorMsg]   = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [tooltip, setTooltip]     = useState(null); // { x, y, text }
  const [refreshing, setRefreshing] = useState(false);
  const gridRef    = useRef(null);
  const mountedRef = useRef(true); // tracks whether component is still mounted

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /** Apply a fetched activity result to state */
  const applyActivity = useCallback((activity) => {
    if (!mountedRef.current) return;
    setUpdatedAt(activity.updatedAt);
    const src = activity[source];
    if (src?.status === 'ok') {
      setData(src.data);
      setState('ok');
    } else {
      setErrorMsg(src?.reason ?? 'Could not load data');
      setState('error');
    }
  }, [source]);

  // Initial load on mount — in PROD auto-refreshes from live APIs on every page load
  useEffect(() => {
    setState('loading');
    getInitialActivity().then(applyActivity).catch(() => {
      if (!mountedRef.current) return;
      setErrorMsg('Could not load activity data');
      setState('error');
    });
  }, [source, applyActivity]);

  // Manual refresh — use a ref for the flag so the callback never goes stale
  const refreshingRef = useRef(false);
  const handleRefresh = useCallback(async () => {
    console.log('[Heatmap] ↻ handleRefresh called, source=', source, 'refreshingRef=', refreshingRef.current);
    if (refreshingRef.current) {
      console.log('[Heatmap] ↻ already refreshing, skip');
      return;
    }
    refreshingRef.current = true;
    setRefreshing(true);
    console.log('[Heatmap] ↻ setRefreshing(true), calling refreshActivity()...');
    try {
      const activity = await refreshActivity();
      console.log('[Heatmap] ↻ refreshActivity returned:', activity?.updatedAt, 'source status:', activity?.[source]?.status);
      applyActivity(activity);
    } catch (err) {
      console.error('[Heatmap] ↻ refreshActivity threw:', err);
    } finally {
      refreshingRef.current = false;
      if (mountedRef.current) setRefreshing(false);
      console.log('[Heatmap] ↻ done');
    }
  }, [applyActivity, source]);

  const weeks       = state === 'ok' ? buildWeeks(data.days)       : [];
  const monthLabels = state === 'ok' ? buildMonthLabels(weeks)     : [];

  // Tooltip handlers
  const handleCellEnter = useCallback((e, day) => {
    if (!day || day._pad) return;
    const noun   = source === 'github' ? 'contribution' : 'submission';
    const plural = day.count !== 1 ? `${noun}s` : noun;
    const dateStr = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    const text = day.count === 0 ? `No ${noun}s on ${dateStr}` : `${day.count} ${plural} on ${dateStr}`;
    const r = e.currentTarget.getBoundingClientRect();
    const wr = gridRef.current?.getBoundingClientRect() ?? r;
    setTooltip({ x: r.left - wr.left + r.width / 2, y: r.top - wr.top - 8, text });
  }, [source]);

  const handleCellLeave = useCallback(() => setTooltip(null), []);

  // Stats line
  const stats = data ? [
    { label: 'Total active days', value: data.activeDays },
    { label: 'Max streak',        value: data.maxStreak },
    { label: 'Current streak',    value: data.currentStreak },
    ...(source === 'leetcode' && data.totalSolved != null
      ? [{ label: 'Problems solved', value: data.totalSolved }]
      : []),
  ] : [];

  const bigLabel = source === 'github' ? 'contributions in the past year' : 'submissions in the past year';
  const reduced  = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      className={`${styles.heatmapWidget} ${!reduced ? styles.fadeIn : ''}`}
      style={widgetWidth ? { width: widgetWidth } : undefined}
      aria-label={
        state === 'ok'
          ? `${title}: ${data.total} ${bigLabel}, ${data.activeDays} active days, max streak ${data.maxStreak}`
          : title
      }
    >
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.widgetTitle}>{title}</span>
          {state === 'ok' && updatedAt && (
            <span className={styles.updatedAt}>Updated {timeAgo(updatedAt)}</span>
          )}
        </div>
        <div className={styles.headerRight}>
          <button
            className={`${styles.refreshBtn} ${refreshing ? styles.refreshBtnSpinning : ''}`}
            onClick={(e) => {
              console.log('[Heatmap] ↻ BUTTON onClick fired, source=', source, 'e.defaultPrevented=', e.defaultPrevented);
              handleRefresh();
            }}
            onMouseDown={(e) => {
              console.log('[Heatmap] ↻ BUTTON onMouseDown fired');
              e.stopPropagation(); // prevent draggable from starting a drag on the button
            }}
            disabled={refreshing}
            title={refreshing ? 'Refreshing…' : 'Refresh activity data'}
            aria-label="Refresh activity data"
          >
            ↻
          </button>
          <a
            className={styles.profileLink}
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${profileLabel}`}
          >
            View profile ↗
          </a>
        </div>
      </div>

      {/* ── Loading ── */}
      {state === 'loading' && (
        <div className={styles.skeleton} aria-busy="true" aria-label="Loading activity data">
          <div className={styles.skeletonBar} />
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 53 * 7 }).map((_, i) => (
              <div key={i} className={styles.skeletonCell} />
            ))}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {state === 'error' && (
        <div className={styles.errorState} role="alert">
          <span className={styles.errorIcon} aria-hidden="true">⚠</span>
          <p className={styles.errorMsg}>Couldn't load {title}</p>
          <p className={styles.errorReason}>{errorMsg}</p>
          <a
            className={styles.profileLink}
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View profile ↗
          </a>
        </div>
      )}

      {/* ── Success ── */}
      {state === 'ok' && data && (
        <>
          {/* Big stat + stats row */}
          <div className={styles.statsRow}>
            <span className={styles.bigStat}>
              <strong>{data.total.toLocaleString()}</strong>
              <span className={styles.bigStatLabel}> {bigLabel}</span>
            </span>
            <div className={styles.statPills}>
              {stats.map(s => (
                <span key={s.label} className={styles.statPill}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className={styles.gridWrap} ref={gridRef}>
            {/* Month labels */}
            <div className={styles.monthLabels} aria-hidden="true">
              {monthLabels.map(ml => (
                <span
                  key={ml.key}
                  className={styles.monthLabel}
                  style={{ gridColumnStart: ml.weekIndex + 1 }}
                >
                  {ml.label}
                </span>
              ))}
            </div>

            {/* Day labels + cell grid */}
            <div className={styles.gridBody}>
              <div className={styles.dayLabels} aria-hidden="true">
                {DAY_LABELS.map((d, i) => (
                  <span key={d} className={`${styles.dayLabel} ${i % 2 === 0 ? styles.dayLabelVisible : ''}`}>{d}</span>
                ))}
              </div>

              <div
                className={styles.cellGrid}
                role="img"
                aria-label={`${title} heatmap`}
                style={{ '--weeks': weeks.length }}
              >
                {weeks.map((week, wi) =>
                  week.map((day, di) => (
                    <div
                      key={`${wi}-${di}`}
                      className={`${styles.cell} ${day._pad ? styles.cellPad : ''}`}
                      data-level={day._pad ? 0 : day.level}
                      data-source={source}
                      onMouseEnter={e => handleCellEnter(e, day)}
                      onMouseLeave={handleCellLeave}
                      aria-hidden="true"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Tooltip */}
            {tooltip && (
              <div
                className={styles.tooltip}
                style={{ left: tooltip.x, top: tooltip.y }}
                aria-hidden="true"
              >
                {tooltip.text}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className={styles.legend} aria-hidden="true">
            <span className={styles.legendLabel}>Less</span>
            {[0, 1, 2, 3, 4].map(l => (
              <div key={l} className={styles.cell} data-level={l} data-source={source} />
            ))}
            <span className={styles.legendLabel}>More</span>
          </div>
        </>
      )}
    </div>
  );
}
