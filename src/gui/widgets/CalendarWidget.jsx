import React from 'react';
import styles from '../../styles/gui/Widgets.module.css';

const DAYS_HEADER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarWidget() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();

  // First day of current month (0 = Sun, 1 = Mon, ...)
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  // Total days in current month
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Total days in previous month
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthTotalDays - i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      isToday: d === todayDate,
    });
  }

  // Next month leading days to complete full grid (rows of 7, up to 35)
  const remainingCells = 35 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Limit to 5 rows (35 days) for compact square fit
  const displayCells = calendarCells.slice(0, 35);

  return (
    <div className={`${styles.glassCard} ${styles.calendarWidget}`} title="Calendar">
      <div className={styles.calendarMonth}>
        <span>{MONTH_NAMES[currentMonth]}</span>
        <span className={styles.calendarYear}>{currentYear}</span>
      </div>

      <div className={styles.calendarGrid}>
        {DAYS_HEADER.map((h, i) => (
          <div key={`head-${i}`} className={styles.calendarDayHeader}>
            {h}
          </div>
        ))}

        {displayCells.map((item, idx) => (
          <div
            key={`day-${idx}`}
            className={`${styles.calendarDay} ${
              !item.isCurrentMonth ? styles.calendarDayDim : ''
            } ${item.isToday ? styles.calendarDayToday : ''}`}
          >
            {item.day}
          </div>
        ))}
      </div>
    </div>
  );
}

