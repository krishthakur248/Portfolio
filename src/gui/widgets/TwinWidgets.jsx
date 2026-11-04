import React from 'react';
import DsaFocusWidget from './DsaFocusWidget.jsx';
import StatusWidget from './StatusWidget.jsx';
import styles from '../../styles/gui/Widgets.module.css';

export default function TwinWidgets() {
  return (
    <div className={styles.twinRow}>
      <DsaFocusWidget />
      <StatusWidget />
    </div>
  );
}
