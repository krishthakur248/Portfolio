import React from 'react';
import { getSkillsSync as getSkills } from '../../services/dataService.js';
import { getCategoryIcon, getSkillIcon } from './SkillIcons.jsx';
import styles from '../../styles/gui/AppPanel.module.css';
import skillStyles from '../../styles/gui/Skills.module.css';

export default function Skills() {
  const groups = getSkills();

  return (
    <div className={styles.panel}>
      {groups.length === 0 ? (
        <p className={styles.text}>No skills listed yet.</p>
      ) : (
        <div className={skillStyles.container}>
          {groups.map((group) => {
            const CategoryIcon = getCategoryIcon(group.category);

            return (
              <div key={group._id} className={skillStyles.categoryCard}>
                {/* ── Glowing Squircle Category Icon (Left) ── */}
                <CategoryIcon />

                {/* ── Content (Title, Badge, and Pills) ── */}
                <div className={skillStyles.categoryContent}>
                  {/* Top Row: Category Title + Count Badge */}
                  <div className={skillStyles.headerRow}>
                    <h3 className={skillStyles.categoryTitle}>{group.category}</h3>
                    <span className={skillStyles.countBadge}>
                      {group.items.length} SKILLS
                    </span>
                  </div>

                  {/* Bottom Row: Official Brand Skill Pills */}
                  <div className={skillStyles.pillsRow}>
                    {group.items.map((item) => {
                      const IconComponent = getSkillIcon(item);
                      return (
                        <div key={item} className={skillStyles.skillPill} title={item}>
                          <div className={skillStyles.skillIconWrapper}>
                            <IconComponent />
                          </div>
                          <span className={skillStyles.skillLabel}>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
