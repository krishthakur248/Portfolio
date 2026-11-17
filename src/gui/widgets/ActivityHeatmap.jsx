import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getActivity } from '../../services/activityService.js';
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
  const firstDate = new Date(sorted[0].date);
  const lastDate  = new Date(sorted[sorted.length - 1].date);
  const firstStr  = sorted[0].date;
  const lastStr   = sorted[sorted.length - 1].date;

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
    } else if (dateStr < firstStr || dateStr > lastStr) {
      // Outside the data range → true padding cell (invisible, week-align only)
      week.push({ date: dateStr, count: 0, level: 0, _pad: true });
    } else {
      // Inside the data range but missing from API (e.g. LeetCode zero-submission days)
      // → show as an empty (level 0) cell, NOT as padding
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
  const [state, setState]       = useState('loading'); // 'loading' | 'error' | 'ok'
  const [data, setData]         = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [tooltip, setTooltip]   = useState(null); // { x, y, text }
  const gridRef = useRef(null);

  // Fetch on mount
  useEffect(() => {
    let alive = true;
    getActivity().then(activity => {
      if (!alive) return;
      setUpdatedAt(activity.updatedAt);
      const src = activity[source];
      if (src.status === 'ok') {
        setData(src.data);
        setState('ok');
      } else {
        setErrorMsg(src.reason ?? 'Could not load data');
        setState('error');
      }
    });
    return () => { alive = false; };
  }, [source]);

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
