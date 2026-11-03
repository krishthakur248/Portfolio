import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { getGuiConfigSync as getGuiConfig, getProfileSync as getProfile } from '../../services/dataService.js';
import useWindowStore from '../store/useWindowStore.js';
import styles from '../../styles/gui/AppPanel.module.css';
import welcomeStyles from '../../styles/gui/Welcome.module.css';

export default function Welcome({ winId }) {
  const { closeApp } = useWindowStore();
  const gui     = getGuiConfig();
  const profile = getProfile();

  function handleClose() {
    localStorage.setItem('gui_welcome_seen', '1');
    closeApp(winId);
  }

  return (
    <div className={welcomeStyles.wrap}>
      <div className={welcomeStyles.emoji} aria-hidden="true">👋</div>
      <h2 className={welcomeStyles.heading}>Hey, I'm {profile.name.split(' ')[0]}.</h2>
      <p className={welcomeStyles.body}>
        {gui.welcomeText ?? 'Welcome to my portfolio. Click around and explore.'}
      </p>
      <div className={welcomeStyles.footer}>
        <span className={welcomeStyles.hint}>Double-click an icon to open it</span>
        <button
          className={welcomeStyles.closeBtn}
          onClick={handleClose}
          type="button"
          aria-label="Close welcome note"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

