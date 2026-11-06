import React from 'react';
import {
  GraduationCap,
  Trophy,
  Award,
  Code2,
  MapPin,
  Calendar,
  Briefcase,
} from 'lucide-react';
import {
  getExperienceSync as getExperience,
  getEducationSync as getEducation,
  getAchievementsSync as getAchievements,
} from '../../services/dataService.js';
import { useLeetCodeCount } from '../../services/leetcodeService.js';
import styles from '../../styles/gui/AppPanel.module.css';
import expStyles from '../../styles/gui/Experience.module.css';

function getAchievementIcon(ach, idx) {
  const title = (ach.title || '').toLowerCase();
  if (title.includes('leetcode') || title.includes('problem') || title.includes('code')) {
    return Code2;
  }
  if (title.includes('hackathon') || title.includes('hack') || title.includes('compete')) {
    return Trophy;
  }
  return Award;
}

export default function Experience() {
  const experience   = getExperience();
  const education    = getEducation();
  const achievements = getAchievements();
  const leetCodeCount = useLeetCodeCount();

  return (
    <div className={styles.panel}>
      <div className={expStyles.container}>
        {/* ── 1. Education Section ── */}
        {education.length > 0 && (
          <div className={expStyles.section}>
            <div className={expStyles.sectionHeader}>
              <GraduationCap size={15} aria-hidden="true" />
              <span>Education</span>
            </div>

            {education.map((edu) => (
              <div key={edu._id} className={expStyles.eduCard}>
                <div className={expStyles.eduIconWrap}>
                  <GraduationCap size={22} aria-hidden="true" />
                </div>

                <div className={expStyles.eduContent}>
                  <div className={expStyles.eduTopRow}>
                    <h3 className={expStyles.eduTitle}>{edu.institution}</h3>
                    {edu.period && (
                      <span className={expStyles.metaPill}>
                        <Calendar size={12} aria-hidden="true" />
                        <span>{edu.period}</span>
                      </span>
                    )}
                  </div>

                  <p className={expStyles.eduDegree}>{edu.degree}</p>

                  <div className={expStyles.pillsRow}>
                    {edu.cgpa && (
                      <span className={`${expStyles.metaPill} ${expStyles.gradePill}`}>
                        <Award size={12} aria-hidden="true" />
                        <span>CGPA: {edu.cgpa}</span>
                      </span>
                    )}
                    {edu.location && (
                      <span className={expStyles.metaPill}>
                        <MapPin size={12} aria-hidden="true" />
                        <span>{edu.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 2. Work Experience (if applicable) ── */}
        {experience.length > 0 && (
          <div className={expStyles.section}>
            <div className={expStyles.sectionHeader}>
              <Briefcase size={15} aria-hidden="true" />
              <span>Experience</span>
            </div>

            <div className={expStyles.grid}>
              {experience.map((e) => (
                <div key={e._id} className={expStyles.achieveCard}>
                  <div className={expStyles.achieveTop}>
                    <div className={expStyles.achieveIconWrap}>
                      <Briefcase size={18} aria-hidden="true" />
                    </div>
                    {e.period && (
                      <span className={expStyles.achieveBadge}>{e.period}</span>
                    )}
                  </div>

                  <div className={expStyles.achieveTitleWrap}>
                    <span className={expStyles.achieveTag}>{e.company}</span>
                    <h4 className={expStyles.achieveTitle}>{e.title}</h4>
                  </div>

                  {e.detail && (
                    <p className={expStyles.achieveDetail}>{e.detail}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. Achievements Section ── */}
        {achievements.length > 0 && (
          <div className={expStyles.section}>
            <div className={`${expStyles.sectionHeader} ${expStyles.sectionHeaderGold}`}>
              <Trophy size={15} aria-hidden="true" />
              <span>Key Achievements</span>
            </div>

            <div className={expStyles.grid}>
              {achievements.map((a, idx) => {
                const IconComponent = getAchievementIcon(a, idx);
                const isLeetCode = (a.title || '').toLowerCase().includes('leetcode');
                const badge = isLeetCode ? `${leetCodeCount} Solved` : a.badge;
                const detail = isLeetCode
                  ? `Solved ${leetCodeCount} problems on LeetCode with consistent practice in Arrays, Trees, Graphs, and Dynamic Programming.`
                  : a.detail;

                return (
                  <div key={a._id} className={expStyles.achieveCard}>
                    <div className={expStyles.achieveTop}>
                      <div className={expStyles.achieveIconWrap}>
                        <IconComponent size={18} aria-hidden="true" />
                      </div>
                      {badge && (
                        <span className={expStyles.achieveBadge}>{badge}</span>
                      )}
                    </div>

                    <div className={expStyles.achieveTitleWrap}>
                      {a.tag && (
                        <span className={expStyles.achieveTag}>{a.tag}</span>
                      )}
                      <h4 className={expStyles.achieveTitle}>{a.title}</h4>
                    </div>

                    <p className={expStyles.achieveDetail}>{detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
