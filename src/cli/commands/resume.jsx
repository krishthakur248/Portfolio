import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';
import { getProfile } from '../../services/dataService.js';

registerCommand('resume', {
  description: 'View resume in terminal, or --download to get the PDF',
  usage: 'resume  |  resume --download',
  handler: async ({ flags }) => {
    const p = await getProfile();

    if (flags.download) {
      const a = document.createElement('a');
      a.href = p.resume_pdf;
      a.download = 'Krish_Thakur_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return <span style={{ color: 'var(--text-primary)' }}>Downloading resume PDF...</span>;
    }

    // ── Shared section-heading style ──
    const sec = {
      color: 'var(--text-primary)',
      fontWeight: 700,
      marginBottom: '4px',
      marginTop: '14px',
      letterSpacing: '0.06em',
    };

    return (
      /*
        Resume document: indented right (marginLeft) so start/end
        is clearly visible. No left border (removed by user request).
      */
      <div style={{
        fontFamily: 'var(--font-mono)',
        lineHeight: 1.6,
        marginLeft: '20px',
        paddingTop: '4px',
        paddingBottom: '12px',
      }}>

        {/* ── Header: [Photo / Name / Role] | [Contact lines] ── */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '40px',
          marginBottom: '14px',
        }}>

          {/* LEFT — Photo on top, name + role stacked below */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>

            {/* Photo */}
            <div style={{
              border: '1px solid var(--text-dim)',
              padding: '2px',
              background: 'var(--bg-terminal)',
              boxShadow: 'var(--glow-teal)',
            }}>
              <img
                src="/img/Me.jpeg"
                alt="Krish Thakur"
                style={{
                  display: 'block',
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  objectPosition: 'top',
                  filter: 'grayscale(100%) sepia(60%) hue-rotate(120deg) saturate(180%) brightness(0.85)',
                }}
              />
            </div>

            {/* Name + Role below the photo */}
            <div>
              <div style={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '1.1em',
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
              }}>
                Krish Thakur
              </div>
              <div style={{ color: 'var(--text-dim)', whiteSpace: 'nowrap', fontSize: '0.9em' }}>
                Software Engineer
              </div>
            </div>
          </div>

          {/* RIGHT — All 4 contact lines stacked in one column */}
          <div style={{ paddingTop: '4px', lineHeight: 2 }}>
            <div style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--text-dim)' }}>☎  </span>{p.phone}
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--text-dim)' }}>✉  </span>{p.email}
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--text-dim)' }}>⊕  </span>
              GitHub →{' '}
              <a href="https://github.com/krishthakur248" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--text-link)' }}>github.com/krishthakur248</a>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--text-dim)' }}>⊕  </span>
              LinkedIn →{' '}
              <a href="https://linkedin.com/in/krish-thakur-/" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--text-link)' }}>linkedin.com/in/krish-thakur-/</a>
            </div>
          </div>

        </div>{/* end header */}

        {/* Divider under header */}
        <div style={{ borderBottom: '1px solid var(--border-bright)', marginBottom: '2px' }} />


        {/* ── EDUCATION ── */}
        <div style={sec}>EDUCATION</div>
        <div style={{ color: 'var(--text-white)', fontWeight: 600 }}>
          Chitkara University, Himachal Pradesh
        </div>
        <div style={{ color: 'var(--text-dim)' }}>
          B.E. Computer Science Engineering{'  ·  '}2024–2028{'  ·  '}CGPA 9.94/10
        </div>

        {/* ── SKILLS ── */}
        <div style={sec}>SKILLS</div>
        {[
          ['Languages ', 'C, C++, Java, Python, JavaScript (ES6+)'],
          ['Frontend  ', 'React.js, HTML5, CSS3, DOM, Responsive Design'],
          ['Backend   ', 'Node.js, Express.js, REST APIs'],
          ['Databases ', 'MongoDB, Basic SQL'],
          ['Tools     ', 'Git, GitHub, Linux, Postman, Docker, Kubernetes'],
        ].map(([label, val]) => (
          <div key={label}>
            <span style={{ color: 'var(--text-dim)' }}>{label}  </span>
            <span style={{ color: 'var(--text-white)' }}>{val}</span>
          </div>
        ))}

        {/* ── PROJECTS ── */}
        <div style={sec}>PROJECTS</div>

        <div style={{ color: 'var(--text-white)', fontWeight: 600 }}>
          Quick Pull — Ride-Sharing System{'  '}
          <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>[JS, Node, Mongo, Socket.IO]{'  '}·{'  '}Team of 4 · Lead Contributor</span>
        </div>
        <div style={{ color: 'var(--text-white)', paddingLeft: '12px' }}>· MERN platform with JWT auth and live ride tracking.</div>
        <div style={{ color: 'var(--text-white)', paddingLeft: '12px' }}>· Route-aware matching via OSRM, H3, Socket.IO.</div>
        <div style={{ paddingLeft: '12px', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>↗ Live: </span>
          <a href="https://krishthakur248.github.io/QuickPull/" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--text-link)' }}>krishthakur248.github.io/QuickPull/</a>
        </div>

        <div style={{ color: 'var(--text-white)', fontWeight: 600 }}>
          SkillXchange — Mentoring Platform{'  '}
          <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>[Node, Mongo, Jitsi Meet]{'  '}·{'  '}Team of 4 · Lead Contributor</span>
        </div>
        <div style={{ color: 'var(--text-white)', paddingLeft: '12px' }}>· Full-stack skill exchange with auth and skill matching.</div>
        <div style={{ color: 'var(--text-white)', paddingLeft: '12px' }}>· Jitsi Meet API for live mentoring. Deployed on Render.</div>
        <div style={{ paddingLeft: '12px', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>↗ Live: </span>
          <a href="https://krishthakur248.github.io/SkillXChange_Landing_Page/" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--text-link)' }}>krishthakur248.github.io/SkillXChange_Landing_Page/</a>
        </div>

        <div style={{ color: 'var(--text-white)', fontWeight: 600 }}>
          MeshGuard — Android Disaster App{'  '}
          <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>[Kotlin, Jetpack Compose, Nearby API]{'  '}·{'  '}Solo</span>
        </div>
        <div style={{ color: 'var(--text-white)', paddingLeft: '12px' }}>· Offline gossip mesh relaying survivor distress packets.</div>
        <div style={{ color: 'var(--text-white)', paddingLeft: '12px', marginBottom: '8px' }}>· Rescuer dashboard with offline map (osmdroid).</div>

        {/* ── ACHIEVEMENTS ── */}
        <div style={sec}>ACHIEVEMENTS</div>
        <div style={{ color: 'var(--text-white)', paddingLeft: '12px' }}>· 600+ LeetCode problems solved.</div>
        <div style={{ color: 'var(--text-white)', paddingLeft: '12px' }}>· 100/100 in AI Masterclass at Chitkara University.</div>
        <div style={{ color: 'var(--text-white)', paddingLeft: '12px' }}>· HackIndia Hackathon — top 100 teams.</div>

        {/* ── Footer ── */}
        <div style={{ color: 'var(--text-muted)', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
          Run{' '}
          <span style={{ color: 'var(--text-primary)' }}>resume --download</span>
          {' '}to get the PDF.
        </div>

      </div>
    );
  },
});
