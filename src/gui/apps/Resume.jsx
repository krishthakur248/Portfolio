import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { getProfileSync as getProfile } from '../../services/dataService.js';
import styles from '../../styles/gui/AppPanel.module.css';
import resumeStyles from '../../styles/gui/Resume.module.css';

export default function Resume() {
  const profile  = getProfile();
  const pdfSrc   = profile.resume_pdf || '/img/Resume.pdf';
  const imageSrc = '/img/ResumeImg.png';

  return (
    <div className={resumeStyles.wrap}>
      {/* ── Toolbar: title + action buttons ── */}
      <div className={resumeStyles.toolbar}>
        <div className={resumeStyles.titleInfo}>
          <span className={resumeStyles.label}>Resume — {profile.name}</span>
          <span className={resumeStyles.subLabel}>Software Engineer · B.E. CSE</span>
        </div>

        <div className={resumeStyles.actions}>
          {/* Open Full Resume in Dedicated Browser Tab */}
          <a
            href="/resume.html"
            target="_blank"
            rel="noopener"
            className={styles.link}
            aria-label="Open full resume in dedicated browser tab"
          >
            <ExternalLink size={14} aria-hidden="true" />
            <span>Open in Tab</span>
          </a>

          {/* Download PDF file directly */}
          <a
            href={pdfSrc}
            download="Krish_Thakur_Resume.pdf"
            className={`${styles.link} ${resumeStyles.downloadBtn}`}
            aria-label="Download resume PDF"
          >
            <Download size={14} aria-hidden="true" />
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      {/* ── Scrollable Document Preview ── */}
      <div className={resumeStyles.scrollArea}>
        <div className={resumeStyles.paperWrapper}>
          <img
            src={imageSrc}
            alt={`${profile.name} Resume`}
            className={resumeStyles.paper}
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
