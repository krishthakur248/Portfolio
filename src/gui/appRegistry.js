/**
 * appRegistry.js — central map of every app the desktop knows about.
 *
 * To add a new app:
 *   1. Create src/gui/apps/YourApp.jsx
 *   2. Add one entry here — id, title, iconSrc, component, defaultSize,
 *      dockSlot, desktopSlot.
 *   3. Done. The app lazy-loads automatically.
 *
 * iconSrc: path relative to /public (served as static assets by Vite).
 */

import { lazy } from 'react';

const About       = lazy(() => import('./apps/About.jsx'));
const Projects    = lazy(() => import('./apps/Projects.jsx'));
const Skills      = lazy(() => import('./apps/Skills.jsx'));
const Experience  = lazy(() => import('./apps/Experience.jsx'));
const Resume      = lazy(() => import('./apps/Resume.jsx'));
const Contact     = lazy(() => import('./apps/Contact.jsx'));
const TerminalApp = lazy(() => import('./apps/TerminalApp.jsx'));
const Welcome     = lazy(() => import('./apps/Welcome.jsx'));

const registry = {
  about: {
    id: 'about',
    title: 'About',
    iconSrc: '/img/icons/profile.png',
    component: About,
    defaultSize: { width: 920, height: 560 },
    dockSlot: true,
    desktopSlot: false,
  },
  projects: {
    id: 'projects',
    title: 'Projects',
    iconSrc: '/img/icons/files.png',
    component: Projects,
    defaultSize: { width: 1040, height: 620 },
    dockSlot: true,
    desktopSlot: false,
  },
  skills: {
    id: 'skills',
    title: 'Skills',
    iconSrc: '/img/icons/settings.png',
    component: Skills,
    defaultSize: { width: 920, height: 560 },
    dockSlot: true,
    desktopSlot: false,
  },
  experience: {
    id: 'experience',
    title: 'Experience & Education',
    iconSrc: '/img/icons/education.png',
    component: Experience,
    defaultSize: { width: 960, height: 600 },
    dockSlot: false,
    desktopSlot: true,
    desktopPos: { x: 36, y: 60 },
  },
  resume: {
    id: 'resume',
    title: 'Resume',
    iconSrc: '/img/icons/resume.png',
    component: Resume,
    defaultSize: { width: 980, height: 680 },
    dockSlot: false,
    desktopSlot: true,
    desktopPos: { x: 36, y: 200 },
  },
  contact: {
    id: 'contact',
    title: 'Contact',
    iconSrc: '/img/icons/contact.png',
    component: Contact,
    defaultSize: { width: 920, height: 520 },
    dockSlot: false,
    desktopSlot: true,
    desktopPos: { x: 36, y: 340 },
  },
  terminal: {
    id: 'terminal',
    title: 'Terminal',
    iconSrc: '/img/icons/terminal.png',
    component: TerminalApp,
    defaultSize: { width: 960, height: 560 },
    dockSlot: true,
    desktopSlot: false,
  },
  welcome: {
    id: 'welcome',
    title: 'Welcome',
    iconSrc: '/img/icons/wellcome.png',
    component: Welcome,
    defaultSize: { width: 600, height: 510 },
    dockSlot: false,
    desktopSlot: true,
    desktopPos: { x: 0, y: 60 },
  },
};

export default registry;

export function getApp(id)       { return registry[id] ?? null; }
export function getDockApps()    { return Object.values(registry).filter((a) => a.dockSlot); }
export function getDesktopApps() { return Object.values(registry).filter((a) => a.desktopSlot); }
