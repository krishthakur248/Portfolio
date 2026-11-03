/**
 * parser.js — splits raw input into { command, args, flags }
 *
 * Examples:
 *   "project quick-pull"   → { command: "project", args: ["quick-pull"], flags: {} }
 *   "resume --download"    → { command: "resume",  args: [],             flags: { download: true } }
 *   "echo hello world"     → { command: "echo",    args: ["hello","world"], flags: {} }
 *   "theme dark"           → { command: "theme",   args: ["dark"],       flags: {} }
 */
export function parseInput(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return { command: '', args: [], flags: {} };

  const tokens = trimmed.split(/\s+/);
  const command = tokens[0].toLowerCase();
  const args = [];
  const flags = {};

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.startsWith('--')) {
      // Long flag: --download → flags.download = true
      flags[token.slice(2)] = true;
    } else if (token.startsWith('-') && token.length === 2) {
      // Short flag: -d → flags.d = true
      flags[token.slice(1)] = true;
    } else {
      args.push(token);
    }
  }

  return { command, args, flags };
}
