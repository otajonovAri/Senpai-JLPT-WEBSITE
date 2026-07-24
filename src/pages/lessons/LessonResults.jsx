import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Zap, Target, Clock } from 'lucide-react';

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function LessonResults() {
  const navigate = useNavigate();
  const location = useLocation();

  // §10.3 — CompleteLesson javobi navigate('/lesson-results', { state: {...} }) orqali keladi:
  // { score, stars, xpEarned, coinsEarned, timeSpentSeconds, nextLessonId }
  const s = location.state || {};
  const results = {
    xp: s.xpEarned ?? 35,
    accuracy: s.score ?? 88,
    coins: s.coinsEarned ?? 10,
    time: formatTime(s.timeSpentSeconds) ?? '4:12',
    nextLessonId: s.nextLessonId ?? null,
  };

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.top}>
        <div style={styles.checkCircle}><Check size={48} color="white" /></div>
        <h1 style={styles.title}>Dars tugadi!</h1>
        <p style={styles.sub}>Ajoyib natija ko'rsatdingiz</p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(167,139,250,0.1)' }}><Zap size={18} color="#7C3AED" /></div>
          <div>
            <div style={styles.statVal}>{results.xp}</div>
            <div style={styles.statLabel}>XP</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(76,175,80,0.1)' }}><Target size={18} color="var(--success)" /></div>
          <div>
            <div style={styles.statVal}>{results.accuracy}%</div>
            <div style={styles.statLabel}>Aniqlik</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(255,193,7,0.1)' }}><span style={{ fontSize: 18 }}>💰</span></div>
          <div>
            <div style={styles.statVal}>{results.coins}</div>
            <div style={styles.statLabel}>Tangalar</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(33,150,243,0.1)' }}><Clock size={18} color="#1565C0" /></div>
          <div>
            <div style={styles.statVal}>{results.time}</div>
            <div style={styles.statLabel}>Vaqt</div>
          </div>
        </div>
      </div>

      <div style={styles.btns}>
        <button style={styles.mainBtn} onClick={() => navigate(results.nextLessonId ? `/lessons/${results.nextLessonId}` : '/lessons')}>
          Keyingi darsga
        </button>
        <button style={styles.secBtn} onClick={() => navigate('/dashboard')}>Bosh sahifaga</button>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  top: { textAlign: 'center', padding: '32px 20px 0' },
  checkCircle: { width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, var(--success), #2E7D32)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 40px rgba(76,175,80,0.3)' },
  title: { fontSize: 24, fontWeight: 800, color: 'var(--text)' },
  sub: { fontSize: 13, color: 'var(--text-light)', marginTop: 4 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  statCard: { background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 10 },
  statIcon: { width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statVal: { fontSize: 20, fontWeight: 800, color: 'var(--text)', lineHeight: 1 },
  statLabel: { fontSize: 10, color: 'var(--text-light)', fontWeight: 600, marginTop: 2 },
  btns: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 },
  mainBtn: { padding: 15, borderRadius: 14, background: 'var(--success)', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(76,175,80,0.3)' },
  secBtn: { padding: 13, borderRadius: 14, background: 'var(--bg)', border: '1px solid var(--border-light)', color: 'var(--text-light)', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
};
