import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';
import { getAllCommands } from '../commandRegistry.jsx';

registerCommand('help', {
  description: 'List all available commands',
  usage: 'help',
  handler: async () => {
    const commands = getAllCommands();
    return (
      <div style={{ whiteSpace: 'pre' }}>
        <div style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
          Available commands:
        </div>
        {commands.map(({ name, description }) => (
          <div key={name} style={{ display: 'flex', gap: '0' }}>
            <span style={{ color: 'var(--text-primary)', minWidth: '140px', display: 'inline-block' }}>
              {name.padEnd(18)}
            </span>
            <span style={{ color: 'var(--text-white)' }}>{description}</span>
          </div>
        ))}
        <div style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Tip: use ↑/↓ for history, Tab to autocomplete, Ctrl+L to clear.
        </div>
      </div>
    );
  },
});
