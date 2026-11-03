import { useState, useCallback, useRef } from 'react';
import { parseInput } from './parser.jsx';
import { getCommand, notFound, getAllCommandNames } from './commandRegistry.jsx';
import { HOME_DIR, resolvePath, statPath, getChildNames } from './fileSystem.jsx';

// Import all commands so they self-register
import './commands/help.jsx';
import './commands/about.jsx';
import './commands/skills.jsx';
import './commands/projects.jsx';
import './commands/project.jsx';
import './commands/experience.jsx';
import './commands/education.jsx';
import './commands/contact.jsx';
import './commands/resume.jsx';
import './commands/whoami.jsx';
import './commands/filesystem.jsx';
import './commands/utils.jsx';
import './commands/easter.jsx';

/**
 * useTerminal — all terminal state in one hook.
 *
 * Returns: { output, input, setInput, cwd, theme, submitCommand, handleKeyDown }
 */
export function useTerminal({ switchMode }) {
  // The banner is rendered by Terminal.jsx as a <WelcomeBanner windowed={windowed} /> component,
  // which lets it adapt to window vs. fullscreen mode. This item is just a type marker.
  const WELCOME_MESSAGE = {
    id: 'welcome',
    type: 'banner',   // handled specially in Terminal.jsx
    content: null,
  };


  const [output, setOutput] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState(HOME_DIR);
  const [theme, setTheme] = useState('hacker');

  // Full command history (for ↑/↓ navigation)
  const historyRef = useRef([]);
  const historyIdxRef = useRef(-1);  // -1 = at the live input (not browsing history)
  const savedInputRef = useRef(''); // saves what the user was typing before browsing history

  const addOutputItem = useCallback((item) => {
    setOutput((prev) => [...prev, { id: Date.now() + Math.random(), ...item }]);
  }, []);

  const submitCommand = useCallback(
    async (raw) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      // Add the command line to history
      historyRef.current = [trimmed, ...historyRef.current];
      historyIdxRef.current = -1;
      savedInputRef.current = '';

      // Show the prompt + command in output
      addOutputItem({ type: 'input', content: trimmed });

      // Parse
      const { command, args, flags } = parseInput(trimmed);
      if (!command) return;

      const cmd = getCommand(command);

      if (!cmd) {
        addOutputItem({ type: 'output', content: notFound(command) });
        return;
      }

      // Show "fetching..." only for commands that go to the service layer
      const ASYNC_COMMANDS = new Set([
        'about', 'skills', 'projects', 'project', 'experience',
        'education', 'contact', 'resume', 'whoami', 'neofetch',
      ]);

      let loadingId = null;
      if (ASYNC_COMMANDS.has(command)) {
        loadingId = Date.now() + Math.random();
        setOutput((prev) => [
          ...prev,
          { id: loadingId, type: 'output', content: <span style={{ color: 'var(--text-muted)' }}>fetching...</span> },
        ]);
      }

      try {
        const result = await cmd.handler({
          args,
          flags,
          cwd,
          setCwd,
          setTheme,
          switchMode,
          history: historyRef.current,
        });

        // Remove the "fetching..." line
        if (loadingId !== null) {
          setOutput((prev) => prev.filter((item) => item.id !== loadingId));
        }

        if (result === '__CLEAR__') {
          setOutput([]);
          return;
        }

        if (result === '__RESTART__') {
          setCwd(HOME_DIR);
          historyIdxRef.current = -1;
          savedInputRef.current = '';
          setOutput([{ id: `welcome-${Date.now()}`, type: 'banner', content: null }]);
          return;
        }

        if (result !== null && result !== undefined) {
          addOutputItem({ type: 'output', content: result });
        }
      } catch (err) {
        if (loadingId !== null) {
          setOutput((prev) => prev.filter((item) => item.id !== loadingId));
        }
        addOutputItem({
          type: 'output',
          content: (
            <span style={{ color: 'var(--text-error)' }}>
              Error: {err.message || 'Something went wrong.'}
            </span>
          ),
        });
      }
    },
    [cwd, setCwd, setTheme, switchMode, addOutputItem]
  );

  /**
   * Tab autocomplete.
   * For filesystem commands (cd, cat), also completes filenames in cwd.
   */
  const handleTab = useCallback(() => {
    const trimmed = input.trim();
    const tokens = trimmed.split(/\s+/);

    // Complete command name if only one token typed
    if (tokens.length === 1) {
      const partial = tokens[0].toLowerCase();
      const matches = getAllCommandNames().filter((n) => n.startsWith(partial));
      if (matches.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        // Show matches as output without submitting
        addOutputItem({
          type: 'output',
          content: (
            <span style={{ color: 'var(--text-muted)' }}>
              {matches.join('    ')}
            </span>
          ),
        });
      }
      return;
    }

    // Complete filename for cd and cat
    const cmd = tokens[0].toLowerCase();
    if (cmd === 'cd' || cmd === 'cat') {
      const partial = tokens[tokens.length - 1] || '';
      const children = getChildNames(cwd);
      const matches = children.filter((n) => n.startsWith(partial));
      if (matches.length === 1) {
        const rest = tokens.slice(0, -1).join(' ');
        setInput(`${rest} ${matches[0]}`.trim() + ' ');
      } else if (matches.length > 1) {
        addOutputItem({
          type: 'output',
          content: <span style={{ color: 'var(--text-muted)' }}>{matches.join('    ')}</span>,
        });
      }
    }
  }, [input, cwd, addOutputItem]);

  const handleKeyDown = useCallback(
    (e) => {
      // Enter → submit
      if (e.key === 'Enter') {
        e.preventDefault();
        submitCommand(input);
        setInput('');
        return;
      }

      // Ctrl+C → abort current line, fresh prompt (unless user selected text to copy)
      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        const sel = window.getSelection();
        if (!sel || sel.toString().length === 0) {
          e.preventDefault();
          addOutputItem({ type: 'input', content: input + ' ^C' });
          setInput('');
          return;
        }
      }

      // Ctrl+L → clear
      if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        setOutput([]);
        return;
      }

      // Tab → autocomplete
      if (e.key === 'Tab') {
        e.preventDefault();
        handleTab();
        return;
      }

      // ↑ → go back in history
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const hist = historyRef.current;
        if (hist.length === 0) return;
        if (historyIdxRef.current === -1) {
          savedInputRef.current = input;
        }
        const nextIdx = Math.min(historyIdxRef.current + 1, hist.length - 1);
        historyIdxRef.current = nextIdx;
        setInput(hist[nextIdx]);
        return;
      }

      // ↓ → go forward in history
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdxRef.current === -1) return;
        const nextIdx = historyIdxRef.current - 1;
        historyIdxRef.current = nextIdx;
        setInput(nextIdx === -1 ? savedInputRef.current : historyRef.current[nextIdx]);
        return;
      }
    },
    [input, submitCommand, handleTab]
  );

  return {
    output,
    input,
    setInput,
    cwd,
    theme,
    submitCommand,
    handleKeyDown,
  };
}
