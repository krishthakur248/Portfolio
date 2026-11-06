import React, { useState } from 'react';
import CliMode from './modes/CliMode.jsx';
import GuiMode from './modes/GuiMode.jsx';
import { getProfileSync } from './services/dataService.js';
import styles from './App.module.css';

const STORAGE_KEY = 'portfolio_mode';

/**
 * App — top-level mode router.
 * Modes: 'landing' | 'cli' | 'gui'
 * Always starts at landing so the visitor always chooses.
 * The last-used mode is remembered only to show a hint badge.
 */
export default function App() {
  const [mode, setMode] = useState('landing');
  const lastUsed = localStorage.getItem(STORAGE_KEY);

  function switchMode(next) {
    setMode(next);
    if (next !== 'landing') {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }

  if (mode === 'cli') return <CliMode switchMode={switchMode} />;
  if (mode === 'gui') return <GuiMode switchMode={switchMode} />;

  // Always show the picker
  return <Landing onPick={switchMode} lastUsed={lastUsed} />;
}

/* ── Landing picker ─────────────────────────────────────────── */
function Landing({ onPick, lastUsed }) {
  const [hovered, setHovered] = useState(null);
  const profile = getProfileSync();
  const photoSrc = profile?.photo || '/img/Me.jpeg';

  return (
    <div className={styles.landing}>
      {/* Ambient glow blobs */}
      <div className={styles.blobLeft} aria-hidden="true" />
      <div className={styles.blobRight} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.avatarWrap}>
          <img
            src={photoSrc}
            alt="Krish Thakur"
            className={styles.avatar}
            width={124}
            height={124}
          />
        </div>
        <div className={styles.nameplate}>
          <span className={styles.nameDim}>visitor@</span>
          <span className={styles.nameBright}>krish</span>
          <span className={styles.nameDim}>:~$</span>
        </div>
        <h1 className={styles.title}>
          Krish Thakur
        </h1>
        <p className={styles.role}>Software Engineer · Full-Stack &amp; Systems</p>
      </header>

      <p className={styles.prompt}>Choose an interface:</p>

      <div className={styles.cards}>
        {/* GUI card */}
        <button
          id="pick-gui"
          className={`${styles.card} ${hovered === 'gui' ? styles.cardActive : ''}`}
          onMouseEnter={() => setHovered('gui')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onPick('gui')}
        >
          <div className={styles.cardIcon} aria-hidden="true">{'⊞'}</div>
          <div className={styles.cardLabel}>GUI Mode</div>
          <div className={styles.cardDesc}>
            macOS-inspired desktop with draggable widgets and windowed apps.
          </div>
          <div className={`${styles.cardHint} ${lastUsed === 'gui' ? '' : ''}`}>
            {lastUsed === 'gui' ? 'Last used' : 'Desktop'}
          </div>
        </button>
        
        {/* CLI card */}
        <button
          id="pick-cli"
          className={`${styles.card} ${hovered === 'cli' ? styles.cardActive : ''}`}
          onMouseEnter={() => setHovered('cli')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onPick('cli')}
        >
          <div className={styles.cardIcon} aria-hidden="true">{`> _`}</div>
          <div className={styles.cardLabel}>CLI Mode</div>
          <div className={styles.cardDesc}>
            Interactive terminal shell with native commands and tab completion.
          </div>
          <div className={styles.cardHint}>
            {lastUsed === 'cli' ? 'Last used' : 'Terminal'}
          </div>
        </button>

      </div>

      <footer className={styles.footer}>
        <a href="https://github.com/krishthakur248" target="_blank" rel="noopener noreferrer">GitHub</a>
        <span aria-hidden="true"> · </span>
        <a href="https://linkedin.com/in/krish-thakur-/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <span aria-hidden="true"> · </span>
        <a href="mailto:krishthakur248@gmail.com">Email</a>
      </footer>
    </div>
  );
}
