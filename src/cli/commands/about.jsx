import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';
import { getProfile } from '../../services/dataService.js';

registerCommand('about', {
  description: 'Who I am — background, contact, links',
  usage: 'about',
  handler: async () => {
    const p = await getProfile();
    return (
      <div style={{ whiteSpace: 'pre-wrap' }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1em', marginBottom: '4px' }}>
          {p.name}
        </div>
        <div style={{ color: 'var(--text-dim)', marginBottom: '8px' }}>{p.role}</div>
        <div style={{ color: 'var(--text-white)', marginBottom: '12px', lineHeight: 1.6 }}>
          {p.bio}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '2px 12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>email</span>
          <a href={`mailto:${p.email}`} target="_blank" rel="noopener noreferrer">{p.email}</a>
          <span style={{ color: 'var(--text-muted)' }}>phone</span>
          <span style={{ color: 'var(--text-white)' }}>{p.phone}</span>
          <span style={{ color: 'var(--text-muted)' }}>location</span>
          <span style={{ color: 'var(--text-white)' }}>{p.location}</span>
          <span style={{ color: 'var(--text-muted)' }}>github</span>
          <a href={p.links.github} target="_blank" rel="noopener noreferrer">{p.links.github}</a>
          <span style={{ color: 'var(--text-muted)' }}>linkedin</span>
          <a href={p.links.linkedin} target="_blank" rel="noopener noreferrer">{p.links.linkedin}</a>
        </div>
      </div>
    );
  },
});
