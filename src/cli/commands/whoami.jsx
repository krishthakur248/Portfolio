import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';
import { getProfile } from '../../services/dataService.js';

/**
 * whoami / neofetch — photo (tinted, terminal-native) on the left, info on the right.
 * The photo uses CSS grayscale + teal-tint to sit naturally inside the terminal aesthetic.
 */
function NeofetchOutput({ profile }) {
  const info = [
    { label: 'name',     value: profile.name },
    { label: 'role',     value: profile.role },
    { label: 'edu',      value: 'Chitkara University, CSE' },
    { label: 'cgpa',     value: '9.94 / 10' },
    { label: 'stack',    value: 'MERN · Android · DSA' },
    { label: 'github',   value: profile.links.github,   link: true },
    { label: 'linkedin', value: profile.links.linkedin, link: true },
    { label: 'email',    value: profile.email,          link: true, mailto: true },
    { label: 'location', value: profile.location },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      }}
    >
      {/* Photo — tinted to look terminal-native */}
      <div
        style={{
          flexShrink: 0,
          border: '1px solid var(--text-dim)',
          padding: '3px',
          background: 'var(--bg-terminal)',
          boxShadow: 'var(--glow-teal)',
        }}
      >
        <img
          src={profile.photo}
          alt="Krish Thakur"
          style={{
            display: 'block',
            width: '140px',
            height: '140px',
            objectFit: 'cover',
            objectPosition: 'top',
            filter: 'grayscale(100%) sepia(60%) hue-rotate(120deg) saturate(180%) brightness(0.85)',
          }}
        />
      </div>

      {/* Info panel */}
      <div style={{ whiteSpace: 'pre', lineHeight: 1.9 }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1em', marginBottom: '4px' }}>
          {profile.name}
        </div>
        <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
          {'─'.repeat(28)}
        </div>
        {info.map(({ label, value, link, mailto }) => (
          <div key={label}>
            <span style={{ color: 'var(--text-primary)', display: 'inline-block', minWidth: '80px' }}>
              {label}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>: </span>
            {link ? (
              <a
                href={mailto ? `mailto:${value}` : value}
                target={mailto ? undefined : '_blank'}
                rel="noopener noreferrer"
                style={{ color: 'var(--text-link)' }}
              >
                {value}
              </a>
            ) : (
              <span style={{ color: 'var(--text-white)' }}>{value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const handler = async () => {
  const profile = await getProfile();
  return <NeofetchOutput profile={profile} />;
};

registerCommand('whoami', {
  description: 'Who is this? Photo + system info',
  usage: 'whoami',
  handler,
});

registerCommand('neofetch', {
  description: 'Alias for whoami — photo + info panel',
  usage: 'neofetch',
  handler,
});
