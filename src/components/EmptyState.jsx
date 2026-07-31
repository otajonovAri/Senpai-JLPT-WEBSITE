import { BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// 51-ekran: Bo'sh holat (maskot bilan)
export default function EmptyState({ title, subtitle, actionText, onAction }) {
  const { t } = useLanguage();
  return (
    <div style={styles.container} className="animate-in">
      <img src="/mascot/peeking.png" alt="" style={styles.mascot} className="anim-breathe" />
      <h3 style={styles.title}>{title || t('emptyState.title')}</h3>
      <p style={styles.sub}>{subtitle || t('emptyState.subtitle')}</p>
      {actionText && onAction && (
        <button className="btn btn--primary" onClick={onAction}>
          <BookOpen size={16} /> {actionText}
        </button>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' },
  mascot: { width: 120, height: 120, objectFit: 'contain', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 6 },
  sub: { fontSize: 13, fontWeight: 600, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 20 },
};
