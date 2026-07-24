import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Clock, Zap } from 'lucide-react';

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function LevelComplete() {
  const navigate = useNavigate();
  const location = useLocation();

  // navigate('/level-complete', { state: { level, xpEarned, score, coinsEarned, timeSpentSeconds } })
  const st = location.state || {};
  const level = st.level ?? 5;
  const stats = {
    xp: st.xpEarned ?? 45,
    accuracy: st.score ?? 92,
    coins: st.coinsEarned ?? 15,
    time: formatTime(st.timeSpentSeconds) ?? '3:24',
  };

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.confetti}>
        {['🎉', '⭐', '🌸', '✨', '🎊'].map((e, i) => (
          <span key={i} style={{ position: 'absolute', fontSize: 20, top: `${15 + i * 12}%`, left: `${10 + i * 18}%`, animation: `float ${2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>{e}</span>
        ))}
      </div>

      <div style={styles.center}>
        <div style={styles.ring}>
          <div style={styles.ringInner}>
            <div style={styles.levelNum}>{level}</div>
            <div style={styles.levelLabel}>DARAJA</div>
          </div>
        </div>

        <h1 style={styles.title}>Ajoyib natija!</h1>
        <p style={styles.sub}>Siz yangi darajaga ko'tarildingiz</p>

        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <Zap size={16} color="var(--primary)" />
            <div style={styles.statVal}>{stats.xp}</div>
            <div style={styles.statLabel}>XP</div>
          </div>
          <div style={styles.stat}>
            <Star size={16} color="var(--success)" />
            <div style={styles.statVal}>{stats.accuracy}%</div>
            <div style={styles.statLabel}>Aniqlik</div>
          </div>
          <div style={styles.stat}>
            <span style={{ fontSize: 16 }}>💰</span>
            <div style={styles.statVal}>{stats.coins}</div>
            <div style={styles.statLabel}>Tanga</div>
          </div>
          <div style={styles.stat}>
            <Clock size={16} color="#2196F3" />
            <div style={styles.statVal}>{stats.time}</div>
            <div style={styles.statLabel}>Vaqt</div>
          </div>
        </div>
      </div>

      <div style={styles.btns}>
        <button style={styles.mainBtn} onClick={() => navigate('/lessons')}>Keyingi darsga</button>
        <button style={styles.secBtn} onClick={() => navigate('/dashboard')}>Bosh sahifaga</button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', display: 'flex', flexDirection: 'column', position: 'relative' },
  confetti: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, overflow: 'hidden', zIndex: 0 },
  center: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 20px 0', textAlign: 'center', position: 'relative', zIndex: 1 },
  ring: { width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700, var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(255,215,0,0.3), 0 0 0 10px rgba(255,215,0,0.08)', marginBottom: 20 },
  ringInner: { width: 96, height: 96, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  levelNum: { fontSize: 36, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 },
  levelLabel: { fontSize: 9, fontWeight: 800, color: 'var(--text-light)', letterSpacing: 2 },
  title: { fontSize: 24, fontWeight: 900, background: 'linear-gradient(135deg, #FFD700, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 },
  sub: { fontSize: 13, color: 'var(--text-light)' },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 24, width: '100%', maxWidth: 300 },
  stat: { background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 14, padding: 12, textAlign: 'center' },
  statVal: { fontSize: 20, fontWeight: 800, color: 'var(--text)', marginTop: 2 },
  statLabel: { fontSize: 9, color: 'var(--text-light)', fontWeight: 600, marginTop: 2 },
  btns: { padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 },
  mainBtn: { background: 'linear-gradient(135deg, #FFD700, var(--primary))', borderRadius: 14, padding: 15, fontSize: 14, fontWeight: 800, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,215,0,0.3)' },
  secBtn: { background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 14, padding: 13, fontSize: 12, fontWeight: 600, color: 'var(--text-light)', cursor: 'pointer' },
};
