import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchKanji } from '../../api/dictionary';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Search, Loader } from 'lucide-react';

const PAGE_SIZE = 60;
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function KanjiList() {
  const navigate = useNavigate();
  const [level, setLevel] = useState('N5');
  const [query, setQuery] = useState('');
  const [kanjiItems, setKanjiItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const mapKanji = (k) => ({
    id: k.id,
    character: k.character,
    // O'zbekcha ma'no bo'lsa — o'sha; bo'lmasa inglizcha birinchi gloss
    // (N3–N1 hali tarjima qilinmagan — baribir KO'RSATILADI, §8.1)
    meaning: k.meaningsUz?.length ? k.meaningsUz[0] : (k.meanings?.[0] || ''),
    hasUz: !!k.meaningsUz?.length,
    level: k.level,
    strokeCount: k.strokeCount,
  });

  // §8.1 — GET /kanji?level=..&search=..&page=..&pageSize=.. (PagedResult)
  const load = useCallback((pageNum, append = false) => {
    if (append) setLoadingMore(true);
    else { setLoading(true); setError(null); }

    searchKanji({
      level: query ? undefined : level, // backend: search bo'lsa level e'tiborga olinmaydi
      search: query || undefined,
      page: pageNum,
      pageSize: PAGE_SIZE,
    })
      .then(data => {
        const items = (data?.items || []).map(mapKanji);
        setKanjiItems(prev => (append ? [...prev, ...items] : items));
        setTotalCount(data?.totalCount ?? items.length);
        setHasNext(!!data?.hasNext);
        setPage(pageNum);
      })
      .catch(err => setError(err.message))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }, [level, query]);

  // Daraja/qidiruv o'zgarsa — 1-sahifadan qayta yuklash (qidiruvda 400ms debounce)
  useEffect(() => {
    const timer = setTimeout(() => load(1, false), query ? 400 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={() => load(1, false)} />;

  return (
    <div style={styles.page} className="stagger">
      <h1 style={styles.title} className="anim-fade-up">Kanji</h1>
      <p style={styles.sub}>
        {query
          ? `"${query}" bo'yicha qidiruv — ${totalCount} ta natija`
          : `${level} darajasi — jami ${totalCount} ta kanji (${kanjiItems.length} tasi yuklandi)`}
      </p>

      <div style={styles.searchBar}>
        <Search size={18} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Kanji, o'qilishi yoki ma'nosi bo'yicha qidirish…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {!query && (
        <div style={styles.levels}>
          {LEVELS.map(lv => (
            <button key={lv} onClick={() => setLevel(lv)}
              className="press"
              style={{ ...styles.levelBtn, ...(level === lv ? styles.levelActive : {}) }}>
              {lv}
            </button>
          ))}
        </div>
      )}

      {kanjiItems.length === 0 ? (
        <EmptyState title="Kanji topilmadi"
          subtitle={query ? "Qidiruv bo'yicha natija yo'q" : "Bu darajada kanji yo'q"} />
      ) : (
        <>
          <div style={styles.grid} className="stagger-grid">
            {kanjiItems.map(kanji => (
              <div key={kanji.id} style={styles.card} className="card-interactive"
                onClick={() => navigate(`/kanji/${kanji.id}`)}>
                <div style={styles.character} className="jp">{kanji.character}</div>
                <div style={{ ...styles.meaning, ...(kanji.hasUz ? {} : styles.meaningEn) }}>
                  {kanji.meaning}
                </div>
                <div style={styles.cardMeta}>
                  <span style={styles.levelTag}>{kanji.level}</span>
                  <span style={styles.strokeTag}>{kanji.strokeCount} chiziq</span>
                </div>
              </div>
            ))}
          </div>

          {hasNext && (
            <button style={styles.loadMoreBtn} onClick={() => load(page + 1, true)} disabled={loadingMore}>
              {loadingMore
                ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                : `Yana yuklash (${kanjiItems.length}/${totalCount})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 14 },
  title: { fontSize: 28, fontWeight: 700, color: 'var(--text)' },
  sub: { fontSize: 14, color: 'var(--text-light)', marginTop: -6 },
  searchBar: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 14, color: 'var(--text-light)' },
  searchInput: {
    width: '100%', padding: '12px 14px 12px 44px',
    border: '1.5px solid var(--border)', borderRadius: 12,
    fontSize: 14, background: 'var(--bg-card)', outline: 'none',
  },
  levels: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  levelBtn: {
    padding: '6px 16px', borderRadius: 16, background: 'var(--bg)',
    border: '1px solid var(--border)', fontSize: 13, fontWeight: 500,
    color: 'var(--text-secondary)', cursor: 'pointer',
  },
  levelActive: { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
    gap: 10,
  },
  card: {
    background: 'var(--bg-card)', borderRadius: 14, padding: '14px 8px',
    textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s',
  },
  character: { fontSize: 38, fontWeight: 700, color: 'var(--text)', marginBottom: 4, lineHeight: 1.2 },
  meaning: { fontSize: 12, fontWeight: 500, color: 'var(--primary)', marginBottom: 8, minHeight: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  meaningEn: { color: 'var(--text-secondary)', fontStyle: 'italic' },
  cardMeta: { display: 'flex', justifyContent: 'center', gap: 6 },
  levelTag: { padding: '1px 7px', borderRadius: 8, background: 'rgba(33,150,243,0.1)', color: '#1565C0', fontSize: 10, fontWeight: 700 },
  strokeTag: { fontSize: 10, color: 'var(--text-light)' },
  loadMoreBtn: {
    alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 28px', borderRadius: 12, background: 'var(--bg-card)',
    border: '1.5px solid var(--primary)', color: 'var(--primary)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4,
  },
};
