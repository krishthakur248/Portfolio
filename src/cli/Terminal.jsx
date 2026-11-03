import React, { useRef, useEffect, useState } from 'react';
import { useTerminal } from './useTerminal.jsx';
import WelcomeBanner from './WelcomeBanner.jsx';
import styles from './Terminal.module.css';

const QUICK_CHIPS = ['help', 'about', 'skills', 'projects', 'contact', 'whoami'];

/**
 * Terminal — chrome bar → scrollable output body → inline prompt.
 *
 * Props:
 *   switchMode  — fn('gui'|'landing') from parent
 *   embedded    — when true, hides the outer chrome/titlebar so it can live
 *                 inside the GUI Window without double chrome. Defaults false.
 */
export default function Terminal({ switchMode, embedded = false, isWindowFocused = true }) {
  const { output, input, setInput, cwd, handleKeyDown, submitCommand } = useTerminal({ switchMode });

  // When embedded inside the GUI Window we always fill the parent — no inner windowing.
  const [windowed, setWindowed] = useState(!embedded);

  const inputRef = useRef(null);
  const bodyRef  = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      if (output.length === 1 && output[0]?.type === 'banner') {
        bodyRef.current.scrollTop = 0;
      } else {
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      }
    }
  }, [output]);

  // Focus input on initial mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // When embedded inside a GUI window and that window becomes focused, re-focus the input
  useEffect(() => {
    if (isWindowFocused) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isWindowFocused]);

  // If the terminal window is focused, any keypress should target the terminal input
  useEffect(() => {
    if (!isWindowFocused) return;

    function handleGlobalType(e) {
      if (e.metaKey || e.altKey) return;
      if (e.ctrlKey && e.key.toLowerCase() !== 'c' && e.key.toLowerCase() !== 'l') return;

      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') && active !== inputRef.current) {
        return;
      }

      if (active !== inputRef.current) {
        inputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleGlobalType);
    return () => window.removeEventListener('keydown', handleGlobalType);
  }, [isWindowFocused]);

  function handleBodyClick(e) {
    if (e?.target?.closest('a') || e?.target?.closest('button')) return;
    const sel = window.getSelection();
    if (sel && sel.toString().length > 0) return;
    inputRef.current?.focus();
  }

  const HOME = '/home/krish';
  const displayPath = cwd === HOME
    ? '~'
    : cwd.startsWith(HOME + '/') ? '~' + cwd.slice(HOME.length) : cwd;

  function handleChipClick(cmd) {
    submitCommand(cmd);
    setInput('');
    inputRef.current?.focus();
  }

  // ── Embedded mode: bare body only, no outer wrapper/chrome ────────────────
  if (embedded) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'var(--bg-terminal)',
          overflow: 'hidden',
          cursor: 'text',
        }}
        onClick={handleBodyClick}
        onMouseDown={handleBodyClick}
      >
        {/* Mobile chips still useful inside the window */}
        <div className={styles.chips} aria-label="Quick commands">
          {QUICK_CHIPS.map((cmd) => (
            <button
              key={cmd}
              className={styles.chip}
              onClick={() => handleChipClick(cmd)}
              type="button"
            >
              {cmd}
            </button>
          ))}
        </div>

        <div
          ref={bodyRef}
          className={styles.body}
          onClick={handleBodyClick}
          aria-live="polite"
          aria-label="Terminal output"
          style={{ flex: 1, overflowY: 'auto' }}
        >
          {output.map((item) => (
            <div key={item.id} className={styles.line}>
              {item.type === 'banner' ? (
                <WelcomeBanner windowed={true} />
              ) : item.type === 'input' ? (
                <div className={styles.promptLine}>
                  <Prompt path={displayPath} />
                  <span className={styles.echoText}>{item.content}</span>
                </div>
              ) : (
                <div className={styles.outputLine}>{item.content}</div>
              )}
            </div>
          ))}

          <div
            className={styles.promptLine}
            onClick={handleBodyClick}
          >
            <Prompt path={displayPath} />
            <label htmlFor="terminal-input-embedded" className="sr-only">
              Terminal input — type a command and press Enter
            </label>
            <input
              id="terminal-input-embedded"
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-autocomplete="list"
              style={{ width: input.length === 0 ? '2px' : `${input.length}ch` }}
            />
            <span
              className={styles.cursor}
              aria-hidden="true"
              onClick={handleBodyClick}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Standalone mode (CLI mode, unchanged) ─────────────────────────────────
  return (
    <div className={`${styles.outerWrapper} ${windowed ? styles.outerWindowed : ''}`}>
      <div
        className={`${styles.window} ${windowed ? styles.windowWindowed : ''}`}
        role="region"
        aria-label="Terminal emulator"
      >
        {/* Chrome */}
        <div className={styles.chrome} aria-hidden="true">
          <div className={styles.chromeDots}>
            <span className={`${styles.dot} ${styles.dotRed}`} />
            <span className={`${styles.dot} ${styles.dotYellow}`} />
            <span className={`${styles.dot} ${styles.dotGreen}`} />
          </div>

          <span className={styles.chromeTitle}>visitor@krish:{displayPath}</span>

          <button
            id="toggle-window-mode"
            className={styles.switchBtn}
            onClick={() => setWindowed((w) => !w)}
            title={windowed ? 'Switch to fullscreen' : 'Switch to window mode'}
            aria-pressed={windowed}
          >
            {windowed ? '⛶ Full' : '⊡ Window'}
          </button>

          <button
            id="switch-gui-mode"
            className={styles.switchBtn}
            onClick={() => switchMode('gui')}
            title="Switch to GUI mode"
          >
            GUI mode →
          </button>
        </div>

        {/* Mobile chips */}
        <div className={styles.chips} aria-label="Quick commands">
          {QUICK_CHIPS.map((cmd) => (
            <button
              key={cmd}
              className={styles.chip}
              onClick={() => handleChipClick(cmd)}
              type="button"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Body */}
        <div
          ref={bodyRef}
          className={styles.body}
          onClick={handleBodyClick}
          aria-live="polite"
          aria-label="Terminal output"
        >
          {output.map((item) => (
            <div key={item.id} className={styles.line}>
              {item.type === 'banner' ? (
                <WelcomeBanner windowed={windowed} />
              ) : item.type === 'input' ? (
                <div className={styles.promptLine}>
                  <Prompt path={displayPath} />
                  <span className={styles.echoText}>{item.content}</span>
                </div>
              ) : (
                <div className={styles.outputLine}>{item.content}</div>
              )}
            </div>
          ))}

          <div className={styles.promptLine}>
            <Prompt path={displayPath} />
            <label htmlFor="terminal-input" className="sr-only">
              Terminal input — type a command and press Enter
            </label>
            <input
              id="terminal-input"
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-autocomplete="list"
              style={{ width: input.length === 0 ? '2px' : `${input.length}ch` }}
            />
            <span className={styles.cursor} aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Prompt({ path }) {
  return (
    <span>
      <span style={{ color: 'var(--prompt-user)', fontWeight: 600 }}>visitor</span>
      <span style={{ color: 'var(--text-muted)' }}>@</span>
      <span style={{ color: 'var(--prompt-host)', fontWeight: 600 }}>krish</span>
      <span style={{ color: 'var(--text-muted)' }}>:</span>
      <span style={{ color: 'var(--prompt-path)' }}>{path}</span>
      <span style={{ color: 'var(--prompt-dollar)', margin: '0 6px 0 3px' }}>$</span>
    </span>
  );
}
