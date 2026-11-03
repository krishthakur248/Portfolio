import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';
import { getEducation, getAchievements } from '../../services/dataService.js';

registerCommand('education', {
  description: 'Education background',
  usage: 'education',
  handler: async () => {
    const edu = await getEducation();
    const achievements = await getAchievements();

    return (
      <div style={{ whiteSpace: 'pre-wrap' }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '8px' }}>Education</div>
        {edu.map((e) => (
          <div key={e._id} style={{ marginBottom: '12px' }}>
            <div style={{ color: 'var(--text-white)', fontWeight: 600 }}>{e.institution}</div>
            <div style={{ color: 'var(--text-dim)' }}>{e.degree}</div>
            <div style={{ color: 'var(--text-muted)' }}>{e.location}  ·  {e.period}</div>
            <div style={{ color: 'var(--text-primary)' }}>CGPA: {e.cgpa}</div>
          </div>
        ))}

        <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '8px', marginBottom: '8px' }}>
          Achievements
        </div>
        {achievements.map((a) => (
          <div key={a._id} style={{ marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>{a.title}  </span>
            <span style={{ color: 'var(--text-white)' }}>{a.detail}</span>
          </div>
        ))}
      </div>
    );
  },
});
