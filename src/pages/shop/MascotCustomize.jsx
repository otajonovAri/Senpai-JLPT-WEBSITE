import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getShopItems, equipItem } from '../../api/shop';
import { useToast } from '../../context/ToastContext';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Palette, Check, Loader } from 'lucide-react';

// §18.1 — kosmetik kategoriyalar (StreakFreeze/XpBooster boost, bu sahifada ko'rsatilmaydi)
const COSMETIC_TABS = [
  { key: 'Hat', label: 'Bosh kiyim', icon: '🎩' },
  { key: 'Outfit', label: 'Kiyim', icon: '👘' },
  { key: 'Background', label: 'Fon', icon: '🌄' },
  { key: 'CatSkin', label: 'Maskot', icon: '🐱' },
  { key: 'Theme', label: 'Mavzu', icon: '🎨' },
];

export default function MascotCustomize() {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('Hat');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getShopItems()
      .then(data => {
        setItems((data?.items || [])
          .filter(i => COSMETIC_TABS.some(t => t.key === i.category))
          .map(i => ({
            id: i.id,
            name: i.nameUz || i.name,
            category: i.category,
            price: i.price,
            owned: i.isOwned,
            equipped: i.isEquipped,
            icon: COSMETIC_TABS.find(t => t.key === i.category)?.icon || '🎁',
          })));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleEquip = async (item) => {
    if (!item.owned) return;
    try {
      // §18.3 — POST /shop/equip { shopItemId, equip }
      await equipItem(item.id, !item.equipped);
      setItems(prev => prev.map(i => {
        if (i.id === item.id) return { ...i, equipped: !item.equipped };
        // bitta kategoriyada bitta buyum kiyiladi
        if (i.category === item.category && !item.equipped) return { ...i, equipped: false };
        return i;
      }));
      toast.success(!item.equipped ? `${item.name} kiyildi` : `${item.name} yechildi`);
    } catch (err) {
      toast.error(err.message || 'Amalga oshmadi');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const equipped = items.filter(i => i.equipped);
  const tabItems = items.filter(i => i.category === activeTab);

  return (
    <div style={styles.page} className="stagger">
      <h1 style={styles.title}><Palette size={22} /> Maskotni sozlash</h1>

      <div style={styles.mascotPreview}>
        <div style={styles.mascotCircle}>🦊</div>
        <div style={styles.equippedRow}>
          {equipped.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Hech narsa kiyilmagan</span>}
          {equipped.map(item => (
            <span key={item.id} style={styles.equippedTag}>{item.icon} {item.name}</span>
          ))}
        </div>
      </div>

      <div style={styles.tabs}>
        {COSMETIC_TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ ...styles.tabBtn, ...(activeTab === t.key ? styles.tabActive : {}) }}>{t.label}</button>
        ))}
      </div>

      {tabItems.length === 0 ? (
        <EmptyState title="Buyum yo'q" subtitle="Bu kategoriyada mahsulotlar hali qo'shilmagan"
          actionText="Do'konga o'tish" onAction={() => navigate('/shop')} />
      ) : (
        <div style={styles.grid}>
          {tabItems.map(item => (
            <div key={item.id}
              style={{ ...styles.card, ...(item.equipped ? styles.cardEquipped : {}), opacity: item.owned ? 1 : 0.45 }}
              onClick={() => handleEquip(item)}>
              <div style={styles.itemIcon}>{item.icon}</div>
              <div style={styles.itemName}>{item.name}</div>
              {item.equipped && <div style={styles.equippedBadge}><Check size={12} /> Kiyilgan</div>}
              {!item.owned && <div style={styles.lockedBadge}>🔒 {item.price} tanga — do'kondan oling</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 },
  mascotPreview: { textAlign: 'center', padding: '24px 20px', background: 'linear-gradient(135deg, rgba(45,27,105,0.08), rgba(88,204,2,0.08))', borderRadius: 16 },
  mascotCircle: { fontSize: 72, marginBottom: 10 },
  equippedRow: { display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' },
  equippedTag: { padding: '4px 10px', borderRadius: 8, background: 'var(--bg-card)', fontSize: 11, fontWeight: 500, border: '1px solid var(--border-light)' },
  tabs: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  tabBtn: { padding: '6px 16px', borderRadius: 16, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' },
  tabActive: { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 },
  card: { background: 'var(--bg-card)', borderRadius: 14, padding: 16, textAlign: 'center', border: '1.5px solid var(--border-light)', cursor: 'pointer', transition: 'all 0.15s' },
  cardEquipped: { borderColor: 'var(--primary)', background: 'rgba(88,204,2,0.04)' },
  itemIcon: { fontSize: 32, marginBottom: 6 },
  itemName: { fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 },
  equippedBadge: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 10, color: 'var(--primary)', fontWeight: 700, marginTop: 4 },
  lockedBadge: { fontSize: 10, color: 'var(--text-light)', marginTop: 4 },
};
