import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';
import { listDir, resolvePath, readFile, statPath, getChildNames } from '../fileSystem.jsx';
import { HOME_DIR } from '../fileSystem.jsx';

// ── pwd ──────────────────────────────────────────────────────
registerCommand('pwd', {
  description: 'Print working directory',
  usage: 'pwd',
  handler: async ({ cwd }) => (
    <span style={{ color: 'var(--text-white)' }}>{cwd}</span>
  ),
});

// ── ls ───────────────────────────────────────────────────────
registerCommand('ls', {
  description: 'List files and folders in current directory',
  usage: 'ls  |  ls <path>',
  handler: async ({ args, cwd }) => {
    const targetRaw = args[0];
    const target = targetRaw ? resolvePath(cwd, targetRaw) : cwd;
    const entries = listDir(target);

    if (!entries) {
      return (
        <span style={{ color: 'var(--text-error)' }}>
          ls: {targetRaw || '.'}: No such directory
        </span>
      );
    }

    if (entries.length === 0) {
      return <span style={{ color: 'var(--text-muted)' }}>(empty)</span>;
    }

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 24px' }}>
        {entries.map(({ name, type }) => (
          <span
            key={name}
            style={{
              color: type === 'dir' ? 'var(--text-link)' : 'var(--text-white)',
              minWidth: '120px',
            }}
          >
            {type === 'dir' ? name + '/' : name}
          </span>
        ))}
      </div>
    );
  },
});

// ── cd ───────────────────────────────────────────────────────
registerCommand('cd', {
  description: 'Change directory',
  usage: 'cd <path>',
  handler: async ({ args, cwd, setCwd }) => {
    const target = args[0] ? resolvePath(cwd, args[0]) : HOME_DIR;
    const type = statPath(target);

    if (!type) {
      return (
        <span style={{ color: 'var(--text-error)' }}>
          cd: {args[0]}: No such file or directory
        </span>
      );
    }
    if (type !== 'dir') {
      return (
        <span style={{ color: 'var(--text-error)' }}>
          cd: {args[0]}: Not a directory
        </span>
      );
    }

    setCwd(target);
    return null; // cd produces no output on success (like real bash)
  },
});

// ── cat ──────────────────────────────────────────────────────
registerCommand('cat', {
  description: 'Read a file',
  usage: 'cat <file>',
  handler: async ({ args, cwd }) => {
    if (!args[0]) {
      return <span style={{ color: 'var(--text-warn)' }}>Usage: cat {'<file>'}</span>;
    }

    const target = resolvePath(cwd, args[0]);
    const type = statPath(target);

    if (!type) {
      return (
        <span style={{ color: 'var(--text-error)' }}>
          cat: {args[0]}: No such file or directory
        </span>
      );
    }
    if (type === 'dir') {
      return (
        <span style={{ color: 'var(--text-error)' }}>
          cat: {args[0]}: Is a directory
        </span>
      );
    }

    const content = readFile(target);
    return <span style={{ color: 'var(--text-white)', whiteSpace: 'pre' }}>{content}</span>;
  },
});
