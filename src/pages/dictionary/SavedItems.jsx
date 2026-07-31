import { useState, useEffect, useCallback } from 'react';
import { getSavedItems, toggleSavedItem } from '../../api/profile';
import ErrorState from '../../components/ErrorState';
import { Bookmark, BookmarkX, Search, Loader } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function SavedItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // §5.7 — SavedItemDto: { itemId, itemType, word, meaningUz, savedAt }
    getSavedItems()
      .then(data => {
        const list = (data || []).map(s => ({
          id: s.itemId,
          itemType: s.itemType || 'Vocabulary',
          word: s.word || '',
          reading: '',
          meaningUz: s.meaningUz || '',
          type: s.itemType === 'Kanji' ? 'kanji' : s.itemType === 'Grammar' ? 'grammar' : 'word',
          savedAt: s.savedAt,
        }));
        setItems(list);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRemove = async (id) => {
    const item = items.find(i => i.id === id);
    try {
      await toggleSavedItem(id, item?.itemType || 'Vocabulary');
      setItems(items.filter(i => i.id !== id));
    } catch { /* o'chirishda xato — ro'yxat o'zgarmaydi */ }
  };

  const filtered = items.filter(i => {
    if (tab !== 'all' && i.type !== tab) return false;
    if (search && !i.word?.includes(search) && !i.meaningUz?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div style={styles.page} className="stagger">
      <PageHeader icon={Bookmark} title="Saqlangan" subtitle="Belgilab qo'ygan so'z va kanjilaringiz" accent="purple" />

      <div style={styles.searchBox}>
        <Search size={16} color="var(--text-light)" />
        <input style={styles.searchInput} placeholder="Qidirish..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={styles.tabs}>
        {[['all', 'Barchasi'], ['word', "So'zlar"], ['kanji', 'Kanji']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ ...styles.tabBtn, ...(tab === key ? styles.tabActive : {}) }}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <img src="/mascot/Empty_Shelf_Dragon-removebg-preview.png" alt="Empty" style={styles.emptyImg} />
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 12 }}>Saqlangan element yo'q</div>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map(item => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardLeft}>
                <div style={styles.wordJp} className="jp">{item.word}</div>
                <div style={styles.wordReading}>{item.reading}</div>
                <div style={styles.wordMeaning}>{item.meaningUz}</div>
              </div>
              <button style={styles.removeBtn} onClick={() => handleRemove(item.id)}>
                <BookmarkX size={18} color="var(--danger)" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 14 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 },
  searchBox: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-light)' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--text)' },
  tabs: { display: 'flex', gap: 6 },
  tabBtn: { padding: '6px 16px', borderRadius: 16, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' },
  tabActive: { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' },
  cardLeft: {},
  wordJp: { fontSize: 20, fontWeight: 600, color: 'var(--text)' },
  wordReading: { fontSize: 12, color: 'var(--text-light)' },
  wordMeaning: { fontSize: 13, fontWeight: 500, color: 'var(--primary)', marginTop: 2 },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 6 },
  empty: { textAlign: 'center', padding: 40, color: 'var(--text-light)' },
  emptyImg: { width: 100, height: 100, objectFit: 'contain', marginBottom: 12 },
};
