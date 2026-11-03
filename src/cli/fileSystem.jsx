/**
 * fileSystem.js — fake in-memory filesystem for ls/cd/cat/pwd.
 *
 * Structure mirrors a real Linux home directory.
 * "content" is what `cat` displays for a file.
 * Directories have "children" (array of node names).
 */

export const FS = {
  '/': {
    type: 'dir',
    children: ['home'],
  },
  '/home': {
    type: 'dir',
    children: ['krish'],
  },
  '/home/krish': {
    type: 'dir',
    children: ['about.txt', 'skills.txt', 'contact.txt', 'projects', 'resume.txt'],
  },
  '/home/krish/about.txt': {
    type: 'file',
    content: `Name    : Krish Thakur
Role    : Software Engineer
Email   : krishthakur248@gmail.com
Phone   : +91 7018067797
Location: Himachal Pradesh, India

I'm a full-stack CS Engineering student at Chitkara University.
Strong with MERN, DSA (C++/Java), and building real projects.
CGPA: 9.94/10

Type 'about' for the full interactive version.`,
  },
  '/home/krish/skills.txt': {
    type: 'file',
    content: `Languages  : C, C++, Java, Python, JavaScript (ES6+)
Frontend   : React.js, HTML5, CSS3, DOM, Responsive Design
Backend    : Node.js, Express.js, REST APIs
Databases  : MongoDB, Basic SQL
CS Core    : DSA, OOP, OS, Computer Networks, DBMS
Tools      : Git, GitHub, Linux, Postman, Docker, Kubernetes

Type 'skills' for the full interactive view.`,
  },
  '/home/krish/contact.txt': {
    type: 'file',
    content: `Email   : krishthakur248@gmail.com
Phone   : +91 7018067797
GitHub  : https://github.com/krishthakur248
LinkedIn: https://linkedin.com/in/krish-thakur-/

Type 'contact' to see clickable links.`,
  },
  '/home/krish/resume.txt': {
    type: 'file',
    content: `KRISH THAKUR — SOFTWARE ENGINEER
Resume available as PDF.

Run 'resume' to view it here.
Run 'resume --download' to download the PDF.`,
  },
  '/home/krish/projects': {
    type: 'dir',
    children: ['quick-pull.txt', 'skillxchange.txt', 'meshguard.txt'],
  },
  '/home/krish/projects/quick-pull.txt': {
    type: 'file',
    content: `Quick Pull — Real-Time Peer-to-Peer Ride-Sharing System
Team : 4 members | Role: Lead Contributor
Stack: JavaScript, Node.js, Express.js, MongoDB, Socket.IO, OSRM, H3, Turf.js

- MERN ride-sharing platform with JWT auth and live tracking.
- Route-aware matching via OSRM, H3, and Socket.IO.

Run 'project quick-pull' for the full view.`,
  },
  '/home/krish/projects/skillxchange.txt': {
    type: 'file',
    content: `SkillXchange — Mutual Mentoring Learning Platform
Team : 4 members | Role: Lead Contributor
Stack: Node.js, Express.js, MongoDB, JavaScript, Jitsi Meet API

- Full-stack skill exchange with auth and skill matching.
- Jitsi Meet integration for live mentoring sessions.

Run 'project skillxchange' for the full view.`,
  },
  '/home/krish/projects/meshguard.txt': {
    type: 'file',
    content: `MeshGuard — Offline Disaster Rescue & Survivor Tracking App
Team : Solo
Stack: Kotlin, Jetpack Compose, Google Nearby Connections API, Room, osmdroid

- Offline-first Android app relaying distress packets via gossip mesh.
- Survivor/Rescuer roles, background broadcast, offline map dashboard.

Run 'project meshguard' for the full view.`,
  },
};

// Starting directory for the session.
export const HOME_DIR = '/home/krish';

/**
 * Resolves a path relative to cwd. Handles "..", ".", and absolute paths.
 * Returns the resolved absolute path string, or null if invalid.
 */
export function resolvePath(cwd, target) {
  if (!target || target === '~') return HOME_DIR;
  if (target === '/') return '/';

  // Replace leading ~ with home dir
  const expanded = target.startsWith('~/')
    ? HOME_DIR + target.slice(1)
    : target;

  // Build segments
  const base = expanded.startsWith('/') ? [] : cwd.split('/').filter(Boolean);
  const parts = expanded.startsWith('/') ? expanded.split('/').filter(Boolean) : expanded.split('/').filter(Boolean);

  for (const part of parts) {
    if (part === '..') {
      base.pop();
    } else if (part !== '.') {
      base.push(part);
    }
  }

  return '/' + base.join('/');
}

/**
 * List children of a directory path. Returns array of { name, type } or null.
 */
export function listDir(path) {
  const node = FS[path];
  if (!node || node.type !== 'dir') return null;
  return node.children.map((child) => {
    const childPath = path === '/' ? '/' + child : path + '/' + child;
    const childNode = FS[childPath];
    return { name: child, type: childNode ? childNode.type : 'unknown' };
  });
}

/**
 * Read a file. Returns content string or null.
 */
export function readFile(path) {
  const node = FS[path];
  if (!node || node.type !== 'file') return null;
  return node.content;
}

/**
 * Check if a path exists and what type it is. Returns 'file', 'dir', or null.
 */
export function statPath(path) {
  const node = FS[path];
  if (!node) return null;
  return node.type;
}

/**
 * Get all file names (not dirs) under a given directory (non-recursive).
 * Used for tab-autocomplete on cd/cat.
 */
export function getChildNames(cwd) {
  const node = FS[cwd];
  if (!node || node.type !== 'dir') return [];
  return node.children;
}
