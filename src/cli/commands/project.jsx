import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';
import { getProject } from '../../services/dataService.js';

registerCommand('project', {
  description: 'Detail view for one project',
  usage: 'project <slug>    (e.g. project quick-pull)',
  handler: async ({ args }) => {
    if (!args[0]) {
      return (
        <span style={{ color: 'var(--text-warn)' }}>
          Usage: project {'<slug>'}   (e.g. project quick-pull){'\n'}
          Run <span style={{ color: 'var(--text-primary)' }}>projects</span> to see all slugs.
        </span>
      );
    }

    let p;
    try {
      p = await getProject(args[0]);
    } catch {
      return (
        <span style={{ color: 'var(--text-error)' }}>
          No project found for "{args[0]}".{'\n'}
          Run <span style={{ color: 'var(--text-primary)' }}>projects</span> to see valid slugs.
        </span>
      );
    }

    return (
      <div style={{ whiteSpace: 'pre-wrap' }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1em' }}>{p.name}</div>
        <div style={{ color: 'var(--text-dim)', marginBottom: '8px' }}>{p.subtitle}</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '2px 12px', marginBottom: '10px' }}>
          <span style={{ color: 'var(--text-muted)' }}>team</span>
          <span style={{ color: 'var(--text-white)' }}>{p.team}</span>
          <span style={{ color: 'var(--text-muted)' }}>role</span>
          <span style={{ color: 'var(--text-white)' }}>{p.role}</span>
          <span style={{ color: 'var(--text-muted)' }}>stack</span>
          <span style={{ color: 'var(--text-white)' }}>{p.stack.join(', ')}</span>
          {p.github && (
            <>
              <span style={{ color: 'var(--text-muted)' }}>github</span>
              <a href={p.github} target="_blank" rel="noopener noreferrer">{p.github}</a>
            </>
          )}
          {p.live && (
            <>
              <span style={{ color: 'var(--text-muted)' }}>live</span>
              <a href={p.live} target="_blank" rel="noopener noreferrer">{p.live}</a>
            </>
          )}
        </div>

        <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Highlights:</div>
        {p.highlights.map((h, i) => (
          <div key={i} style={{ color: 'var(--text-white)', paddingLeft: '12px' }}>
            {'·  '}{h}
          </div>
        ))}
      </div>
    );
  },
});
