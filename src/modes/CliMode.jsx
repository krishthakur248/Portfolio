import React from 'react';
import Terminal from '../cli/Terminal.jsx';
import styles from './CliMode.module.css';

/**
 * CliMode — wraps Terminal, provides a "switch to GUI" button.
 * switchMode: function('gui'|'landing') from App.
 */
export default function CliMode({ switchMode }) {
  return (
    <div className={styles.container}>
      <Terminal switchMode={switchMode} />
    </div>
  );
}
