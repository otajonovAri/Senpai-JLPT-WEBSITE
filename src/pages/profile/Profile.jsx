import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfileStats, getHeatmap } from '../../api/profile';
import { getAchievements } from '../../api/gamification';
import ErrorState from '../../components/ErrorState';
import {
  GraduationCap, Flame, Coins, BarChart3,
  Target, Award, Loader, Pencil, Users, Bookmark,
  Gift, ChevronRight, Bell
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [achievementList, setAchievementList] = useState([]);
  const [heatmapDays, setHeatmapDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getProfileStats(),
      getAchievements().catch(() => null),
      getHeatmap(90).catch(() => null),
    ]).then(([profileStats, achievementsRes, heatmap]) => {
      // §5.5 — UserStatsDto (stats)
      setStats({
        totalWordsLearned: profileStats.vocabLearned || 0,
        totalKanjiLearned: profileStats.kanjiLearned || 0,
        totalGrammarLearned: profileStats.grammarLearned || 0,
        totalReviews: profileStats.totalReviews || 0,
        lessonsCompleted: profileStats.lessonsCompleted || 0,
        minutesStudied: profileStats.minutesStudied || 0,
        totalXp: profileStats.totalXp || 0,
        coins: profileStats.coins || 0,
        streakDays: profileStats.streakDays || 0,
      });
      // §15.1 — { achievements: [...] }
      const achList = achievementsRes?.achievements || [];
      setAchievementList(achList.map(a => ({
        id: a.id,
        name: a.nameUz || a.name || '',
        icon: a.iconEmoji || '🏆',
        earned: a.isUnlocked,
        progress: a.currentValue || 0,
        target: a.targetValue || 1,
      })));
      // §5.6 — { days: [{ date, xp, intensityLevel }], currentStreak, totalXp }
      setHeatmapDays((heatmap?.days || []).map(h => ({
        date: new Date(h.date),
        intensity: h.intensityLevel || 0,
      })));
    })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={load} />;

  const s = stats || {};

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.profileCard} className="anim-scale-in">
        <div style={styles.profileTop}>
          <div style={styles.avatarLarge} className="anim-pop">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : (user?.fullName?.charAt(0) || 'A')}
          </div>
          <div style={styles.profileInfo}>
            <h1 style={styles.profileName}>{user?.fullName || 'Foydalanuvchi'}</h1>
            <p style={styles.profileBio}>{user?.bio || "Bio yo'q"}</p>
            <div style={styles.profileMeta}>
              <span style={styles.levelBadge}>
                <GraduationCap size={14} /> {user?.currentLevel || 'N5'}
              </span>
              <span style={styles.planBadge}>{user?.plan || 'Free'}</span>
            </div>
          </div>
          <button style={styles.editBtn} onClick={() => navigate('/profile/edit')}>
            <Pencil size={15} /> Tahrirlash
          </button>
        </div>
        <div style={styles.xpSection}>
          <div style={styles.xpTop}>
            <span style={styles.xpLabel}>Tajriba</span>
            <span style={styles.xpNum}>{user?.xp || 0} / {user?.xpToNextLevel || 5000} XP</span>
          </div>
          <div style={styles.xpBarBg}>
            <div className="progress-shine" style={{ ...styles.xpBar, width: `${((user?.xp || 0) / (user?.xpToNextLevel || 5000)) * 100}%` }} />
          </div>
        </div>
      </div>

      <div style={styles.statsGrid} className="stagger-grid">
        {[
          { icon: <Flame size={20} color="var(--warning)" className="anim-flame" />, label: 'Streak', value: `${user?.currentStreak || 0} kun`, sub: `Eng uzun: ${user?.longestStreak || 0}` },
          { icon: <Coins size={20} color="var(--accent)" />, label: 'Tangalar', value: user?.coins || 0, sub: "Do'konda sarflang" },
          { icon: <BarChart3 size={20} color="var(--success)" />, label: "So'zlar", value: s.totalWordsLearned || 0, sub: "O'rganilgan" },
          { icon: <Target size={20} color="var(--secondary)" />, label: "Aniqlik", value: `${s.overallAccuracy || 0}%`, sub: "O'rtacha natija" },
        ].map((stat, i) => (
          <div key={i} style={styles.statCard} className="card-interactive">
            {stat.icon}
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
            <div style={styles.statSub}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={styles.quickLinksGrid} className="stagger-grid">
        {[
          { to: '/friends', icon: <Users size={20} color="var(--secondary)" />, label: "Do'stlar" },
          { to: '/achievements', icon: <Award size={20} color="var(--medal-gold)" />, label: 'Yutuqlar' },
          { to: '/saved', icon: <Bookmark size={20} color="var(--success)" />, label: 'Saqlangan' },
          { to: '/referral', icon: <Gift size={20} color="var(--pink-dark)" />, label: 'Taklif kodi' },
          { to: '/notifications', icon: <Bell size={20} color="var(--warning)" />, label: 'Bildirishnomalar' },
        ].map(link => (
          <Link key={link.to} to={link.to} style={styles.quickLink} className="card-interactive">
            {link.icon}
            <span style={styles.quickLinkLabel}>{link.label}</span>
            <ChevronRight size={16} color="var(--text-light)" />
          </Link>
        ))}
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Faollik xaritasi</h2>
        <div style={styles.heatmap}>
          {heatmapDays.map((day, i) => (
            <div key={i} style={{
              ...styles.heatmapDay,
              background: day.intensity === 0 ? 'var(--border-light)' :
                day.intensity === 1 ? 'var(--success-soft)' :
                day.intensity === 2 ? 'var(--primary-light)' :
                day.intensity === 3 ? 'var(--success)' : 'var(--success-dark)',
            }} title={day.date.toLocaleDateString()} />
          ))}
        </div>
        <div style={styles.heatmapLegend}>
          <span style={styles.legendLabel}>Kam</span>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              ...styles.legendBox,
              background: i === 0 ? 'var(--border-light)' : i === 1 ? 'var(--success-soft)' :
                i === 2 ? 'var(--primary-light)' : i === 3 ? 'var(--success)' : 'var(--success-dark)',
            }} />
          ))}
          <span style={styles.legendLabel}>Ko'p</span>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}><Award size={20} /> Yutuqlar</h2>
        <div style={styles.achievementGrid} className="stagger-grid">
          {achievementList.map(a => (
            <div key={a.id} style={{ ...styles.achievementCard, opacity: a.earned ? 1 : 0.5 }} className={a.earned ? 'hover-scale' : ''}>
              <div style={styles.achievementIcon}>{a.icon}</div>
              <div style={styles.achievementName}>{a.name}</div>
              {a.earned ? (
                <div style={styles.achievementEarned}>Olingan</div>
              ) : (
                <div style={styles.achievementProgress}>{a.progress}/{a.target}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Batafsil statistika</h2>
        <div style={styles.detailList}>
          {[
            { label: "O'rganilgan so'zlar", value: s.totalWordsLearned || 0 },
            { label: "O'rganilgan kanji", value: s.totalKanjiLearned || 0 },
            { label: "O'rganilgan grammatika", value: s.totalGrammarLearned || 0 },
            { label: "Jami takrorlashlar", value: s.totalReviews || 0 },
            { label: "Tugatilgan darslar (30 kun)", value: s.lessonsCompleted || 0 },
            { label: "O'qish vaqti (30 kun)", value: `${s.minutesStudied || 0} daqiqa` },
            { label: "Jami XP", value: s.totalXp || 0 },
            { label: 'Tangalar', value: s.coins || 0 },
          ].map((item, i) => (
            <div key={i} style={styles.detailRow}>
              <span style={styles.detailLabel}>{item.label}</span>
              <span style={styles.detailValue}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  // Same hero language as <PageHeader>/the dashboard welcome card — the
  // premium violet is reserved for subscription screens only.
  profileCard: {
    background: 'linear-gradient(135deg, var(--primary-dark), var(--primary) 58%, var(--primary-light))',
    boxShadow: '0 5px 0 var(--primary-dark)',
    borderRadius: 'var(--radius-xl)', padding: 24, color: 'white',
  },
  profileTop: { display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 },
  editBtn: {
    display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', alignSelf: 'flex-start',
    padding: '8px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.2)',
    border: '2px solid rgba(255,255,255,0.3)', color: 'white',
    fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0,
  },
  avatarLarge: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 28, border: '3px solid rgba(255,255,255,0.3)',
    flexShrink: 0,
  },
  profileInfo: {},
  profileName: { fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'white' },
  profileBio: { fontSize: 14, opacity: 0.8, marginBottom: 8 },
  profileMeta: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  levelBadge: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.2)',
    fontSize: 12, fontWeight: 600,
  },
  planBadge: {
    padding: '4px 10px', borderRadius: 8, background: 'rgba(255,184,0,0.3)',
    fontSize: 12, fontWeight: 600, color: 'var(--accent)',
  },
  joinDate: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, opacity: 0.6 },
  xpSection: {},
  xpTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel: { fontSize: 13, opacity: 0.7 },
  xpNum: { fontSize: 13, fontWeight: 600 },
  xpBarBg: { height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
  xpBar: { height: '100%', background: 'var(--accent)', borderRadius: 4, transition: 'width 0.5s' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 },
  statCard: {
    background: 'var(--bg-card)', borderRadius: 14, padding: 16, textAlign: 'center',
    border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)',
  },
  statValue: { fontSize: 24, fontWeight: 700, color: 'var(--text)', marginTop: 6 },
  statLabel: { fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' },
  statSub: { fontSize: 11, color: 'var(--text-light)' },
  card: {
    background: 'var(--bg-card)', borderRadius: 16, padding: 20,
    border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)',
  },
  sectionTitle: {
    fontSize: 16, fontWeight: 600, color: 'var(--text)',
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
  },
  heatmap: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 14px)',
    gap: 3, justifyContent: 'center',
  },
  heatmapDay: { width: 14, height: 14, borderRadius: 3 },
  heatmapLegend: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 4, marginTop: 10, fontSize: 11, color: 'var(--text-light)',
  },
  legendLabel: {},
  legendBox: { width: 12, height: 12, borderRadius: 2 },
  achievementGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10,
  },
  achievementCard: {
    textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: 'var(--bg)',
  },
  achievementIcon: { fontSize: 28, marginBottom: 4 },
  achievementName: { fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 2 },
  achievementEarned: { fontSize: 10, color: 'var(--success)', fontWeight: 500 },
  achievementProgress: { fontSize: 10, color: 'var(--text-light)' },
  detailList: {},
  detailRow: {
    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
    borderBottom: '1px solid var(--border-light)',
  },
  detailLabel: { fontSize: 14, color: 'var(--text-secondary)' },
  detailValue: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  quickLinksGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10,
  },
  quickLink: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 16px', borderRadius: 12,
    background: 'var(--bg-card)', border: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow-sm)', textDecoration: 'none', color: 'var(--text)',
  },
  quickLinkLabel: { flex: 1, fontSize: 14, fontWeight: 500 },
};
