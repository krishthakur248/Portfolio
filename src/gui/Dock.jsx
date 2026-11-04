import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { getDockApps } from './appRegistry.js';
import { getSocialsSync as getSocials } from '../services/dataService.js';
import useWindowStore from './store/useWindowStore.js';
import styles from '../styles/gui/Dock.module.css';

/* Map social icon key → local PNG path */
const SOCIAL_ICON_MAP = {
  Github:   '/img/icons/github.png',
  Linkedin: '/img/icons/linkedin.png',
  Mail:     '/img/icons/email.png',
  Code2:    '/img/icons/leetcode.png',
};

/* Base/max icon size — framer-motion spring interpolates between these */
const BASE  = 48;
const MAX   = 68;
const RANGE = 96; // px from icon center before magnification kicks in

const prefersReduced =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

/* ── Single dock icon ── */
function DockIcon({ label, iconSrc, onClick, isRunning }) {
  const ref    = useRef(null);
  const mouseX = useMotionValue(Infinity);

  const rawSize = useTransform(mouseX, [-RANGE, 0, RANGE], [BASE, MAX, BASE]);
  const size    = useSpring(rawSize, { stiffness: 340, damping: 28, mass: 0.6 });

  /* When reduced-motion, lock to a plain number so no MotionValue is used */
  const motionStyle = prefersReduced
    ? { width: BASE, height: BASE }
    : { width: size,  height: size  };

  return (
    <button
      ref={ref}
      className={styles.item}
      onClick={onClick}
      aria-label={label}
      type="button"
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) mouseX.set(e.clientX - (rect.left + rect.width / 2));
      }}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      {/*
        motion.div owns the spring-driven size.
        iconClip is a plain div that fills 100% of its parent — NO inline
        MotionValue on a regular div (MotionValues only work on motion.* elements).
        overflow:hidden + border-radius on iconClip clips the PNG corners.
      */}
      <motion.div className={styles.iconBox} style={motionStyle}>
        <div className={styles.iconClip}>
          <img
            src={iconSrc}
            alt=""
            className={styles.iconImg}
            draggable={false}
          />
        </div>
      </motion.div>

      <span className={`${styles.dot} ${isRunning ? styles.dotVisible : ''}`} aria-hidden="true" />
      <span className={styles.tooltip}>{label}</span>
    </button>
  );
}

/* ── Dock ── */
export default function Dock() {
  const { openApp, openWindows } = useWindowStore();
  const dockApps = getDockApps();
  const socials  = getSocials();

  const runningIds = new Set(
    openWindows.filter((w) => !w.minimized).map((w) => w.appId)
  );

  const hasMaximized = openWindows.some((w) => !w.minimized && w.maximized);

  return (
    <div
      className={`${styles.dockWrap} ${hasMaximized ? styles.hidden : ''}`}
      role="toolbar"
      aria-label="Dock"
      aria-hidden={hasMaximized}
    >
      <div className={styles.dock}>

        {/* App icons */}
        {dockApps.map((app) => (
          <DockIcon
            key={app.id}
            label={app.title}
            iconSrc={app.iconSrc}
            isRunning={runningIds.has(app.id)}
            onClick={() => openApp(app.id)}
          />
        ))}

        {/* Divider separates apps from social links */}
        {socials.length > 0 && (
          <div className={styles.divider} role="separator" aria-hidden="true" />
        )}

        {/* Social links */}
        {socials.map((s) => {
          const iconPath = SOCIAL_ICON_MAP[s.icon] ?? '/img/icons/email.png';
          return (
            <DockIcon
              key={s._id}
              label={s.label}
              iconSrc={iconPath}
              isRunning={false}
              onClick={() => window.open(s.url, '_blank', 'noopener,noreferrer')}
            />
          );
        })}

      </div>
    </div>
  );
}
