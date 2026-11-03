import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';
import { getContact } from '../../services/dataService.js';

registerCommand('contact', {
  description: 'Get in touch — email, phone, social links',
  usage: 'contact',
  handler: async () => {
    const c = await getContact();
    return (
      <div style={{ whiteSpace: 'pre-wrap' }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '8px' }}>
          Let's talk.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '4px 16px' }}>
          <span style={{ color: 'var(--text-muted)' }}>email</span>
          <a href={`mailto:${c.email}`} target="_blank" rel="noopener noreferrer">{c.email}</a>

          <span style={{ color: 'var(--text-muted)' }}>phone</span>
          <span style={{ color: 'var(--text-white)' }}>{c.phone}</span>

          <span style={{ color: 'var(--text-muted)' }}>github</span>
          <a href={c.github} target="_blank" rel="noopener noreferrer">{c.github}</a>

          <span style={{ color: 'var(--text-muted)' }}>linkedin</span>
          <a href={c.linkedin} target="_blank" rel="noopener noreferrer">{c.linkedin}</a>

          <span style={{ color: 'var(--text-muted)' }}>location</span>
          <span style={{ color: 'var(--text-white)' }}>{c.location}</span>
        </div>
      </div>
    );
  },
});
