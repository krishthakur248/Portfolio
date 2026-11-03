import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';
import { getProjects } from '../../services/dataService.js';

registerCommand('projects', {
  description: 'All projects at a glance',
  usage: 'projects',
  handler: async () => {
    const projects = await getProjects();
    return (
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {projects.map((p, i) => (
          <div key={p._id} style={{ marginBottom: i < projects.length - 1 ? '14px' : 0 }}>
            <div>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{p.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>  [{p.slug}]</span>
            </div>
            <div style={{ color: 'var(--text-dim)' }}>{p.subtitle}</div>
            <div style={{ color: 'var(--text-white)', fontSize: '0.9em' }}>
              {p.team} · {p.role}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85em', marginTop: '2px' }}>
              Stack: {p.stack.join(', ')}
            </div>
            {p.live && (
              <div style={{ fontSize: '0.85em', marginTop: '2px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Live: </span>
                <a href={p.live} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--text-link)' }}>{p.live}</a>
              </div>
            )}
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>
              Run <span style={{ color: 'var(--text-primary)' }}>project {p.slug}</span> for details.
            </div>
          </div>
        ))}
      </div>
    );
  },
});
