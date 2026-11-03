import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';
import { getExperience } from '../../services/dataService.js';

registerCommand('experience', {
  description: 'Work experience and internships',
  usage: 'experience',
  handler: async () => {
    const exp = await getExperience();
    if (!exp || exp.length === 0) {
      return (
        <div style={{ whiteSpace: 'pre-wrap' }}>
          <div style={{ color: 'var(--text-muted)' }}>
            No formal work experience yet — I'm a 2nd year student.{'\n'}
            What I do have:{'\n'}
          </div>
          <div style={{ color: 'var(--text-white)', paddingLeft: '12px' }}>
            ·  Lead Contributor on Quick Pull (ride-sharing platform){'\n'}
            ·  Lead Contributor on SkillXchange (mentoring platform){'\n'}
            ·  Solo developer of MeshGuard (Android disaster app){'\n'}
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Run <span style={{ color: 'var(--text-primary)' }}>projects</span> or{' '}
            <span style={{ color: 'var(--text-primary)' }}>education</span> for more.
          </div>
        </div>
      );
    }

    return (
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {exp.map((e) => (
          <div key={e._id} style={{ marginBottom: '12px' }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{e.role}</div>
            <div style={{ color: 'var(--text-white)' }}>{e.company}</div>
            <div style={{ color: 'var(--text-muted)' }}>{e.period}</div>
            {e.bullets && e.bullets.map((b, i) => (
              <div key={i} style={{ color: 'var(--text-white)', paddingLeft: '12px' }}>·  {b}</div>
            ))}
          </div>
        ))}
      </div>
    );
  },
});
