import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Home, ArrowLeft } from 'lucide-react';

// 404 — mavjud bo'lmagan manzilga kirilganda ko'rsatiladi
export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const homePath = user ? '/dashboard' : '/';

  return (
    <div style={styles.page}>
      <div style={styles.center} className="stagger">
        <img
          src="/mascot/Not_Found_404-removebg-preview.png"
          alt="Sahifa topilmadi"
          style={styles.mascot}
        />
        {/* <div style={styles.code}>404</div> */}
        <h1 style={styles.title}>{t('notFound.title')}</h1>
        <p style={styles.sub}>
          {t('notFound.subtitle')}
        </p>
        <div style={styles.btns}>
          <button style={styles.homeBtn} className="press" onClick={() => navigate(homePath)}>
            <Home size={18} /> {t('notFound.home')}
          </button>
          <button style={styles.backBtn} className="press" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> {t('notFound.back')}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(170deg, var(--bg) 0%, var(--primary-soft) 130%)',
    padding: 20,
  },
  center: { textAlign: 'center', maxWidth: 420 },
  mascot: {
    width: 160,
    height: 160,
    objectFit: 'contain',
    marginBottom: 8,
    filter: 'drop-shadow(0 12px 22px rgba(46,125,50,0.2))',
  },
  code: {
    fontSize: 72,
    fontWeight: 900,
    color: 'var(--primary)',
    letterSpacing: -2,
    lineHeight: 1,
    marginBottom: 8,
  },
  title: { fontSize: 26, fontWeight: 900, color: 'var(--text)', marginBottom: 8 },
  sub: { fontSize: 15, color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.5, marginBottom: 24 },
  btns: { display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' },
  homeBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '14px 32px', borderRadius: 16,
    background: 'var(--primary)', color: 'white',
    fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 0 var(--primary-dark)',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '10px 20px', borderRadius: 12,
    background: 'transparent', color: 'var(--text-secondary)',
    fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
  },
};
