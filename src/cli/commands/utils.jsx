import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';

// ── clear ─────────────────────────────────────────────────────
// Returns the special string '__CLEAR__' — Terminal.jsx watches for this
// and wipes the output array.
registerCommand('clear', {
  description: 'Clear the terminal screen',
  usage: 'clear',
  handler: async () => '__CLEAR__',
});

// ── restart / reset ───────────────────────────────────────────
// Returns the special string '__RESTART__' — useTerminal watches for this
// and restores the initial welcome banner, resets cwd to ~, and scrolls to top.
registerCommand('restart', {
  description: 'Restart terminal session and restore welcome screen',
  usage: 'restart',
  handler: async () => '__RESTART__',
});

registerCommand('reset', {
  description: 'Alias for restart — restore welcome screen',
  usage: 'reset',
  handler: async () => '__RESTART__',
});

// ── history ───────────────────────────────────────────────────
registerCommand('history', {
  description: 'Show command history',
  usage: 'history',
  handler: async ({ history }) => {
    if (!history || history.length === 0) {
      return <span style={{ color: 'var(--text-muted)' }}>No history yet.</span>;
    }
    return (
      <div style={{ whiteSpace: 'pre' }}>
        {history.map((cmd, i) => (
          <div key={i}>
            <span style={{ color: 'var(--text-muted)', marginRight: '12px' }}>
              {String(i + 1).padStart(3)}
            </span>
            <span style={{ color: 'var(--text-white)' }}>{cmd}</span>
          </div>
        ))}
      </div>
    );
  },
});

// ── date ──────────────────────────────────────────────────────
registerCommand('date', {
  description: 'Print current date and time',
  usage: 'date',
  handler: async () => (
    <span style={{ color: 'var(--text-white)' }}>
      {new Date().toString()}
    </span>
  ),
});

// ── echo ──────────────────────────────────────────────────────
registerCommand('echo', {
  description: 'Print text',
  usage: 'echo <text>',
  handler: async ({ args }) => (
    <span style={{ color: 'var(--text-white)' }}>
      {args.join(' ')}
    </span>
  ),
});

// ── theme ─────────────────────────────────────────────────────
const THEMES = {
  hacker: {
    '--bg':           '#0d1117',
    '--bg-terminal':  '#0a0e1a',
    '--bg-chrome':    '#111827',
    '--text-primary': '#4ecca3',
    '--text-dim':     '#2a8a6f',
    '--text-muted':   '#4a6373',
    '--text-white':   '#e8f4f8',
    '--border':       '#1e2d40',
    '--border-bright':'#2a3f55',
    '--glow-teal':    '0 0 12px rgba(78, 204, 163, 0.25)',
  },
  matrix: {
    '--bg':           '#000000',
    '--bg-terminal':  '#001100',
    '--bg-chrome':    '#001a00',
    '--text-primary': '#00ff41',
    '--text-dim':     '#00aa2b',
    '--text-muted':   '#006619',
    '--text-white':   '#ccffcc',
    '--border':       '#003300',
    '--border-bright':'#005500',
    '--glow-teal':    '0 0 12px rgba(0, 255, 65, 0.25)',
  },
  synthwave: {
    '--bg':           '#0d0221',
    '--bg-terminal':  '#0a011a',
    '--bg-chrome':    '#150330',
    '--text-primary': '#e040fb',
    '--text-dim':     '#9c27b0',
    '--text-muted':   '#6a1b9a',
    '--text-white':   '#f3e5f5',
    '--border':       '#2d0057',
    '--border-bright':'#4a0080',
    '--glow-teal':    '0 0 12px rgba(224, 64, 251, 0.25)',
  },
};

registerCommand('theme', {
  description: 'Switch color theme',
  usage: 'theme <name>    (hacker · matrix · synthwave)',
  handler: async ({ args, setTheme }) => {
    const name = args[0]?.toLowerCase();

    if (!name || !THEMES[name]) {
      return (
        <div style={{ whiteSpace: 'pre' }}>
          <div style={{ color: 'var(--text-warn)' }}>Usage: theme {'<name>'}</div>
          <div style={{ color: 'var(--text-muted)', marginTop: '6px' }}>Available themes:</div>
          {Object.keys(THEMES).map((t) => (
            <div key={t}>
              <span style={{ color: 'var(--text-primary)', paddingLeft: '12px' }}>  {t}</span>
            </div>
          ))}
        </div>
      );
    }

    // Apply all CSS custom properties to :root
    const root = document.documentElement;
    Object.entries(THEMES[name]).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });
    setTheme(name);

    return (
      <span style={{ color: 'var(--text-primary)' }}>
        Theme switched to <strong>{name}</strong>.
      </span>
    );
  },
});

// ── gui ───────────────────────────────────────────────────────
registerCommand('gui', {
  description: 'Switch to GUI mode',
  usage: 'gui',
  handler: async ({ switchMode }) => {
    switchMode('gui');
    return null;
  },
});

// ── cli ───────────────────────────────────────────────────────
registerCommand('cli', {
  description: 'Switch to full-screen CLI mode',
  usage: 'cli',
  handler: async ({ switchMode }) => {
    switchMode('cli');
    return null;
  },
});

// ── exit ──────────────────────────────────────────────────────
registerCommand('exit', {
  description: 'Close terminal session / window',
  usage: 'exit',
  handler: async () => {
    window.dispatchEvent(new CustomEvent('portfolio:closeTerminal'));
    return <span style={{ color: 'var(--text-muted)' }}>Session closed.</span>;
  },
});
