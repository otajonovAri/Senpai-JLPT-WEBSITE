import { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

// Global 429 sahifasi — api/client.js 429 olganda 'api:rate-limit' eventini yuboradi,
// bu overlay BARCHA sahifalar ustida ochiladi va countdown tugagach qayta urinishga ruxsat beradi.
export default function RateLimitOverlay() {
  const [visible, setVisible] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const timerRef = useRef(null);

  useEffect(() => {
    const onRateLimit = (e) => {
      // Parallel 429'lar bitta overlay ochadi — ko'rinib turganda qayta ishga tushirmaymiz
      setVisible(v => {
        if (v) return v;
        setSeconds(e.detail?.retryAfter || 60);
        return true;
      });
    };
    window.addEventListener('api:rate-limit', onRateLimit);
    return () => window.removeEventListener('api:rate-limit', onRateLimit);
  }, []);

  useEffect(() => {
    if (!visible) return;
    timerRef.current = setInterval(() => {
      setSeconds(s => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [visible]);

  if (!visible) return null;

  const ready = seconds === 0;

  const total = 60;
  const R = 34, C = 2 * Math.PI * R;
  const progress = ready ? 1 : Math.max(0, Math.min(1, (total - seconds) / total));

  return (
    <div style={styles.overlay}>
      <div style={styles.card} className="anim-pop">
        <img src="/mascot/sleeping.png" alt="" style={styles.mascot} />
        <div style={styles.code}>429</div>
        <h1 style={styles.title}>Juda ko'p so'rov yuborildi</h1>
        <p style={styles.sub}>
          Ajdaho biroz dam olmoqda. {ready
            ? "Endi qayta urinib ko'rishingiz mumkin."
            : "Biroz kutib turing — server yangi so'rovlarni qabul qilishga tayyorlanmoqda."}
        </p>

        {!ready && (
          <div style={styles.ringWrap}>
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r={R} fill="none" stroke="var(--border)" strokeWidth="7" />
              <circle cx="44" cy="44" r={R} fill="none" stroke="var(--primary)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - progress)} transform="rotate(-90 44 44)"
                style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div style={styles.ringInner}>
              <div style={styles.countNum}>{seconds}</div>
              <div style={styles.countLabel}>soniya</div>
            </div>
          </div>
        )}

        <button
          style={{ ...styles.retryBtn, ...(ready ? {} : styles.retryDisabled) }}
          className={ready ? 'press' : ''}
          disabled={!ready}
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={18} /> Qayta urinish
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(170deg, var(--bg) 0%, var(--primary-soft) 140%)',
    padding: 20,
  },
  card: {
    textAlign: 'center', maxWidth: 420, width: '100%',
    background: 'var(--bg-card)', border: '2px solid var(--border)',
    borderRadius: 28, padding: '36px 28px 32px',
    boxShadow: 'var(--shadow-xl)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  mascot: {
    width: 132, height: 132, objectFit: 'contain', marginBottom: 4,
    filter: 'drop-shadow(0 12px 22px rgba(0,0,0,0.18))',
  },
  code: {
    fontSize: 48, fontWeight: 900, color: 'var(--accent)',
    letterSpacing: -2, lineHeight: 1, marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 8 },
  sub: { fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.55, marginBottom: 22 },
  ringWrap: {
    position: 'relative', width: 88, height: 88, marginBottom: 24,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  ringInner: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  countNum: { fontSize: 30, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 },
  countLabel: { fontSize: 11, fontWeight: 700, color: 'var(--text-light)', marginTop: 2 },
  retryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '14px 32px', borderRadius: 16,
    background: 'var(--primary)', color: 'white',
    fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 0 var(--primary-dark)',
  },
  retryDisabled: {
    background: 'var(--border)', color: 'var(--text-light)',
    boxShadow: '0 4px 0 var(--border-dark)', cursor: 'not-allowed',
  },
};
