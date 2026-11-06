/**
 * dataService.js — the ONLY place that touches portfolio data.
 *
 * All GUI components and CLI commands import from here, never from demoData.json directly.
 * To update content, edit src/data/demoData.json only.
 *
 * Functions return Promises so CLI commands (which use await) keep working unchanged.
 * GUI components can also await them; the data is local so resolution is immediate.
 */

import data from '../data/demoData.json';
import { getCachedLeetCodeCount } from './leetcodeService.js';

const resolved = (v) => Promise.resolve(v);

export const getProfile      = () => resolved(data.profile);
export const getSkills       = () => resolved(data.skills       ?? []);
export const getProjects     = () => resolved(data.projects     ?? []);
export const getExperience   = () => resolved(data.experience   ?? []);
export const getEducation    = () => resolved(data.education    ?? []);
export const getAchievements = () => resolved(getAchievementsSync());
export const getContact      = () => resolved(data.contact);
export const getSocials      = () => resolved(data.socials      ?? []);
export const getGuiConfig    = () => resolved(data.gui          ?? {});
export const getWidgetsData  = () => resolved(getWidgetsDataSync());

export function getProject(id) {
  const project = data.projects?.find((p) => p._id === id || p.slug === id);
  if (!project) return Promise.reject(new Error(`Project not found: ${id}`));
  return resolved(project);
}

/* ── Synchronous helpers used by GUI components ──────────────────
   GUI reads local data at render time — no async needed.
   CLI commands keep using the async versions above.
   ──────────────────────────────────────────────────────────────── */
export const getProfileSync      = () => data.profile;
export const getSkillsSync       = () => data.skills       ?? [];
export const getProjectsSync     = () => data.projects     ?? [];
export const getExperienceSync   = () => data.experience   ?? [];
export const getEducationSync    = () => data.education    ?? [];
export const getAchievementsSync = () => {
  const list = data.achievements ?? [];
  const count = getCachedLeetCodeCount();
  return list.map((a) => {
    if (a._id === 'ach_001' || (a.title || '').toLowerCase().includes('leetcode')) {
      return {
        ...a,
        stat: count,
        badge: `${count} Solved`,
        detail: `Solved ${count} problems on LeetCode with consistent practice in Arrays, Trees, Graphs, and Dynamic Programming.`,
      };
    }
    return a;
  });
};
export const getContactSync      = () => data.contact;
export const getSocialsSync      = () => data.socials      ?? [];
export const getGuiConfigSync    = () => data.gui          ?? {};
export const getWidgetsDataSync  = () => {
  const widgets = data.widgets ?? {};
  const count = getCachedLeetCodeCount();
  if (widgets.dsaFocus) {
    return {
      ...widgets,
      dsaFocus: {
        ...widgets.dsaFocus,
        stat: count,
      },
    };
  }
  return widgets;
};
