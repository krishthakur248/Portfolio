import React from 'react';
import { getSkillsSync as getSkills } from '../../services/dataService.js';
import styles from '../../styles/gui/AppPanel.module.css';
import skillStyles from '../../styles/gui/Skills.module.css';

export default function Skills() {
  const groups = getSkills();

  return (
    <div className={styles.panel}>
      {groups.length === 0 ? (
        <p className={styles.text}>No skills listed yet.</p>
      ) : (
        groups.map((group) => (
          <div key={group._id} className={skillStyles.group}>
            {/* ── Category Header ── */}
            <div className={skillStyles.header}>
              <h3 className={skillStyles.categoryTitle}>{group.category}</h3>
              <span className={skillStyles.count}>{group.items.length} skills</span>
            </div>

            {/* ── Skill Chips ── */}
            <div className={skillStyles.pills}>
              {group.items.map((item) => (
                <span key={item} className={skillStyles.pill}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
