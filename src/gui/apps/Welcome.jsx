import React from 'react';
import { FolderGit2, Code2, Search, ArrowRight } from 'lucide-react';
import { getProfileSync as getProfile } from '../../services/dataService.js';
import useWindowStore from '../store/useWindowStore.js';
import welcomeStyles from '../../styles/gui/Welcome.module.css';

export default function Welcome({ winId }) {
  const { closeApp, openApp } = useWindowStore();
  const profile = getProfile();
  const photoSrc = profile?.photo || '/img/Me.jpeg';

  function handleClose() {
    localStorage.setItem('gui_welcome_seen', '1');
    closeApp(winId);
  }

  function handleOpenProjects() {
    handleClose();
    openApp('projects');
  }

  return (
    <div className={welcomeStyles.wrap}>
      {/* Author Hero Header */}
      <div className={welcomeStyles.heroRow}>
        <img
          src={photoSrc}
          alt={profile.name}
          className={welcomeStyles.avatar}
          width={52}
          height={52}
        />
        <div className={welcomeStyles.heroText}>
          <span className={welcomeStyles.heroBadge}>Portfolio Desktop</span>
          <h2 className={welcomeStyles.heading}>{profile.name}</h2>
          <p className={welcomeStyles.subheading}>
            {profile.role} · Chitkara University (CGPA 9.94)
          </p>
        </div>
      </div>

      <p className={welcomeStyles.introText}>
        An interactive desktop environment showcasing full-stack systems, live LeetCode stats, and technical skills.
      </p>

      {/* 3-Card Guide Grid */}
      <div className={welcomeStyles.guideGrid}>
        <div className={welcomeStyles.guideCard}>
          <div className={welcomeStyles.cardIconWrap}>
            <FolderGit2 size={15} className={welcomeStyles.cardIcon} aria-hidden="true" />
          </div>
          <div className={welcomeStyles.cardBody}>
            <span className={welcomeStyles.cardTitle}>Projects &amp; Apps</span>
            <span className={welcomeStyles.cardDesc}>
              Launch Quick Pull, SkillXchange, and MeshGuard from the dock or desktop.
            </span>
          </div>
        </div>

        <div className={welcomeStyles.guideCard}>
          <div className={welcomeStyles.cardIconWrap}>
            <Code2 size={15} className={welcomeStyles.cardIcon} aria-hidden="true" />
          </div>
          <div className={welcomeStyles.cardBody}>
            <span className={welcomeStyles.cardTitle}>Live Widgets</span>
            <span className={welcomeStyles.cardDesc}>
              Real-time LeetCode count (580+ solved), live weather, and draggable cards.
            </span>
          </div>
        </div>

        <div className={welcomeStyles.guideCard}>
          <div className={welcomeStyles.cardIconWrap}>
            <Search size={15} className={welcomeStyles.cardIcon} aria-hidden="true" />
          </div>
          <div className={welcomeStyles.cardBody}>
            <span className={welcomeStyles.cardTitle}>Spotlight Search</span>
            <span className={welcomeStyles.cardDesc}>
              Press <kbd className={welcomeStyles.kbd}>⌘K</kbd> to search across apps, stack keywords, and terminal commands.
            </span>
          </div>
        </div>
      </div>

      {/* Footer Navigation Actions */}
      <div className={welcomeStyles.footerRow}>
        <span className={welcomeStyles.hint}>
          Tip: Double-click desktop icons or use the dock below
        </span>

        <div className={welcomeStyles.actions}>
          <button
            type="button"
            className={welcomeStyles.secondaryBtn}
            onClick={handleClose}
            aria-label="Dismiss welcome dialog"
          >
            Dismiss
          </button>
          <button
            type="button"
            className={welcomeStyles.primaryBtn}
            onClick={handleOpenProjects}
            aria-label="Explore Projects"
          >
            <span>Explore Projects</span>
            <ArrowRight size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
