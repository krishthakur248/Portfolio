import React, { useState } from 'react';
import { Mail, MapPin, Copy, Check, ExternalLink } from 'lucide-react';
import { getContactSync as getContact } from '../../services/dataService.js';
import styles from '../../styles/gui/AppPanel.module.css';
import contactStyles from '../../styles/gui/Contact.module.css';

function GithubSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/>
    </svg>
  );
}

function LinkedinSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

export default function Contact() {
  const contact = getContact();
  const [copied, setCopied] = useState(false);

  function handleCopyEmail(e) {
    e.preventDefault();
    if (contact?.email) {
      navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const gmailComposeUrl = contact?.email
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}`
    : null;

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Get in touch</h3>
        <p className={styles.text} style={{ marginBottom: 20 }}>
          Open to engineering roles, collaborations, and conversations.
        </p>

        <div className={contactStyles.list}>
          {/* ── Email Card with direct Gmail compose & 1-click Copy ── */}
          {contact?.email && (
            <div className={contactStyles.row}>
              <div className={contactStyles.icon}>
                <Mail size={16} aria-hidden="true" />
              </div>
              <div className={contactStyles.info}>
                <span className={contactStyles.label}>Email</span>
                <span className={contactStyles.value}>{contact.email}</span>
              </div>
              <div className={contactStyles.actions}>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className={contactStyles.actionBtn}
                  aria-label="Copy email address"
                >
                  {copied ? (
                    <>
                      <Check size={13} style={{ color: 'var(--gui-accent)' }} />
                      <span style={{ color: 'var(--gui-accent)' }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {gmailComposeUrl && (
                  <a
                    href={gmailComposeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${contactStyles.actionBtn} ${contactStyles.primaryBtn}`}
                    aria-label="Compose email in Gmail"
                  >
                    <ExternalLink size={13} />
                    <span>Gmail</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ── GitHub ── */}
          {contact?.github && (
            <div className={contactStyles.row}>
              <div className={contactStyles.icon}>
                <GithubSVG />
              </div>
              <div className={contactStyles.info}>
                <span className={contactStyles.label}>GitHub</span>
                <a
                  href={contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={contactStyles.value}
                >
                  {contact.github}
                </a>
              </div>
              <div className={contactStyles.actions}>
                <a
                  href={contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={contactStyles.actionBtn}
                  aria-label="Open GitHub profile"
                >
                  <ExternalLink size={13} />
                  <span>Visit</span>
                </a>
              </div>
            </div>
          )}

          {/* ── LinkedIn ── */}
          {contact?.linkedin && (
            <div className={contactStyles.row}>
              <div className={contactStyles.icon}>
                <LinkedinSVG />
              </div>
              <div className={contactStyles.info}>
                <span className={contactStyles.label}>LinkedIn</span>
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={contactStyles.value}
                >
                  {contact.linkedin}
                </a>
              </div>
              <div className={contactStyles.actions}>
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={contactStyles.actionBtn}
                  aria-label="Open LinkedIn profile"
                >
                  <ExternalLink size={13} />
                  <span>Visit</span>
                </a>
              </div>
            </div>
          )}

          {/* ── Location ── */}
          {contact?.location && (
            <div className={contactStyles.row}>
              <div className={contactStyles.icon}>
                <MapPin size={16} aria-hidden="true" />
              </div>
              <div className={contactStyles.info}>
                <span className={contactStyles.label}>Location</span>
                <span className={contactStyles.value}>{contact.location}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
