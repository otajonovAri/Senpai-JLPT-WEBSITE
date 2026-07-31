import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// 52-ekran: Internet Yo'q holati
export default function OfflineBanner() {
  const { t } = useLanguage();
  const [online, setOnline] = useState(navigator.onLine);
  const [justBack, setJustBack] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      setJustBack(true);
      setTimeout(() => setJustBack(false), 2500);
    };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (online && !justBack) return null;

  if (online && justBack) {
    return (
      <div style={{ ...styles.banner, background: 'var(--success)' }} className="animate-in">
        <RefreshCw size={15} />
        <span>{t('offline.backOnline')}</span>
      </div>
    );
  }

  return (
    <div style={styles.banner} className="animate-in">
      <WifiOff size={15} />
      <span>{t('offline.offline')}</span>
    </div>
  );
}

const styles = {
  banner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 4000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '8px 16px',
    background: 'var(--text)',
    color: 'white',
    fontSize: 12.5,
    fontWeight: 600,
  },
};
