import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { getProfileSync as getProfile } from '../../services/dataService.js';
import { useIsMobile } from '../hooks/useIsMobile.js';
import styles from '../../styles/gui/AppPanel.module.css';
import resumeStyles from '../../styles/gui/Resume.module.css';

export default function Resume() {
  const profile  = getProfile();
  const pdfSrc   = profile.resume_pdf || '/img/Resume.pdf';
  const imageSrc = '/img/ResumeImg.png';
  const isMobile = useIsMobile();

  return (
    <div className={resumeStyles.wrap}>
      {/* ── Toolbar: title + action buttons ── */}
      <div className={resumeStyles.toolbar}>
        <div className={resumeStyles.titleInfo}>
          <span className={resumeStyles.label}>Resume — {profile.name}</span>
          <span className={resumeStyles.subLabel}>Software Engineer · B.E. CSE</span>
        </div>

        <div className={resumeStyles.actions}>
          {/* Open Full Vector PDF in Dedicated Browser Tab */}
          <a
            href={pdfSrc}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label="Open full vector resume in dedicated browser tab"
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

      {/* ── Document View ── */}
      {isMobile ? (
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
      ) : (
        <div className={resumeStyles.viewerContainer}>
          <div className={resumeStyles.pdfWrapper}>
            <iframe
              src={`${pdfSrc}#toolbar=0&navpanes=0&view=FitH`}
              className={resumeStyles.pdfEmbed}
              title={`${profile.name} Resume`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
