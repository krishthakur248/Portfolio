import React, { useEffect, useRef } from 'react';
import Terminal from '../../cli/Terminal.jsx';
import useWindowStore from '../store/useWindowStore.js';

/**
 * TerminalApp — embeds the CLI Terminal inside a GUI window.
 *
 * Passes embedded={true} so Terminal renders cleanly without inner chrome.
 * Ensures typing and clicking anywhere inside the window seamlessly focuses the terminal prompt.
 */
export default function TerminalApp({ winId }) {
  const isFocused = useWindowStore((s) => s.getFocusedId() === winId);
  const focusApp = useWindowStore((s) => s.focusApp);
  const closeApp = useWindowStore((s) => s.closeApp);
  const containerRef = useRef(null);

  // Close this window when 'exit' command is executed inside Terminal
  useEffect(() => {
    function handleClose() {
      if (isFocused) {
        closeApp(winId);
      }
    }
    window.addEventListener('portfolio:closeTerminal', handleClose);
    return () => window.removeEventListener('portfolio:closeTerminal', handleClose);
  }, [winId, isFocused, closeApp]);

  function switchMode(next) {
    window.dispatchEvent(new CustomEvent('portfolio:switchMode', { detail: next }));
  }

  // Clicking anywhere inside the terminal focuses the window and immediately focuses the prompt input
  function handleContainerInteraction(e) {
    focusApp(winId);

    // Don't hijack clicks on external links or buttons
    if (e.target?.closest('a') || e.target?.closest('button')) return;

    // Preserve text selection if user is copying output
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;

    const input = containerRef.current?.querySelector('input');
    input?.focus();
  }

  return (
    <div
      ref={containerRef}
      onClick={handleContainerInteraction}
      onMouseDown={handleContainerInteraction}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        cursor: 'text',
      }}
    >
      <Terminal
        switchMode={switchMode}
        embedded={true}
        isWindowFocused={isFocused}
      />
    </div>
  );
}
