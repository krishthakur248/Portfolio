import React, { useState } from 'react';
import { ExternalLink, Users, ChevronRight } from 'lucide-react';

function GithubSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/>
    </svg>
  );
}
import { getProjectsSync as getProjects } from '../../services/dataService.js';
import styles from '../../styles/gui/AppPanel.module.css';
import projStyles from '../../styles/gui/Projects.module.css';

export default function Projects() {
  const projects = getProjects();
  const [selected, setSelected] = useState(null);

  React.useEffect(() => {
    function handleOpenProject(e) {
      if (e.detail?.projectId) {
        setSelected(e.detail.projectId);
      }
    }
    window.addEventListener('portfolio:openProject', handleOpenProject);
    return () => window.removeEventListener('portfolio:openProject', handleOpenProject);
  }, []);

  if (selected) {
    const p = projects.find((x) => x._id === selected);
    return (
      <div className={styles.panel}>
        <button
          className={projStyles.back}
          onClick={() => setSelected(null)}
          type="button"
          aria-label="Back to projects list"
        >
          ← All Projects
        </button>

        <h2 className={projStyles.detailName}>{p.name}</h2>
        <p className={projStyles.detailSub}>{p.subtitle}</p>

        <div className={projStyles.meta}>
          <span><Users size={12} aria-hidden="true" /> {p.team}</span>
          <span>Role: {p.role}</span>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Stack</h3>
          <div>{p.stack.map((t) => <span key={t} className={styles.tag}>{t}</span>)}</div>
        </div>

        {p.highlights?.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Highlights</h3>
            <ul className={projStyles.highlights}>
              {p.highlights.map((h, i) => (
                <li key={i} className={styles.text}>{h}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          {p.github && (
            <a href={p.github} target="_blank" rel="noopener noreferrer" className={styles.link}>
              <GithubSVG /> GitHub
            </a>
          )}
          {p.live && (
            <a href={p.live} target="_blank" rel="noopener noreferrer" className={styles.link}>
              <ExternalLink size={14} aria-hidden="true" /> Live
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Projects — {projects.length}</h3>
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
              <ChevronRight size={14} aria-hidden="true" className={projStyles.arrow} />
            </div>
            <p className={projStyles.cardSub}>{p.subtitle}</p>
            <div className={projStyles.cardTags}>
              {p.stack.slice(0, 4).map((t) => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
              {p.stack.length > 4 && (
                <span className={styles.tag}>+{p.stack.length - 4}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

