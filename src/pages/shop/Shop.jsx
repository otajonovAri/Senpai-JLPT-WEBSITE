import { useState, useEffect, useCallback } from 'react';
import { getShopItems, purchaseItem } from '../../api/shop';
import { useToast } from '../../context/ToastContext';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Coins, Loader } from 'lucide-react';

const CATEGORY_ICONS = {
  StreakFreeze: '❄️', XpBooster: '⚡', Hat: '🎩', Outfit: '👘',
  Background: '🌄', CatSkin: '🐱', Theme: '🎨',
};
const BOOST_CATEGORIES = ['StreakFreeze', 'XpBooster'];

export default function Shop() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getShopItems()
      .then(data => {
        setCoins(data?.userCoins ?? 0);
        setItems((data?.items || []).map(i => ({
          id: i.id,
          name: i.nameUz || i.name,
          description: BOOST_CATEGORIES.includes(i.category) ? 'Boost' : 'Maskot bezagi',
          price: i.price,
          icon: CATEGORY_ICONS[i.category] || '🎁',
          category: BOOST_CATEGORIES.includes(i.category) ? 'boost' : 'cosmetic',
          owned: i.isOwned,
          quantity: i.ownedQuantity,
        })));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleBuy = async (item) => {
    if (coins < item.price) return;
    try {
      const res = await purchaseItem(item.id);
      setCoins(res.remainingCoins);
      if (res.success) {
        toast.success(res.message);
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, owned: true, quantity: (i.quantity || 0) + 1 } : i));
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.message || 'Xarid amalga oshmadi');
    }
  };

  const filtered = tab === 'all' ? items : items.filter(i => i.category === tab);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (items.length === 0) return <EmptyState title="Do'kon bo'sh" subtitle="Mahsulotlar hali qo'shilmagan" />;

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.heroBanner} className="anim-scale-in">
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Do'kon</h1>
          <p style={styles.heroSub}>Coinlar bilan xarid qiling</p>
        </div>
        <div style={styles.heroRight}>
          <div style={styles.coinsBadge} className="anim-pop"><Coins size={18} /> {coins}</div>
        </div>
        <img src="/mascot/shopkeeper.png" alt="Shopkeeper" style={styles.heroMascot} />
      </div>

      <div style={styles.tabs}>
        {[['all', 'Barchasi'], ['boost', 'Boost'], ['cosmetic', 'Kosmetik']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="press"
            style={{ ...styles.tabBtn, ...(tab === key ? styles.tabActive : {}) }}>{label}</button>
        ))}
      </div>

      <div style={styles.grid} className="stagger-grid">
        {filtered.map(item => (
          <div key={item.id} style={styles.card} className="card-interactive">
            <div style={styles.cardIcon} className="anim-float">{item.icon}</div>
            <div style={styles.cardName}>{item.name}</div>
            <div style={styles.cardDesc}>{item.description}</div>
            {item.owned ? (
              <div style={styles.ownedBadge}>Sotib olingan ✓</div>
            ) : (
              <button style={{ ...styles.buyBtn, ...(coins < item.price ? { opacity: 0.5 } : {}) }}
                className="press ripple"
                onClick={() => handleBuy(item)} disabled={coins < item.price}>
                💰 {item.price}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 14 },
  heroBanner: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '24px 28px', borderRadius: 20,
    background: 'linear-gradient(135deg, #FF9800, #F57C00)',
    color: 'white', overflow: 'hidden', position: 'relative',
  },
  heroContent: { flex: 1, zIndex: 1 },
  heroTitle: { fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 },
  heroSub: { fontSize: 14, opacity: 0.85, fontWeight: 600 },
  heroRight: { zIndex: 1 },
  heroMascot: { width: 80, height: 80, objectFit: 'contain', flexShrink: 0 },
  coinsBadge: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.25)', color: 'white', fontSize: 16, fontWeight: 800, backdropFilter: 'blur(8px)' },
  tabs: { display: 'flex', gap: 6 },
  tabBtn: { padding: '6px 16px', borderRadius: 16, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' },
  tabActive: { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 },
  card: { background: 'var(--bg-card)', borderRadius: 14, padding: 16, textAlign: 'center', border: '1px solid var(--border-light)' },
  cardIcon: { fontSize: 36, marginBottom: 6 },
  cardName: { fontSize: 13, fontWeight: 700, color: 'var(--text)' },
  cardDesc: { fontSize: 11, color: 'var(--text-light)', marginTop: 2, marginBottom: 10 },
  buyBtn: { padding: '6px 16px', borderRadius: 8, background: 'var(--primary)', color: 'white', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' },
  ownedBadge: { fontSize: 11, fontWeight: 600, color: 'var(--success)' },
};
