import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

// 01-ekran: Splash — maskot + brend ko'rsatilib, keyin onboarding/dashboardga o'tadi
export default function Splash() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate(user ? '/dashboard' : '/onboarding', { replace: true });
    }, 2200);
    return () => clearTimeout(t);
  }, [navigate, user]);

  return (
    <div style={styles.page} onClick={() => navigate(user ? '/dashboard' : '/onboarding', { replace: true })}>
      <div style={styles.glow} />

      <div style={styles.center} className="stagger">
        <img
          src="/mascot/greeting.png"
          alt="SenpaiJLPT maskoti"
          style={styles.mascot}
        />
        <div style={styles.logoJp} className="jp">先輩 JLPT</div>
        <div style={styles.logoEn}>
          Senpai<span style={{ color: 'var(--primary)' }}>JLPT</span>
        </div>
        <div style={styles.tagline}>{t('auth.splashTagline')}</div>
      </div>

      <div style={styles.dots}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ ...styles.dot, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(170deg, var(--bg) 0%, var(--primary-soft) 130%)',
    cursor: 'pointer',
    gap: 56,
    position: 'relative',
    overflow: 'hidden',
  },
  // Maskot orqasidagi yumshoq nur — quti emas, shunchaki radial yog'du
  glow: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -62%)',
    width: 420, height: 420,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(88,204,2,0.16) 0%, rgba(88,204,2,0) 65%)',
    pointerEvents: 'none',
  },
  center: { textAlign: 'center', position: 'relative', zIndex: 1 },
  mascot: {
    width: 170,
    height: 170,
    objectFit: 'contain',
    marginBottom: 18,
    filter: 'drop-shadow(0 14px 24px rgba(46,125,50,0.22))',
  },
  logoJp: { fontSize: 24, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 2, letterSpacing: 2 },
  logoEn: { fontSize: 42, fontWeight: 900, color: 'var(--text)', letterSpacing: -1 },
  tagline: { fontSize: 15, color: 'var(--text-secondary)', marginTop: 12, fontWeight: 700 },
  dots: { display: 'flex', gap: 8, position: 'relative', zIndex: 1 },
  dot: {
    width: 9, height: 9, borderRadius: '50%',
    background: 'var(--primary)', opacity: 0.4,
    animation: 'pulse 1.2s ease-in-out infinite',
    display: 'inline-block',
  },
};
