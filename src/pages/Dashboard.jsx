import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getHomeDashboard } from '../api/home';
import { getDailyQuests, claimQuestReward } from '../api/gamification';
import { Link } from 'react-router-dom';
import { SkeletonList } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { CountUp, Confetti } from '../components/ui';
import {
  Target, BookOpen, Trophy, Map,
  ChevronRight, Star, TrendingUp, Zap, Gift, ClipboardCheck
} from 'lucide-react';

const QUEST_ICONS = {
  LearnWords: '📖', LearnKanji: '🈷️', LearnGrammar: '📝', CompleteReviews: '🔁',
  WriteKanji: '✍️', CompleteLessons: '📚', EarnXp: '⚡', StudyMinutes: '⏱️',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [quests, setQuests] = useState([]);
  const [reviewsDue, setReviewsDue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [celebrateId, setCelebrateId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      // §3.1 — bitta dashboard so'rovi (levelProgress real totallar bilan + reviewsDueToday)
      getHomeDashboard(),
      getDailyQuests(),
    ]).then(([dash, dailyQuestsRes]) => {
      const rawQuests = dailyQuestsRes?.quests || [];
      const mappedQuests = rawQuests.map(q => ({
        id: q.questId,
        title: q.descriptionUz || q.description,
        description: '',
        coinReward: q.coinReward,
        current: q.currentProgress,
        target: q.targetValue,
        isCompleted: q.isCompleted,
        isClaimed: q.isClaimed,
        icon: QUEST_ICONS[q.type] || '🎯',
      }));

      const goalPercent = mappedQuests.length
        ? Math.round(mappedQuests.reduce((s, q) => s + Math.min(1, q.current / Math.max(1, q.target)), 0) / mappedQuests.length * 100)
        : dash.dailyGoal?.overallPercent || 0;

      setStats({
        levelProgress: dash.levelProgress,
        dailyGoal: {
          overallPercent: goalPercent,
          tasks: mappedQuests.slice(0, 3).map(q => ({
            type: q.id, label: q.title, done: q.current, target: q.target, icon: q.icon,
          })),
        },
      });
      setQuests(mappedQuests);
      setReviewsDue(dash.reviewsDueToday || 0);
    })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleClaimQuest = async (questId) => {
    try {
      await claimQuestReward(questId);
      setQuests(qs => qs.map(q => q.id === questId ? { ...q, isClaimed: true } : q));
      setCelebrateId(questId);
      setTimeout(() => setCelebrateId(null), 1100);
    } catch { /* ignore */ }
  };

  if (loading) {
    return <SkeletonList count={4} />;
  }
  if (error) return <ErrorState message={error} onRetry={load} />;

  const d = stats;

  return (
    <div style={styles.page} className="stagger">
      {/* Welcome */}
      <div style={styles.welcome} className="anim-scale-in">
        <div style={styles.welcomeDecor1} />
        <div style={styles.welcomeDecor2} />
        <div style={styles.welcomeLeft}>
          <div style={styles.welcomeAvatar}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" style={styles.welcomeAvatarImg} />
              : <span style={styles.welcomeAvatarLetter}>{user?.fullName?.charAt(0) || 'A'}</span>}
          </div>
          <div>
            <h1 style={styles.greeting}>
              {t('dashboard.greeting')}, {user?.fullName?.split(' ')[0] || t('dashboard.learner')}!
            </h1>
            <p style={styles.welcomeSub}>{t('dashboard.subtitle')}</p>
          </div>
        </div>
        <div style={styles.welcomeRight}>
          <div style={styles.streakBadge} className="anim-pop">
            <img src="/mascot/fire.png" alt="Streak" style={styles.streakIcon} />
            <div>
              <div style={styles.streakNum}><CountUp value={user?.currentStreak || user?.streakDays || 0} /> {t('dashboard.days')}</div>
              <div style={styles.streakLabel}>{t('dashboard.streak')}</div>
            </div>
          </div>
          <img src="/mascot/greeting.png" alt="" style={styles.welcomeMascot} />
        </div>
      </div>

      {/* Daily Goal */}
      <div style={styles.card} className="card-interactive">
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}><Target size={20} /> {t('dashboard.dailyGoal')}</h2>
          <span style={styles.percent} className="gradient-text">{d.dailyGoal?.overallPercent || 0}%</span>
        </div>
        <div style={styles.progressBarBg}>
          <div className="progress-shine" style={{ ...styles.progressBar, width: `${d.dailyGoal?.overallPercent || 0}%` }} />
        </div>
        <div style={styles.goalGrid} className="stagger-grid">
          {(d.dailyGoal?.tasks || []).map(task => (
            <div key={task.type} style={styles.goalItem} className="hover-scale">
              <span style={styles.goalIcon}>{task.icon}</span>
              <div style={styles.goalInfo}>
                <div style={styles.goalLabel}>{task.label}</div>
                <div style={styles.goalProgress}>{task.done}/{task.target}</div>
              </div>
              <div style={styles.goalBarBg}>
                <div className="progress-shine" style={{ ...styles.goalBar, width: `${(task.done / task.target) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.grid2}>
        {/* Level Progress */}
        <div style={styles.card} className="card-interactive">
          <h2 style={styles.cardTitle}><TrendingUp size={20} /> <span className="gradient-text">{user?.currentLevel || 'N5'} {t('dashboard.level')}</span></h2>
          <div style={styles.levelItems}>
            {d.levelProgress && Object.entries(d.levelProgress).map(([key, val]) => (
              <div key={key} style={styles.levelItem}>
                <div style={styles.levelItemTop}>
                  <span style={styles.levelLabel}>
                    {key === 'vocab' ? t('dashboard.words') : key === 'kanji' ? t('dashboard.kanji') : t('dashboard.grammar')}
                  </span>
                  <span style={styles.levelNum}>{val.learned}/{val.total}</span>
                </div>
                <div style={styles.levelBarBg}>
                  <div className="progress-shine" style={{
                    ...styles.levelBar,
                    width: `${val.percent}%`,
                    background: key === 'vocab' ? 'var(--purple)' : key === 'kanji' ? 'var(--secondary)' : 'var(--success)',
                  }} />
                </div>
                <span style={styles.levelPercent}>{val.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.card} className="card-interactive">
          <h2 style={styles.cardTitle}><Zap size={20} className="anim-pulse" /> {t('dashboard.quickActions')}</h2>
          <div style={styles.quickActions} className="stagger">
            <Link to="/lessons" className="tappable ripple" style={{ ...styles.quickAction, background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', boxShadow: '0 4px 0 var(--primary-dark)' }}>
              <span style={styles.qaIconBubble}><BookOpen size={20} color="white" /></span>
              <span style={styles.qaLabel}>{t('dashboard.startLesson')}</span>
            </Link>
            <Link to="/review" className="tappable ripple" style={{ ...styles.quickAction, background: 'linear-gradient(135deg, var(--pink-dark), var(--pink))', boxShadow: '0 4px 0 #9D1C55' }}>
              <span style={styles.qaIconBubble}><Star size={20} color="white" /></span>
              <span style={styles.qaLabel}>{t('dashboard.srsReview')}</span>
              {reviewsDue > 0 && <span style={styles.qaBadge} className="badge-bounce">{reviewsDue}</span>}
            </Link>
            <Link to="/roadmap" className="tappable ripple" style={{ ...styles.quickAction, background: 'linear-gradient(135deg, var(--purple-dark), var(--purple))', boxShadow: '0 4px 0 #5B21B6' }}>
              <span style={styles.qaIconBubble}><Map size={20} color="white" /></span>
              <span style={styles.qaLabel}>{t('dashboard.roadmap')}</span>
            </Link>
            <Link to="/leaderboard" className="tappable ripple" style={{ ...styles.quickAction, background: 'linear-gradient(135deg, var(--accent), #FFCA3A)', boxShadow: '0 4px 0 var(--accent-dark)' }}>
              <span style={styles.qaIconBubble}><Trophy size={20} color="white" /></span>
              <span style={styles.qaLabel}>{t('dashboard.leaderboard')}</span>
            </Link>
            <Link to="/mock-test" className="tappable ripple" style={{ ...styles.quickAction, background: 'linear-gradient(135deg, var(--secondary), var(--secondary-light))', boxShadow: '0 4px 0 var(--secondary-dark)' }}>
              <span style={styles.qaIconBubble}><ClipboardCheck size={20} color="white" /></span>
              <span style={styles.qaLabel}>{t('dashboard.mockTest')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Quests */}
      <div style={styles.card} className="card-interactive">
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}><Gift size={20} /> {t('dashboard.dailyQuests')}</h2>
          <Link to="/daily-quests" style={styles.seeAll} className="tappable">{t('dashboard.all')} <ChevronRight size={16} /></Link>
        </div>
        <div style={styles.questList} className="stagger">
          {quests.map(q => (
            <div key={q.id} style={{ ...styles.questItem, ...(q.isCompleted ? styles.questCompleted : {}) }} className="hover-scale">
              <div style={styles.questLeft}>
                <div style={{ ...styles.questCheck, ...(q.isCompleted ? styles.questCheckDone : {}) }} className={q.isCompleted ? 'anim-pop' : ''}>
                  {q.isCompleted ? '✓' : ''}
                </div>
                <div>
                  <div style={styles.questTitle}>{q.icon} {q.title}</div>
                </div>
              </div>
              <div style={{ ...styles.questRight, position: 'relative' }}>
                <div style={styles.questReward}>+{q.coinReward} {t('dashboard.coin')}</div>
                <div style={styles.questProgress}>{q.current}/{q.target}</div>
                {q.isCompleted && !q.isClaimed && (
                  <button style={styles.claimBtn} className="press anim-glow-pulse" onClick={() => handleClaimQuest(q.id)}>{t('dashboard.claim')}</button>
                )}
                {q.isClaimed && <span className="anim-pop" style={{ fontSize: 11, color: 'var(--success)', fontWeight: 800 }}>✓ {t('dashboard.claimed')}</span>}
                {celebrateId === q.id && <Confetti key={q.id} count={16} spread={70} />}
              </div>
            </div>
          ))}
          {quests.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-light)', fontSize: 14 }}>
              {t('dashboard.noQuests')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  welcome: {
    position: 'relative', overflow: 'hidden',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', background: 'linear-gradient(135deg, var(--primary-dark), var(--primary) 60%, var(--primary-light))',
    borderRadius: 20, color: 'white', boxShadow: '0 5px 0 #37810A',
  },
  welcomeDecor1: {
    position: 'absolute', top: -46, right: 90, width: 150, height: 150,
    borderRadius: '50%', background: 'rgba(255,255,255,0.10)', pointerEvents: 'none',
  },
  welcomeDecor2: {
    position: 'absolute', bottom: -60, left: '38%', width: 120, height: 120,
    borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
  },
  welcomeLeft: { display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 },
  welcomeRight: { display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 },
  welcomeMascot: { width: 74, height: 74, objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.18))' },
  welcomeAvatar: {
    width: 52, height: 52, borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.3)',
  },
  welcomeAvatarImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' },
  welcomeAvatarLetter: { fontSize: 22, fontWeight: 700, color: 'white' },
  greeting: { fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 },
  welcomeSub: { fontSize: 14, opacity: 0.8 },
  streakBadge: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,0.18)', borderRadius: 14, padding: '10px 16px',
    backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.25)',
  },
  streakIcon: { width: 28, height: 28, objectFit: 'contain' },
  streakNum: { fontSize: 18, fontWeight: 700 },
  streakLabel: { fontSize: 11, opacity: 0.7 },
  card: {
    background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 20,
    border: '2px solid var(--border)',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16, fontWeight: 600, color: 'var(--text)',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  percent: { fontSize: 20, fontWeight: 700, color: 'var(--primary)' },
  progressBarBg: { height: 8, background: 'var(--border-light)', borderRadius: 4, marginBottom: 16, overflow: 'hidden' },
  progressBar: { height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 4, transition: 'width 0.5s ease' },
  goalGrid: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  goalItem: { flex: '1 1 180px', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg)', borderRadius: 10 },
  goalIcon: { fontSize: 24 },
  goalInfo: { flex: 1 },
  goalLabel: { fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' },
  goalProgress: { fontSize: 14, fontWeight: 700, color: 'var(--text)' },
  goalBarBg: { width: 50, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  goalBar: { height: '100%', background: 'var(--success)', borderRadius: 2 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 },
  levelItems: { display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 },
  levelItem: {},
  levelItemTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
  levelLabel: { fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' },
  levelNum: { fontSize: 12, color: 'var(--text-light)' },
  levelBarBg: { height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' },
  levelBar: { height: '100%', borderRadius: 3, transition: 'width 0.5s' },
  levelPercent: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' },
  quickActions: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 },
  quickAction: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
    borderRadius: 14, color: 'white', textDecoration: 'none', position: 'relative', transition: 'transform 0.2s',
  },
  qaIconBubble: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.22)', flexShrink: 0,
  },
  qaLabel: { fontSize: 14, fontWeight: 800, letterSpacing: 0.2 },
  qaBadge: { marginLeft: 'auto', background: 'rgba(255,255,255,0.3)', borderRadius: 20, padding: '2px 10px', fontSize: 13, fontWeight: 700 },
  seeAll: { fontSize: 13, color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 2 },
  questList: { display: 'flex', flexDirection: 'column', gap: 8 },
  questItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 14px', borderRadius: 10, background: 'var(--bg)', transition: 'background 0.2s',
  },
  questCompleted: { opacity: 0.6 },
  questLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  questCheck: {
    width: 24, height: 24, borderRadius: 'var(--radius-full)', border: '2px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
  },
  questCheckDone: { background: 'var(--success)', borderColor: 'var(--success)', color: 'white' },
  questTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  questDesc: { fontSize: 12, color: 'var(--text-light)' },
  questRight: { textAlign: 'right' },
  questReward: { fontSize: 13, fontWeight: 600, color: 'var(--accent)' },
  questProgress: { fontSize: 12, color: 'var(--text-light)' },
  claimBtn: {
    marginTop: 4, padding: '6px 14px', borderRadius: 10, background: 'var(--accent)',
    color: '#4B3200', fontSize: 12, fontWeight: 900, border: 'none',
    boxShadow: '0 3px 0 var(--accent-dark)', textTransform: 'uppercase', letterSpacing: 0.4,
  },
};
