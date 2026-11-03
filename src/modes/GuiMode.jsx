import React, { useEffect } from 'react';
import Desktop from '../gui/Desktop.jsx';
import '../styles/gui/tokens.css';

/**
 * GuiMode — entry point for the macOS-style desktop.
 * switchMode: function('cli'|'landing') from App.
 */
export default function GuiMode({ switchMode }) {
  // Listen for mode-switch events emitted by the Terminal app window
  useEffect(() => {
    function onSwitch(e) {
      switchMode(e.detail);
    }
    window.addEventListener('portfolio:switchMode', onSwitch);
    return () => window.removeEventListener('portfolio:switchMode', onSwitch);
  }, [switchMode]);

  return <Desktop switchMode={switchMode} />;
}
