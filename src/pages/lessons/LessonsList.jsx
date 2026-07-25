import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getRoadmap } from '../../api/lessons';
import { useLanguage } from '../../context/LanguageContext';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { BookOpen, Lock, Star, Clock, ChevronRight, Play, Loader } from 'lucide-react';

const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
const STATUS_COLORS = {
  Completed: { bg: 'var(--success-soft)', text: 'var(--success-dark)', key: 'statusCompleted' },
  InProgress: { bg: 'var(--warning-soft)', text: 'var(--warning-dark)', key: 'statusInProgress' },
  Available: { bg: 'var(--secondary-soft)', text: 'var(--secondary-dark)', key: 'statusAvailable' },
  Locked: { bg: 'var(--bg-alt)', text: 'var(--text-light)', key: 'statusLocked' },
};

// §10.4 — RoadmapDto.nodes[].status: "done" | "current" | "todo" | "locked"
const STATUS_MAP = { done: 'Completed', current: 'InProgress', todo: 'Available', locked: 'Locked' };

export default function LessonsList() {
  const { t } = useLanguage();
  const [activeLevel, setActiveLevel] = useState('N5');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getRoadmap(activeLevel)
      .then(data => {
        const nodes = data?.nodes || [];
        setLessons(nodes.map(n => ({
          id: n.lessonId,
          title: n.titleUz || n.title,
          order: n.order,
          iconChar: n.iconChar,
          level: activeLevel,
          category: '',
          progress: {
            status: STATUS_MAP[n.status] || 'Available',
            score: n.accuracy || 0,
            stars: n.stars || 0,
          },
        })));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeLevel]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.header} className="anim-fade-up">
        <h1 style={styles.title}>{t('lessons.title')}</h1>
        <p style={styles.sub}>{t('lessons.subtitle')}</p>
      </div>

      <div style={styles.filters}>
        {levels.map(lv => (
          <button key={lv} onClick={() => setActiveLevel(lv)}
            className="press"
            style={{ ...styles.filterBtn, ...(activeLevel === lv ? styles.filterActive : {}) }}>
            {lv}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader size={24} className="anim-spin" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : lessons.length === 0 ? (
        <EmptyState title={t('lessons.empty')} subtitle={`${activeLevel} ${t('lessons.emptySub')}`} />
      ) : (
        <div style={styles.list} className="stagger">
          {lessons.map(lesson => {
            const status = STATUS_COLORS[lesson.progress.status] || STATUS_COLORS.Available;
            const isLocked = lesson.progress.status === 'Locked';

            return (
              <Link key={lesson.id} to={isLocked ? '#' : `/lessons/${lesson.id}`}
                className={isLocked ? '' : 'card-interactive'}
                style={{ ...styles.lessonCard, ...(isLocked ? styles.locked : {}) }}>
                <div style={styles.lessonLeft}>
                  <div className="lesson-icon" style={{
                    ...styles.lessonIcon,
                    background: lesson.category === 'Kanji' ? 'var(--secondary)' :
                      lesson.category === 'Grammar' ? 'var(--success)' : 'var(--primary)',
                    boxShadow: isLocked ? 'none' : '0 3px 0 rgba(0,0,0,0.18)',
                    opacity: isLocked ? 0.4 : 1,
                  }}>
                    {isLocked ? <Lock size={20} color="white" /> :
                      lesson.category === 'Kanji' ? <span style={styles.kanjiIcon}>漢</span> :
                      lesson.category === 'Grammar' ? <span style={styles.kanjiIcon}>文</span> :
                      <BookOpen size={20} color="white" />}
                  </div>
                  <div>
                    <div style={styles.lessonTitle}>{lesson.title}</div>
                    <div style={styles.lessonDesc}>{lesson.iconChar ? `${lesson.iconChar} ` : ''}{lesson.order}-{t('lessons.lessonWord')}</div>
                    <div style={styles.lessonMeta}>
                      {lesson.wordCount > 0 && <span><BookOpen size={12} /> {lesson.wordCount} {t('lessons.words')}</span>}
                      {lesson.estimatedMinutes > 0 && <span><Clock size={12} /> {lesson.estimatedMinutes} {t('lessons.minutes')}</span>}
                      <span style={{ ...styles.statusBadge, background: status.bg, color: status.text }}>
                        {t(`lessons.${status.key}`)}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={styles.lessonRight}>
                  {lesson.progress.status === 'Completed' && (
                    <div style={styles.stars}>
                      {[1, 2, 3].map(s => (
                        <Star key={s} size={16}
                          className={s <= lesson.progress.stars ? 'lesson-star' : ''}
                          fill={s <= lesson.progress.stars ? '#F5B50A' : 'none'}
                          color={s <= lesson.progress.stars ? '#F5B50A' : 'var(--border-dark)'} />
                      ))}
                    </div>
                  )}
                  {lesson.progress.status === 'InProgress' && (
                    <div style={styles.scoreCircle}><span>{lesson.progress.score}%</span></div>
                  )}
                  {lesson.progress.status === 'Available' && (
                    <div style={styles.playBtn} className="lesson-play"><Play size={18} fill="white" color="white" /></div>
                  )}
                  {!isLocked && <ChevronRight size={20} color="var(--text-light)" />}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  header: { marginBottom: 4 },
  title: { fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 4 },
  sub: { fontSize: 14, color: 'var(--text-light)' },
  filters: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  filterBtn: {
    padding: '9px 20px', borderRadius: 14, background: 'var(--bg-alt)',
    borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--border)', fontSize: 14, fontWeight: 800,
    color: 'var(--text-light)', transition: 'all 0.2s',
  },
  filterActive: { background: 'var(--primary-soft)', color: 'var(--primary-dark)', borderColor: 'var(--primary)' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  lessonCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--border)',
    textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
  },
  locked: { opacity: 0.5, cursor: 'default' },
  lessonLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  lessonIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  kanjiIcon: { color: 'white', fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-jp)' },
  lessonTitle: { fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 2 },
  lessonDesc: { fontSize: 13, color: 'var(--text-light)', marginBottom: 6 },
  lessonMeta: { display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-light)', alignItems: 'center' },
  statusBadge: { padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 },
  lessonRight: { display: 'flex', alignItems: 'center', gap: 10 },
  stars: { display: 'flex', gap: 2 },
  scoreCircle: {
    width: 42, height: 42, borderRadius: '50%', border: '3px solid var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent)',
  },
  playBtn: { width: 36, height: 36, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
