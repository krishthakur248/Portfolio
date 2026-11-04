import React, { useState, useEffect } from 'react';
import styles from '../../styles/gui/Widgets.module.css';

const CITIES = [
  { name: 'India',     timeZone: 'Asia/Kolkata' },
  { name: 'Tokyo',     timeZone: 'Asia/Tokyo' },
  { name: 'Sydney',    timeZone: 'Australia/Sydney' },
  { name: 'Paris',     timeZone: 'Europe/Paris' },
];

/**
 * Calculates current time components for any IANA timezone.
 */
function getTimeForZone(timeZone) {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    let h = 0, m = 0, s = 0;
    for (const p of parts) {
      if (p.type === 'hour') h = parseInt(p.value, 10);
      if (p.type === 'minute') m = parseInt(p.value, 10);
      if (p.type === 'second') s = parseInt(p.value, 10);
    }
    return { h: h % 12, m, s };
  } catch (e) {
    const d = new Date();
    return { h: d.getHours() % 12, m: d.getMinutes(), s: d.getSeconds() };
  }
}

/**
 * Computes dynamic offset in hours relative to the client's current local timezone.
 * Uses Intl.DateTimeFormat so Daylight Saving Time (DST) is always handled accurately.
 */
function getDynamicOffsetLabel(timeZone) {
  try {
    const now = new Date();
    const localParts = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(now).reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});

    const targetParts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(now).reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});

    const localTime = new Date(localParts.year, localParts.month - 1, localParts.day, localParts.hour, localParts.minute).getTime();
    const targetTime = new Date(targetParts.year, targetParts.month - 1, targetParts.day, targetParts.hour, targetParts.minute).getTime();

    const diffHours = (targetTime - localTime) / (1000 * 60 * 60);
    if (diffHours === 0) return 'LOCAL';
    const sign = diffHours > 0 ? '+' : '';
    const formatted = Number.isInteger(diffHours) ? diffHours : diffHours.toFixed(1);
    return `${sign}${formatted}HRS`;
  } catch (e) {
    return '';
  }
}

export default function WorldClockWidget() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${styles.glassCard} ${styles.worldClockWidget}`} title="World Clocks">
      {CITIES.map((city) => {
        const { h, m, s } = getTimeForZone(city.timeZone);
        const offsetLabel = getDynamicOffsetLabel(city.timeZone);

        const hourAngle = (h * 30) + (m * 0.5);
        const minAngle  = m * 6;
        const secAngle  = s * 6;

        return (
          <div key={city.name} className={styles.clockCity}>
            <div className={styles.clockFace} aria-label={`${city.name} clock`}>
              {/* Dial marks at 12, 3, 6, 9 */}
              <span className={styles.clockDialMark} style={{ transform: 'rotate(0deg)' }} />
              <span className={styles.clockDialMark} style={{ transform: 'rotate(90deg)' }} />
              <span className={styles.clockDialMark} style={{ transform: 'rotate(180deg)' }} />
              <span className={styles.clockDialMark} style={{ transform: 'rotate(270deg)' }} />

              {/* Hands */}
              <div
                className={styles.clockHandHour}
                style={{ transform: `rotate(${hourAngle}deg)` }}
              />
              <div
                className={styles.clockHandMin}
                style={{ transform: `rotate(${minAngle}deg)` }}
              />
              <div
                className={styles.clockHandSec}
                style={{ transform: `rotate(${secAngle}deg)` }}
              />
              <div className={styles.clockCenterDot} />
            </div>

            <div className={styles.clockCityName}>{city.name}</div>
            <div className={styles.clockCityOffset}>{offsetLabel}</div>
          </div>
        );
      })}
    </div>
  );
}
