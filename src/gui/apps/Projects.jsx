import React, { useState, useEffect } from 'react';
import { ExternalLink, Users, Award, ArrowLeft, ChevronRight } from 'lucide-react';
import { getProjectsSync as getProjects } from '../../services/dataService.js';
import { getSkillIcon, CheckIcon, GithubIcon } from './SkillIcons.jsx';
import styles from '../../styles/gui/AppPanel.module.css';
import projStyles from '../../styles/gui/Projects.module.css';

export default function Projects() {
  const projects = getProjects();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    function handleOpenProject(e) {
      if (e.detail?.projectId) {
        setSelected(e.detail.projectId);
      }
    }
    window.addEventListener('portfolio:openProject', handleOpenProject);
    return () => window.removeEventListener('portfolio:openProject', handleOpenProject);
  }, []);

  if (selected) {
    const p = projects.find((x) => x._id === selected) || projects[0];

    return (
      <div className={styles.panel}>
        <div className={projStyles.detailContainer}>
          {/* Back button */}
          <button
            className={projStyles.backBtn}
            onClick={() => setSelected(null)}
            type="button"
            aria-label="Back to all projects"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>All Projects</span>
          </button>

          {/* Header: Title + Subtitle */}
          <div className={projStyles.headerSection}>
            <div className={projStyles.titleRow}>
              <h2 className={projStyles.detailTitle}>{p.name}</h2>
              {p.subtitle && (
                <span className={projStyles.detailSubtitle}>{p.subtitle}</span>
              )}
            </div>

            {/* Metadata: Team & Role */}
            <div className={projStyles.metaRow}>
              {p.team && (
                <span className={projStyles.metaItem}>
                  <Users size={14} aria-hidden="true" className={projStyles.metaIcon} />
                  <span>{p.team}</span>
                </span>
              )}
              {p.team && p.role && <span className={projStyles.metaDot}>·</span>}
              {p.role && (
                <span className={projStyles.metaItem}>
                  <Award size={14} aria-hidden="true" className={projStyles.metaIcon} />
                  <span>Role: {p.role}</span>
                </span>
              )}
            </div>
          </div>

          {/* STACK Section */}
          {p.stack?.length > 0 && (
            <div className={projStyles.sectionBlock}>
              <h3 className={projStyles.sectionHeading}>STACK</h3>
              <div className={projStyles.pillsRow}>
                {p.stack.map((tech) => {
                  const IconComponent = getSkillIcon(tech);
                  // Clean display label (e.g. "Jitsi Meet API" -> "Jitsi")
                  const displayLabel = tech.replace(/ Meet API$/i, '');
                  return (
                    <div key={tech} className={projStyles.stackPill}>
                      <span className={projStyles.pillIcon}>
                        <IconComponent />
                      </span>
                      <span className={projStyles.pillLabel}>{displayLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HIGHLIGHTS Section */}
          {p.highlights?.length > 0 && (
            <div className={projStyles.sectionBlock}>
              <h3 className={projStyles.sectionHeading}>HIGHLIGHTS</h3>
              <div className={projStyles.highlightsCard}>
                {p.highlights.map((highlight, idx) => (
                  <div key={idx} className={projStyles.highlightItem}>
                    <span className={projStyles.checkWrapper}>
                      <CheckIcon />
                    </span>
                    <span className={projStyles.highlightText}>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions: GitHub & Live */}
          {(p.github || p.live) && (
            <div className={projStyles.actionsRow}>
              {p.github && (
                <a
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={projStyles.actionBtn}
                >
                  <GithubIcon />
                  <span>GitHub</span>
                </a>
              )}
              {p.live && (
                <a
                  href={p.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${projStyles.actionBtn} ${projStyles.liveBtn}`}
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  <span>Live</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={projStyles.listHeader}>
        <h3 className={projStyles.sectionHeading}>FEATURED PROJECTS — {projects.length}</h3>
      </div>
      <div className={projStyles.grid}>
        {projects.map((p) => (
          <button
            key={p._id}
            className={projStyles.card}
            onClick={() => setSelected(p._id)}
            type="button"
            aria-label={`Open ${p.name}`}
          >
            <div className={projStyles.cardTop}>
              <span className={projStyles.cardName}>{p.name}</span>
              <ChevronRight size={16} aria-hidden="true" className={projStyles.arrow} />
            </div>
            <p className={projStyles.cardSub}>{p.subtitle}</p>

            <div className={projStyles.cardMeta}>
              {p.team && (
                <span className={projStyles.cardMetaItem}>
                  <Users size={12} aria-hidden="true" />
                  <span>{p.team}</span>
                </span>
              )}
              {p.team && p.role && <span className={projStyles.cardMetaDot}>·</span>}
              {p.role && (
                <span className={projStyles.cardMetaItem}>
                  <Award size={12} aria-hidden="true" />
                  <span>{p.role}</span>
                </span>
              )}
            </div>

            <div className={projStyles.cardTags}>
              {p.stack.slice(0, 4).map((tech) => {
                const IconComponent = getSkillIcon(tech);
                const displayLabel = tech.replace(/ Meet API$/i, '');
                return (
                  <span key={tech} className={projStyles.cardTagPill}>
                    <span className={projStyles.miniIcon}>
                      <IconComponent />
                    </span>
                    <span>{displayLabel}</span>
                  </span>
                );
              })}
              {p.stack.length > 4 && (
                <span className={projStyles.cardTagMore}>+{p.stack.length - 4}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
