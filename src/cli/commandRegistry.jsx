import React from 'react';

// Registry is the source of truth for all commands.
// Each entry: { handler: async fn, description, usage }
// handler receives: ({ args, flags, cwd, setCwd, setTheme, switchMode, addOutput })
// and returns: string | React node | null

const REGISTRY = {};

export function registerCommand(name, config) {
  REGISTRY[name] = config;
}

export function getCommand(name) {
  return REGISTRY[name] || null;
}

export function getAllCommands() {
  return Object.entries(REGISTRY).map(([name, cfg]) => ({
    name,
    description: cfg.description,
    usage: cfg.usage || name,
  }));
}

export function getAllCommandNames() {
  return Object.keys(REGISTRY);
}

/**
 * Levenshtein distance — used for "did you mean?" suggestions.
 */
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export function suggestCommand(input) {
  const names = getAllCommandNames();
  let best = null;
  let bestDist = Infinity;
  for (const name of names) {
    const d = levenshtein(input, name);
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  // Only suggest if reasonably close (distance ≤ 3)
  return bestDist <= 3 ? best : null;
}

export function notFound(cmdName) {
  const suggestion = suggestCommand(cmdName);
  return (
    <span style={{ color: 'var(--text-error)' }}>
      command not found: {cmdName}
      {suggestion && (
        <span style={{ color: 'var(--text-muted)' }}>
          {'\n'}Did you mean <span style={{ color: 'var(--text-primary)' }}>{suggestion}</span>?
        </span>
      )}
    </span>
  );
}
