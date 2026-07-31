import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function StreakLost({ streak = 7, freezeCount = 2, onClose }) {
  const navigate = useNavigate();

  const handleFreeze = () => {
    if (onClose) onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="animate-in">
        <div style={styles.center}>
          <div style={{ fontSize: 72, filter: 'grayscale(0.3)', marginBottom: 6 }}>🔥</div>
          <div style={styles.streakNum}><s>{streak}</s></div>
          <h2 style={styles.title}>Streak yo'qoldi!</h2>
          <p style={styles.sub}>Kecha dars o'tmadingiz. Streak qaytadan boshlanadi.</p>

          <div style={styles.freezeCard}>
            <span style={{ fontSize: 30 }}>❄️</span>
            <div style={styles.freezeInfo}>
              <div style={styles.freezeTitle}>Streak Freeze</div>
              <div style={styles.freezeSub}>Streakni saqlab qolish</div>
            </div>
            <div style={styles.freezeCount}>{freezeCount}</div>
          </div>
        </div>

        <div style={styles.btns}>
          <button style={styles.mainBtn} onClick={handleFreeze}>
            <Shield size={16} /> Freeze ishlatish
          </button>
          <button style={styles.secBtn} onClick={() => { if (onClose) onClose(); navigate('/dashboard'); }}>
            Davom etish
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal: { width: '100%', maxWidth: 380, background: 'var(--bg-card)', borderRadius: 24, padding: 24, textAlign: 'center' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  streakNum: { fontSize: 40, fontWeight: 900, color: 'var(--text-light)' },
  title: { fontSize: 20, fontWeight: 800, color: 'var(--text)', marginTop: 10, marginBottom: 6 },
  sub: { fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 16 },
  freezeCard: { width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(33,150,243,0.06)', border: '1px solid rgba(33,150,243,0.2)', borderRadius: 16, padding: '12px 14px', marginBottom: 10 },
  freezeInfo: { flex: 1, textAlign: 'left' },
  freezeTitle: { fontSize: 13, fontWeight: 700, color: 'var(--secondary-dark)' },
  freezeSub: { fontSize: 10, color: 'var(--text-light)', marginTop: 1 },
  freezeCount: { fontSize: 16, fontWeight: 900, color: 'var(--secondary-dark)', background: 'rgba(33,150,243,0.12)', border: '1px solid rgba(33,150,243,0.25)', borderRadius: 10, padding: '6px 12px' },
  btns: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%' },
  mainBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, var(--secondary), var(--secondary-dark))', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(33,150,243,0.3)' },
  secBtn: { padding: 13, borderRadius: 14, background: 'none', border: '2px solid var(--border)', color: 'var(--text-light)', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
};
