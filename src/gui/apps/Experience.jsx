import React from 'react';
import { GraduationCap, Briefcase, Trophy } from 'lucide-react';
import { getExperienceSync as getExperience, getEducationSync as getEducation, getAchievementsSync as getAchievements } from '../../services/dataService.js';
import styles from '../../styles/gui/AppPanel.module.css';
import expStyles from '../../styles/gui/Experience.module.css';

export default function Experience() {
  const experience    = getExperience();
  const education     = getEducation();
  const achievements  = getAchievements();

  return (
    <div className={styles.panel}>
      {/* Work experience */}
      {experience.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Briefcase size={13} aria-hidden="true" style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Experience
          </h3>
          <div className={expStyles.timeline}>
            {experience.map((e) => (
              <div key={e._id} className={expStyles.item}>
                <div className={expStyles.dot} />
                <div className={expStyles.content}>
                  <p className={expStyles.title}>{e.title}</p>
                  <p className={expStyles.sub}>{e.company} · {e.period}</p>
                  {e.detail && <p className={styles.text}>{e.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <GraduationCap size={13} aria-hidden="true" style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Education
          </h3>
          <div className={expStyles.timeline}>
            {education.map((e) => (
              <div key={e._id} className={expStyles.item}>
                <div className={expStyles.dot} />
                <div className={expStyles.content}>
                  <p className={expStyles.title}>{e.institution}</p>
                  <p className={expStyles.sub}>{e.degree}</p>
                  <p className={expStyles.meta}>{e.period}{e.cgpa ? ` · CGPA ${e.cgpa}` : ''}</p>
                  {e.location && <p className={expStyles.meta}>{e.location}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Trophy size={13} aria-hidden="true" style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Achievements
          </h3>
          <div className={expStyles.timeline}>
            {achievements.map((a) => (
              <div key={a._id} className={expStyles.item}>
                <div className={`${expStyles.dot} ${expStyles.dotGold}`} />
                <div className={expStyles.content}>
                  <p className={expStyles.title}>{a.title}</p>
                  <p className={styles.text}>{a.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

