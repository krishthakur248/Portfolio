import React from 'react';
import styles from './WelcomeBanner.module.css';

const ASCII_KRISH = `██╗  ██╗██████╗ ██╗███████╗██╗  ██╗
██║ ██╔╝██╔══██╗██║██╔════╝██║  ██║
█████╔╝ ██████╔╝██║███████╗███████║
██╔═██╗ ██╔══██╗██║╚════██║██╔══██║
██║  ██╗██║  ██║██║███████║██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝`;

/** Shared welcome text — identical in both modes */
function WelcomeText() {
  return (
    <>
      <div style={{ color: 'var(--text-white)', marginBottom: '4px' }}>
        Welcome to my portfolio! —{' '}
        Type{' '}
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>help</span>
        {' '}for a list of supported commands.
      </div>
      <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>
        Tab to autocomplete  ·  ↑↓ for history  ·  restart to reset  ·  Ctrl+L to clear
      </div>
    </>
  );
}

/**
 * WelcomeBanner — renders differently based on windowed prop.
 *
 * windowed=true  → exact same inline-style JSX as before (window mode untouched)
 * windowed=false → CSS module classes with centered layout + @media scaling
 */
export default function WelcomeBanner({ windowed }) {
  /* ────────────────────────────────────────────────────
     WINDOW MODE — inline styles, pixel-identical to before
     ──────────────────────────────────────────────────── */
  if (windowed) {
    return (
      <div style={{ fontFamily: 'var(--font-mono)' }}>

        {/* Banner row: KRISH | [photo + info] — space-evenly */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          flexWrap: 'wrap',
          gap: '32px',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border)',
        }}>

          {/* KRISH logo */}
          <div style={{ whiteSpace: 'pre', lineHeight: 1.15, flexShrink: 0 }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '13px' }}>
              {ASCII_KRISH}
            </span>
          </div>

          {/* Identity card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>

            {/* Photo */}
            <div style={{
              border: '1px solid var(--text-dim)',
              padding: '3px',
              background: 'var(--bg-terminal)',
              boxShadow: 'var(--glow-teal)',
              flexShrink: 0,
            }}>
              <img
                src="/img/Me.jpeg"
                alt="Krish Thakur"
                style={{
                  display: 'block',
                  width: '108px',
                  height: '108px',
                  objectFit: 'cover',
                  objectPosition: 'top',
                  filter: 'grayscale(100%) sepia(60%) hue-rotate(120deg) saturate(180%) brightness(0.85)',
                }}
              />
            </div>

            {/* Info */}
            <div style={{ whiteSpace: 'pre', lineHeight: 1.9 }}>
              <div style={{ color: 'var(--text-white)', fontWeight: 700, marginBottom: '6px' }}>
                Krish Thakur
              </div>
              <div style={{ borderBottom: '1px dashed var(--border-bright)', marginBottom: '8px', width: '220px' }} />
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{'role     →  '}</span>
                <span style={{ color: 'var(--text-white)' }}>Software Engineer</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{'github   →  '}</span>
                <a href="https://github.com/krishthakur248" target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--text-link)' }}>github/krishthakur248</a>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{'linkedin →  '}</span>
                <a href="https://linkedin.com/in/krish-thakur-/" target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--text-link)' }}>in/krish-thakur</a>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{'email    →  '}</span>
                <a href="mailto:krishthakur248@gmail.com"
                  style={{ color: 'var(--text-link)' }}>krishthakur248@gmail.com</a>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{'stack    →  '}</span>
                <span style={{ color: 'var(--text-white)' }}>MERN · Android · DSA</span>
              </div>
            </div>

          </div>{/* end identity card */}

        </div>{/* end banner row */}

        <WelcomeText />
      </div>
    );
  }

  /* ────────────────────────────────────────────────────
     FULL MODE — CSS classes, centered layout,
     @media scaling at 1400px / 1900px.
     Logo: flex:0 0 auto (no stretching)
     Left-aligned (flex-start), 56px gap, 150px photo,
     logo stays at original 13px, no max-width/auto margins,
     no vertical divider, horizontal divider as a sibling element
     at root level so it spans the same width as the prompt below.
     ──────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: 'var(--font-mono)' }}>

      {/* Full-mode banner row — CSS module handles centering + @media */}
      <div className={styles.bannerFull}>

        {/* 1 — KRISH logo: fixed size, no stretching */}
        <div className={styles.logoFull}>
          <span className={styles.logoText}>{ASCII_KRISH}</span>
        </div>

        {/* 2 — Identity card: photo + info as one block */}
        <div className={styles.identityFull}>

          {/* Photo frame */}
          <div className={styles.photoFrame}>
            <img
              src="/img/Me.jpeg"
              alt="Krish Thakur"
              className={styles.photo}
            />
          </div>

          {/* Info block */}
          <div className={styles.infoFull}>
            <div style={{ color: 'var(--text-white)', fontWeight: 700, marginBottom: '6px' }}>
              Krish Thakur
            </div>
            <div style={{ borderBottom: '1px dashed var(--border-bright)', marginBottom: '8px', width: '220px' }} />
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{'role     →  '}</span>
              <span style={{ color: 'var(--text-white)' }}>Software Engineer</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{'github   →  '}</span>
              <a href="https://github.com/krishthakur248" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--text-link)' }}>github/krishthakur248</a>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{'linkedin →  '}</span>
              <a href="https://linkedin.com/in/krish-thakur-/" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--text-link)' }}>in/krish-thakur</a>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{'email    →  '}</span>
              <a href="mailto:krishthakur248@gmail.com"
                style={{ color: 'var(--text-link)' }}>krishthakur248@gmail.com</a>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{'stack    →  '}</span>
              <span style={{ color: 'var(--text-white)' }}>MERN · Android · DSA</span>
            </div>
          </div>

        </div>{/* end identity card */}

      </div>{/* end banner row */}

      {/* Horizontal divider at root level → spans the full body content width,
         same 20px side margins as the banner row above and prompt text below */}
      <div className={styles.headerDivider} />

      <WelcomeText />
    </div>
  );
}
