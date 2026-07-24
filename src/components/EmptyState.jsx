import { BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// 51-ekran: Bo'sh holat (maskot bilan)
export default function EmptyState({ title, subtitle, actionText, onAction }) {
  const { t } = useLanguage();
  return (
    <div style={styles.container} className="animate-in">
      <div style={styles.mascot}>🦊</div>
      <h3 style={styles.title}>{title || t('emptyState.title')}</h3>
      <p style={styles.sub}>{subtitle || t('emptyState.subtitle')}</p>
      {actionText && onAction && (
        <button style={styles.btn} onClick={onAction}>
          <BookOpen size={16} /> {actionText}
        </button>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' },
  mascot: { fontSize: 80, marginBottom: 8, opacity: 0.9 },
  title: { fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 6 },
  sub: { fontSize: 12, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 20 },
  btn: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 14, background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(88,204,2,0.3)' },
};
