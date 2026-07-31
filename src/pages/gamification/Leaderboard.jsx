import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getLeaderboard, getLeagueStandings } from '../../api/gamification';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import { Flame, Loader, ChevronRight, Trophy } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getLeaderboard(50),
      getLeagueStandings('Bronze').catch(() => null),
    ])
      .then(([lb, lg]) => {
        setEntries((lb || []).map(e => ({
          rank: e.rank,
          name: e.username || 'User',
          xp: e.xpPoints || 0,
          streak: e.streakDays || 0,
          avatarUrl: e.avatarUrl,
          userId: e.userId,
        })));
        if (lg) {
          setLeague({
            name: 'Bronze Liga',
            myRank: lg.userRank || 0,
            weeklyXp: lg.userWeeklyXp || 0,
          });
        }
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
  if (entries.length === 0) return <EmptyState title="Reyting bo'sh" subtitle="Hozircha foydalanuvchilar yo'q" />;

  return (
    <div className="page stagger">
      <PageHeader
        icon={Trophy}
        title="Reyting jadvali"
        subtitle="Eng yaxshi o'rganuvchilar reytingi"
        accent="gold"
        right={
          <>
            <Link to="/leagues" style={styles.leagueLink} className="press">
              <img src="/mascot/shield.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} /> Ligalar <ChevronRight size={16} />
            </Link>
            <img src="/mascot/champion.png" alt="" style={styles.heroMascot} />
          </>
        }
      />

      {league && (
        <div style={styles.leagueBanner} className="anim-scale-in">
          <div style={styles.leagueIcon} className="anim-float">
            <img src="/mascot/shield.png" alt="League" style={styles.leagueShield} />
          </div>
          <div style={styles.leagueInfo}>
            <div style={styles.leagueName}>{league.name}</div>
            <div style={styles.leagueDesc}>Haftalik XP: {league.weeklyXp}</div>
          </div>
          <div style={styles.myRank}>
            <div style={styles.myRankNum}>{league.myRank > 0 ? `#${league.myRank}` : '—'}</div>
            <div style={styles.myRankLabel}>Sizning o'rningiz</div>
          </div>
        </div>
      )}

      <div style={styles.podium} className="stagger-grid">
        {entries.slice(0, 3).map((entry, i) => (
          <div key={entry.rank} className="anim-bounce" style={{ ...styles.podiumItem, order: i === 0 ? 1 : i === 1 ? 0 : 2 }}>
            <div style={{
              ...styles.podiumAvatar,
              width: i === 0 ? 64 : 52, height: i === 0 ? 64 : 52,
              border: `3px solid ${i === 0 ? 'var(--medal-gold)' : i === 1 ? 'var(--medal-silver)' : 'var(--medal-bronze)'}`,
            }}>
              {entry.avatarUrl
                ? <img src={entry.avatarUrl} alt="" style={styles.avatarImg} />
                : entry.name.charAt(0).toUpperCase()}
            </div>
            <div style={styles.podiumName}>{entry.name}</div>
            <div style={styles.podiumXp}>{entry.xp.toLocaleString()} XP</div>
            <div style={{ ...styles.podiumBadge, background: i === 0 ? 'var(--medal-gold)' : i === 1 ? 'var(--medal-silver)' : 'var(--medal-bronze)' }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.list} className="stagger">
        {entries.map(entry => {
          const isMe = entry.userId === user?.id;
          return (
            <div key={entry.rank} style={{ ...styles.row, ...(isMe ? styles.rowMe : {}) }} className={isMe ? 'anim-glow-pulse' : 'hover-scale'}>
              <div style={styles.rowLeft}>
                <span style={{
                  ...styles.rank,
                  color: entry.rank <= 3
                    ? entry.rank === 1 ? 'var(--medal-gold)' : entry.rank === 2 ? 'var(--medal-silver-dark)' : 'var(--medal-bronze)'
                    : 'var(--text-secondary)',
                }}>#{entry.rank}</span>
                <div style={styles.rowAvatar}>
                  {entry.avatarUrl
                    ? <img src={entry.avatarUrl} alt="" style={styles.avatarImg} />
                    : entry.name.charAt(0).toUpperCase()}
                </div>
                <span style={styles.rowName}>{entry.name}{isMe ? ' (Siz)' : ''}</span>
              </div>
              <div style={styles.rowRight}>
                <span style={styles.streak}><Flame size={13} color="var(--warning)" /> {entry.streak}</span>
                <span style={styles.rowXp}>{entry.xp.toLocaleString()} XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  heroMascot: { width: 72, height: 72, objectFit: 'contain', flexShrink: 0 },
  leagueBanner: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '18px 24px', borderRadius: 'var(--radius-lg)',
    background: 'linear-gradient(135deg, var(--secondary-dark), var(--secondary))', color: 'white',
  },
  leagueIcon: { padding: 4 },
  leagueShield: { width: 42, height: 42, objectFit: 'contain' },
  leagueInfo: { flex: 1 },
  leagueName: { fontSize: 18, fontWeight: 700 },
  leagueDesc: { fontSize: 13, opacity: 0.8 },
  myRank: { textAlign: 'center' },
  myRankNum: { fontSize: 24, fontWeight: 700 },
  myRankLabel: { fontSize: 11, opacity: 0.7 },
  podium: {
    display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
    gap: 16, padding: '20px 0',
  },
  podiumItem: { textAlign: 'center' },
  podiumAvatar: {
    borderRadius: '50%', background: 'var(--secondary)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 20, margin: '0 auto 6px', overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' },
  podiumName: { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  podiumXp: { fontSize: 12, color: 'var(--text-light)' },
  podiumBadge: { fontSize: 20, marginTop: 4, borderRadius: 8, padding: '2px 6px' },
  list: { display: 'flex', flexDirection: 'column', gap: 4 },
  row: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)',
    border: '2px solid var(--border)',
  },
  rowMe: { background: 'var(--primary-soft)', borderColor: 'var(--primary)' },
  rowLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  rank: { fontSize: 14, fontWeight: 900, width: 30 },
  rowAvatar: {
    width: 32, height: 32, borderRadius: '50%', background: 'var(--secondary-light)',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600, fontSize: 13, overflow: 'hidden',
  },
  rowName: { fontSize: 14, fontWeight: 500, color: 'var(--text)' },
  rowRight: { display: 'flex', alignItems: 'center', gap: 14 },
  streak: { display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' },
  rowXp: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  leagueLink: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 'var(--radius-md)',
    background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.3)',
    color: '#fff', fontSize: 13, fontWeight: 800,
    textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap',
  },
};
