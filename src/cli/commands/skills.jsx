import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';
import { getSkills } from '../../services/dataService.js';

registerCommand('skills', {
  description: 'Technical skills by category',
  usage: 'skills',
  handler: async () => {
    const skills = await getSkills();
    return (
      <div style={{ whiteSpace: 'pre' }}>
        {skills.map((group) => (
          <div key={group._id} style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {group.category.padEnd(20)}
            </span>
            <span style={{ color: 'var(--text-white)' }}>
              {group.items.join('  ·  ')}
            </span>
          </div>
        ))}
      </div>
    );
  },
});
