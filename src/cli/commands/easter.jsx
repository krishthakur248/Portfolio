import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';

// ── sudo hire-me ──────────────────────────────────────────────
registerCommand('sudo', {
  description: 'You know what this does.',
  usage: 'sudo hire-me',
  handler: async ({ args }) => {
    const sub = args.join(' ').toLowerCase();

    if (sub === 'hire-me') {
      return (
        <div style={{ whiteSpace: 'pre', color: 'var(--text-primary)' }}>
{`
[sudo] password for visitor: ••••••••
Authenticating...
Access granted. ✓

  ██╗  ██╗██╗██████╗ ███████╗    ███╗   ███╗███████╗
  ██║  ██║██║██╔══██╗██╔════╝    ████╗ ████║██╔════╝
  ███████║██║██████╔╝█████╗      ██╔████╔██║█████╗
  ██╔══██║██║██╔══██╗██╔══╝      ██║╚██╔╝██║██╔══╝
  ██║  ██║██║██║  ██║███████╗    ██║ ╚═╝ ██║███████╗
  ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝     ╚═╝╚══════╝

Executing: hire Krish Thakur...
`}
          <span style={{ color: 'var(--text-white)' }}>
            Smart call. He builds real things: ride-sharing platforms, offline mesh networks,{'\n'}
            mentoring tools. CGPA 9.94. 600+ LeetCode problems. MERN + Android + DSA.
          </span>
          {'\n\n'}
          <span style={{ color: 'var(--text-dim)' }}>Reach him at: </span>
          <a href="mailto:krishthakur248@gmail.com" style={{ color: 'var(--text-link)' }}>
            krishthakur248@gmail.com
          </a>
        </div>
      );
    }

    return (
      <span style={{ color: 'var(--text-error)' }}>
        sudo: permission denied.{'\n'}
        <span style={{ color: 'var(--text-muted)' }}>
          (Try <span style={{ color: 'var(--text-primary)' }}>sudo hire-me</span>)
        </span>
      </span>
    );
  },
});


