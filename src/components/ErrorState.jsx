import { WifiOff, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Backend'dan ma'lumot kelmaganda ko'rsatiladigan holat (mock fallback O'RNIGA).
// <ErrorState message={error} onRetry={refetch} />
export default function ErrorState({ message, onRetry }) {
  const { t } = useLanguage();
  return (
    <div style={styles.wrap} className="animate-in">
      <div style={styles.iconWrap}>
        <WifiOff size={28} color="var(--danger)" />
      </div>
      <h3 style={styles.title}>{t('errorState.title')}</h3>
      <p style={styles.desc}>{message || t('errorState.message')}</p>
      {onRetry && (
        <button className="btn btn--primary btn--sm" onClick={onRetry}>
          <RefreshCw size={15} /> {t('common.retry')}
        </button>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)', border: '2px solid var(--border)', maxWidth: 420, margin: '24px auto',
  },
  iconWrap: {
    width: 60, height: 60, borderRadius: '50%', background: 'var(--danger-soft)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
  },
  title: { fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 6 },
  desc: { fontSize: 13, fontWeight: 600, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 18 },
};
