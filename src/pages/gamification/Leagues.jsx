import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getLeagueStandings } from '../../api/gamification';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { ChevronUp, ChevronDown, Loader } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

// §15.5 — LeagueTier: Bronze=0..Diamond=4; route'da NOM ishlatiladi
const LEAGUES = [
  { tier: 'Bronze', name: 'Bronza', icon: '🥉', color: 'var(--medal-bronze)' },
  { tier: 'Silver', name: 'Kumush', icon: '🥈', color: 'var(--medal-silver)' },
  { tier: 'Gold', name: 'Oltin', icon: '🥇', color: 'var(--medal-gold)' },
  { tier: 'Platinum', name: 'Platina', icon: '💎', color: 'var(--success)' },
  { tier: 'Diamond', name: 'Olmos', icon: '👑', color: 'var(--secondary-light)' },
];

export default function Leagues() {
  const { user } = useAuth();
  const [tierIndex, setTierIndex] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const league = LEAGUES[tierIndex];

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getLeagueStandings(LEAGUES[tierIndex].tier)
      .then(res => setData(res))
      .catch(err => {
        // 404 = bu daraja uchun joriy liga davri ochilmagan
        if (err.status === 404) setData(null);
        else setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [tierIndex]);

  useEffect(() => { load(); }, [load]);

  const players = data?.players || [];

  return (
    <div style={styles.page} className="stagger">
      <PageHeader
        icon={league.icon}
        title={`${league.name} Ligasi`}
        subtitle={data ? `${data.weekStart} — ${data.weekEnd} haftasi` : "Eng yaxshi 10 ta keyingi ligaga o'tadi"}
        accent="gold"
      />

      <div style={{ ...styles.banner, background: `linear-gradient(135deg, color-mix(in srgb, ${league.color} 18%, transparent), color-mix(in srgb, ${league.color} 38%, transparent))` }} className="anim-scale-in">
        <div style={styles.leagueRow}>
          {LEAGUES.map((l, i) => (
            <button key={l.tier} onClick={() => setTierIndex(i)}
              className="press"
              style={{ ...styles.leagueDot, ...(i === tierIndex ? { transform: 'scale(1.3)', border: `2px solid ${l.color}` } : { opacity: 0.4 }) }}>
              {l.icon}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.promoRow}>
        <div style={styles.promoCard}>
          <ChevronUp size={16} color="var(--success)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>Top 10 — ko'tariladi</span>
        </div>
        <div style={styles.promoCard}>
          <ChevronDown size={16} color="var(--danger)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)' }}>Oxirgi 5 — tushadi</span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : players.length === 0 ? (
        <EmptyState title="Liga bo'sh" subtitle="Bu ligada hozircha o'yinchilar yo'q yoki davr ochilmagan" />
      ) : (
        <div style={styles.list} className="stagger">
          {players.map((p, i) => {
            const isMe = p.userId === user?.id;
            return (
              <div key={p.userId} className={isMe ? 'anim-glow-pulse' : 'hover-scale'} style={{ ...styles.row, ...(isMe ? styles.myRow : {}), ...(i < 3 ? { borderLeft: `3px solid ${['var(--medal-gold)', 'var(--medal-silver)', 'var(--medal-bronze)'][i]}` } : {}) }}>
                <div style={styles.rank}>{i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${p.rank}`}</div>
                <div style={styles.avatar}>
                  {p.avatarUrl
                    ? <img src={p.avatarUrl} alt="" style={styles.avatarImg} />
                    : p.username?.charAt(0)?.toUpperCase()}
                </div>
                <div style={styles.userInfo}>
                  <div style={{ fontSize: 14, fontWeight: isMe ? 700 : 500, color: 'var(--text)' }}>{p.username}{isMe ? ' (Siz)' : ''}</div>
                </div>
                <div style={styles.xp}>{p.weeklyXp} XP</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 14 },
  banner: { borderRadius: 16, padding: '24px 20px', textAlign: 'center' },
  bannerIcon: { fontSize: 48, marginBottom: 6 },
  bannerTitle: { fontSize: 22, fontWeight: 800, color: 'var(--text)' },
  bannerSub: { fontSize: 12, color: 'var(--text-light)', marginTop: 4 },
  leagueRow: { display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 },
  leagueDot: { width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'all 0.2s', border: '1px solid var(--border-light)', cursor: 'pointer' },
  promoRow: { display: 'flex', gap: 8 },
  promoCard: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' },
  list: { display: 'flex', flexDirection: 'column', gap: 5 },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' },
  myRow: { background: 'rgba(88,204,2,0.05)', borderColor: 'var(--primary)' },
  rank: { width: 34, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' },
  avatar: { width: 34, height: 34, borderRadius: '50%', background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' },
  userInfo: { flex: 1 },
  xp: { fontSize: 13, fontWeight: 700, color: 'var(--text)' },
};
