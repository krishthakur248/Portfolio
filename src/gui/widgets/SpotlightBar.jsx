import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Terminal,
  FolderGit2,
  FileText,
  Sliders,
  User,
  GraduationCap,
  Mail,
  ExternalLink,
  Code2,
  Sparkles,
  Command,
  Award,
  Globe,
  X,
} from 'lucide-react';
import useWindowStore from '../store/useWindowStore.js';
import {
  getProjectsSync,
  getSkillsSync,
  getEducationSync,
  getAchievementsSync,
  getSocialsSync,
} from '../../services/dataService.js';
import { useLeetCodeCount } from '../../services/leetcodeService.js';
import styles from '../../styles/gui/Widgets.module.css';

const CATEGORIES = ['all', 'apps', 'projects', 'skills', 'experience', 'commands'];

const APPS_LIST = [
  { id: 'about',      title: 'About Krish',            category: 'Apps', desc: 'Background, education, and technical profile',   icon: User },
  { id: 'projects',   title: 'Projects',               category: 'Apps', desc: 'Quick Pull, SkillXchange, MeshGuard',            icon: FolderGit2 },
  { id: 'skills',     title: 'Technical Skills',       category: 'Apps', desc: 'Languages, frontend, backend, tools, databases', icon: Sliders },
  { id: 'experience', title: 'Experience & Education', category: 'Apps', desc: 'Chitkara University (CGPA 9.94) & Achievements', icon: GraduationCap },
  { id: 'resume',     title: 'Resume Viewer',          category: 'Apps', desc: 'View and download vector resume PDF',            icon: FileText },
  { id: 'terminal',   title: 'Terminal Emulator',      category: 'Apps', desc: 'Integrated interactive UNIX shell',              icon: Terminal },
  { id: 'contact',    title: 'Contact',                category: 'Apps', desc: 'Direct email, GitHub, LinkedIn connections',     icon: Mail },
  // Widgets
  { id: 'widget-github',   widgetId: 'githubActivity',   title: 'GitHub Activity',   category: 'Widgets', desc: 'GitHub contribution heatmap widget', icon: Globe },
  { id: 'widget-leetcode', widgetId: 'leetcodeActivity', title: 'LeetCode Activity', category: 'Widgets', desc: 'LeetCode submission heatmap widget',  icon: Code2 },
];

const TERMINAL_COMMANDS = [
  { cmd: 'help',     desc: 'List all available shell commands' },
  { cmd: 'about',    desc: 'Display Krish’s background and bio' },
  { cmd: 'skills',   desc: 'Print technical skills matrix' },
  { cmd: 'projects', desc: 'List featured software projects' },
  { cmd: 'contact',  desc: 'Show contact details and email' },
  { cmd: 'whoami',   desc: 'Print current visitor user session' },
  { cmd: 'clear',    desc: 'Clear the terminal screen' },
];

/**
 * Highlights matches inside text safely using regex escaping.
 */
function highlightMatch(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className={styles.highlightMatch}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function SpotlightBar({ switchMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const containerRef = useRef(null);
  const pillRef = useRef(null);
  const inputRef = useRef(null);
  const { openApp } = useWindowStore();

  const leetCodeCount = useLeetCodeCount();
  const projects = useMemo(() => getProjectsSync() || [], []);
  const skillGroups = useMemo(() => getSkillsSync() || [], []);
  const education = useMemo(() => getEducationSync() || [], []);
  const achievements = useMemo(() => getAchievementsSync() || [], [leetCodeCount]);
  const socials = useMemo(() => getSocialsSync() || [], []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
          return next;
        });
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside to close — accounts for the portal dropdown being outside containerRef
  useEffect(() => {
    if (!isOpen) return;
    // Update dropdown position relative to the containerRef (search pill + buttons row)
    if (containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      setDropdownPos({ top: r.bottom + 6, left: r.left });
    }
    function handleClickOutside(e) {
      const inContainer = containerRef.current && containerRef.current.contains(e.target);
      const inDropdown  = e.target.closest?.('[data-spotlight-dropdown]');
      if (!inContainer && !inDropdown) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Comprehensive searchable catalogue
  const allItems = useMemo(() => {
    const WIDGET_ITEMS = [
      { id: 'widget-github',   widgetId: 'githubActivity',   title: 'GitHub Activity',   category: 'Widgets', desc: 'GitHub contribution heatmap widget', keywords: 'heatmap github activity contributions', icon: Globe },
      { id: 'widget-leetcode', widgetId: 'leetcodeActivity', title: 'LeetCode Activity', category: 'Widgets', desc: 'LeetCode submission heatmap widget',  keywords: 'heatmap leetcode activity submissions',  icon: Code2 },
    ];
    const list = [...APPS_LIST, ...WIDGET_ITEMS];

    // Projects
    projects.forEach((p) => {
      list.push({
        id: `proj-${p._id}`,
        appTarget: 'projects',
        projectId: p._id,
        title: p.name,
        category: 'Projects',
        desc: `${p.subtitle} · [${(p.stack || []).join(', ')}]`,
        keywords: `${(p.stack || []).join(' ')} ${(p.highlights || []).join(' ')}`,
        icon: FolderGit2,
      });
    });

    // Skills
    skillGroups.forEach((g) => {
      (g.items || []).forEach((item) => {
        list.push({
          id: `skill-${item}`,
          appTarget: 'skills',
          title: item,
          category: 'Skills',
          desc: `${g.category} skill`,
          keywords: g.category,
          icon: Code2,
        });
      });
    });

    // Experience & Education
    education.forEach((edu) => {
      list.push({
        id: `edu-${edu._id}`,
        appTarget: 'experience',
        title: edu.institution,
        category: 'Experience',
        desc: `${edu.degree} — CGPA: ${edu.cgpa}`,
        keywords: `${edu.degree} ${edu.location}`,
        icon: GraduationCap,
      });
    });

    achievements.forEach((ach) => {
      list.push({
        id: `ach-${ach._id}`,
        appTarget: 'experience',
        title: ach.title,
        category: 'Experience',
        desc: ach.detail,
        keywords: 'awards leetcode hackathon excellence',
        icon: Award,
      });
    });

    // Social & Professional Links
    socials.forEach((s) => {
      list.push({
        id: `social-${s._id}`,
        url: s.url,
        title: s.label,
        category: 'Links',
        desc: `Open external profile: ${s.url}`,
        keywords: s.label.toLowerCase(),
        icon: Globe,
      });
    });

    // Terminal Commands
    TERMINAL_COMMANDS.forEach((tc) => {
      list.push({
        id: `cmd-${tc.cmd}`,
        isCommand: true,
        command: tc.cmd,
        title: tc.cmd,
        category: 'Commands',
        desc: tc.desc,
        keywords: 'terminal shell bash cli',
        icon: Command,
      });
    });

    return list;
  }, [projects, skillGroups, education, achievements, socials]);

  // Suggestions shown when query is empty and category is 'all'
  const suggestions = useMemo(() => {
    return [
      APPS_LIST.find((a) => a.id === 'projects'),
      APPS_LIST.find((a) => a.id === 'resume'),
      APPS_LIST.find((a) => a.id === 'terminal'),
      APPS_LIST.find((a) => a.id === 'contact'),
      {
        id: 'sug-leetcode',
        url: 'https://leetcode.com/krishthakur248',
        title: `LeetCode (${leetCodeCount} Solved)`,
        category: 'Links',
        desc: 'Visit competitive programming profile',
        icon: Code2,
      },
    ].filter(Boolean);
  }, [leetCodeCount]);

  // Filter items based on active query & category
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Specific category selected (Direct click filter)
    if (activeCategory !== 'all') {
      let catItems = allItems.filter(
        (i) => i.category.toLowerCase() === activeCategory.toLowerCase()
      );

      // If user typed a search query, filter within this category
      if (q) {
        catItems = catItems.filter((i) => {
          const matchTitle = i.title.toLowerCase().includes(q);
          const matchDesc = i.desc?.toLowerCase().includes(q);
          const matchKey = i.keywords?.toLowerCase().includes(q);
          const matchCmd = i.command?.toLowerCase().includes(q);
          return matchTitle || matchDesc || matchKey || matchCmd;
        });
      }

      return catItems;
    }

    // "All" selected
    if (!q) {
      return suggestions;
    }

    return allItems
      .filter((i) => {
        const matchTitle = i.title.toLowerCase().includes(q);
        const matchDesc = i.desc?.toLowerCase().includes(q);
        const matchCat = i.category?.toLowerCase().includes(q);
        const matchKey = i.keywords?.toLowerCase().includes(q);
        const matchCmd = i.command?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchCat || matchKey || matchCmd;
      })
      .slice(0, 10);
  }, [allItems, query, activeCategory, suggestions]);

  // Dynamic header text based on active category & query
  const headerText = useMemo(() => {
    const q = query.trim();
    if (q) {
      if (activeCategory === 'all') {
        return `Search Results (${filteredItems.length})`;
      }
      return `${activeCategory.toUpperCase()} Results (${filteredItems.length})`;
    }

    switch (activeCategory) {
      case 'apps':
        return `Applications (${filteredItems.length})`;
      case 'projects':
        return `Featured Projects (${filteredItems.length})`;
      case 'skills':
        return `Technical Skills (${filteredItems.length})`;
      case 'experience':
        return `Experience & Education (${filteredItems.length})`;
      case 'commands':
        return `Shell Commands (${filteredItems.length})`;
      default:
        return 'Suggested Shortcuts';
    }
  }, [query, activeCategory, filteredItems.length]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems, activeCategory]);

  function handleCategoryChange(cat) {
    setActiveCategory((prev) => (prev === cat && cat !== 'all' ? 'all' : cat));
    setSelectedIndex(0);
  }

  function handleSelect(item) {
    if (!item) return;

    if (item.widgetId) {
      // Bring a desktop widget to front
      window.dispatchEvent(
        new CustomEvent('portfolio:bringWidgetToFront', { detail: { widgetId: item.widgetId } })
      );
    } else if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else if (item.isCommand) {
      openApp('terminal');
      window.dispatchEvent(
        new CustomEvent('portfolio:runTerminalCommand', { detail: { command: item.command } })
      );
    } else if (item.projectId) {
      openApp('projects');
      window.dispatchEvent(
        new CustomEvent('portfolio:openProject', { detail: { projectId: item.projectId } })
      );
    } else if (item.appTarget) {
      openApp(item.appTarget);
    } else {
      openApp(item.id);
    }

    setIsOpen(false);
    setQuery('');
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const currentIdx = CATEGORIES.indexOf(activeCategory);
      const nextIdx = e.shiftKey
        ? (currentIdx - 1 + CATEGORIES.length) % CATEGORIES.length
        : (currentIdx + 1) % CATEGORIES.length;
      handleCategoryChange(CATEGORIES[nextIdx]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setQuery('');
    }
  }

  const searchPlaceholder =
    activeCategory !== 'all'
      ? `Search in ${activeCategory}...`
      : 'Spotlight Search';

  return (
    <div className={styles.spotlightArea} ref={containerRef}>
      {/* ── Spotlight Pill Input Bar ── */}
      <div
        className={styles.searchPill}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="spotlight-results-list"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          className={styles.searchPillInput}
          placeholder={searchPlaceholder}
          value={query}
          aria-label="Spotlight search across apps, projects, and skills"
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />

        {query && (
          <button
            type="button"
            className={styles.searchClearBtn}
            aria-label="Clear search query"
            title="Clear search"
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}

        <span className={styles.searchShortcutHint} title="Toggle Spotlight with Cmd+K or Ctrl+K">
          ⌘K
        </span>
      </div>

      {/* ── Quick Action Glass Buttons ── */}
      <div className={styles.quickActions} role="toolbar" aria-label="Quick launch bar">
        <button
          type="button"
          className={styles.circleBtn}
          title="Open Projects"
          aria-label="Open Projects"
          onClick={() => openApp('projects')}
        >
          <FolderGit2 size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={styles.circleBtn}
          title="Open Terminal"
          aria-label="Open Terminal"
          onClick={() => openApp('terminal')}
        >
          <Terminal size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={styles.circleBtn}
          title="Open Technical Skills"
          aria-label="Open Technical Skills"
          onClick={() => openApp('skills')}
        >
          <Sliders size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={styles.circleBtn}
          title="Open Resume"
          aria-label="Open Resume"
          onClick={() => openApp('resume')}
        >
          <FileText size={18} aria-hidden="true" />
        </button>
      </div>

      {/* ── Spotlight Dropdown — rendered in a portal so it escapes all stacking contexts ── */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          id="spotlight-results-list"
          data-spotlight-dropdown="true"
          className={styles.spotlightDropdown}
          role="listbox"
          aria-label="Search results"
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 99999,
          }}
        >
          {/* Direct Category Filter Tabs */}
          <div className={styles.spotlightFilterRow}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ''}`}
                  onMouseDown={(e) => {
                    // Prevent search input from losing focus
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryChange(cat);
                  }}
                  aria-pressed={isActive}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Section Header */}
          <div className={styles.suggestionsHeader}>{headerText}</div>

          {/* Results list */}
          <div className={styles.spotlightResults}>
            {filteredItems.length === 0 ? (
              <div className={styles.emptyState}>
                <span>
                  No results found for "{query}"
                  {activeCategory !== 'all' ? ` in ${activeCategory}` : ''}
                </span>
                {activeCategory !== 'all' && (
                  <button
                    type="button"
                    className={styles.clearFilterBtn}
                    onClick={() => {
                      setActiveCategory('all');
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                  >
                    Reset to All Shortcuts
                  </button>
                )}
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const IconComponent = item.icon || Sparkles;
                const isSelected = index === selectedIndex;
                const trimmedQuery = query.trim();

                return (
                  <div
                    key={item.id}
                    id={`spotlight-item-${index}`}
                    className={`${styles.resultItem} ${isSelected ? styles.resultItemActive : ''}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className={styles.resultIcon}>
                      <IconComponent size={16} aria-hidden="true" />
                    </div>
                    <div className={styles.resultInfo}>
                      <div className={styles.resultTitle}>
                        <span>{highlightMatch(item.title, trimmedQuery)}</span>
                        <span className={styles.resultCategory}>{item.category}</span>
                      </div>
                      <div className={styles.resultDesc}>
                        {highlightMatch(item.desc, trimmedQuery)}
                      </div>
                    </div>
                    {item.url && (
                      <ExternalLink
                        size={13}
                        style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
