import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { searchVocabulary } from '../../api/dictionary';
import { toggleSavedItem } from '../../api/profile';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Search, Bookmark, BookmarkCheck, Loader } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const PAGE_SIZE = 40;
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function Dictionary() {
  const navigate = useNavigate();
  const [level, setLevel] = useState('N5');
  const [query, setQuery] = useState('');
  const [words, setWords] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(new Set());

  const mapWord = (v) => ({
    id: v.id,
    word: v.word || '',
    reading: v.reading || '',
    meaningUz: Array.isArray(v.meaningsUz) && v.meaningsUz.length
      ? v.meaningsUz.join(', ')
      : (v.meanings || []).join(', '),
    hasUz: !!(v.meaningsUz?.length),
    level: v.level || 'N5',
    wordType: v.wordTypeUz || v.wordType || '',
    isLearned: !!v.isLearned,   // backend: Mastery >= Known
  });

  const load = useCallback((pageNum, append = false) => {
    if (append) setLoadingMore(true);
    else { setLoading(true); setError(null); }

    searchVocabulary({
      level: query ? undefined : level,
      search: query || undefined,
      page: pageNum,
      pageSize: PAGE_SIZE,
    })
      .then(data => {
        const items = (data?.items || []).map(mapWord);
        setWords(prev => (append ? [...prev, ...items] : items));
        setTotalCount(data?.totalCount ?? items.length);
        setHasNext(!!data?.hasNext);
        setPage(pageNum);
      })
      .catch(err => setError(err.message))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }, [level, query]);

  useEffect(() => {
    const timer = setTimeout(() => load(1, false), query ? 400 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);

  const handleToggleSave = async (id, e) => {
    e.stopPropagation();
    const newSaved = new Set(saved);
    if (newSaved.has(id)) newSaved.delete(id);
    else newSaved.add(id);
    setSaved(newSaved);
    toggleSavedItem(id, 'Vocabulary').catch(() => {});
  };

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
      <PageHeader
        icon={Search}
        title="Lug'at"
        subtitle="Yapon so'zlarini qidiring va saqlang"
        accent="purple"
        right={
          <Link to="/saved" className="page-head__back" style={{ width: 'auto', padding: '0 14px', gap: 6, fontSize: 13, fontWeight: 800 }}>
            <Bookmark size={16} /> Saqlangan
          </Link>
        }
      />
      <p style={styles.sub}>
        {query
          ? `"${query}" bo'yicha qidiruv — ${totalCount} ta natija`
          : `${level} darajasi — jami ${totalCount} ta so'z (${words.length} tasi yuklandi)`}
      </p>

      <div style={styles.searchBar}>
        <Search size={18} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="So'z, hiragana yoki ma'no bo'yicha qidirish…"
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

      {words.length === 0 ? (
        <EmptyState title="So'z topilmadi"
          subtitle={query ? "Qidiruv bo'yicha natija yo'q" : "Bu darajada so'z yo'q"} />
        ) 
        : 
      (
        <>
          <div style={styles.wordList} className="stagger">
            {words.map(word => (
              <div key={word.id} style={{ ...styles.wordCard, ...(word.isLearned ? styles.wordCardLearned : {}) }} className="card-interactive"
                onClick={() => navigate(`/word/${word.id}`)}>
                <div style={styles.wordMain}>
                  <div style={styles.wordJp} className="jp">{word.word}</div>
                  <div style={styles.wordReading}>{word.reading}</div>
                  <div style={{ ...styles.wordMeaning, ...(word.hasUz ? {} : styles.wordMeaningEn) }}>
                    {word.meaningUz}
                  </div>
                </div>
                <div style={styles.wordRight}>
                  {word.isLearned && <span style={styles.learnedTick} title="O'rganilgan">✓</span>}
                  <span style={styles.wordLevel}>{word.level}</span>
                  <span style={styles.wordType}>{word.wordType}</span>
                  <button style={styles.saveBtn} className="press" onClick={(e) => handleToggleSave(word.id, e)}>
                    {saved.has(word.id)
                      ? <BookmarkCheck size={18} color="var(--primary)" fill="var(--primary)" />
                      : <Bookmark size={18} color="var(--text-light)" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasNext && (
            <button style={styles.loadMoreBtn} onClick={() => load(page + 1, true)} disabled={loadingMore}>
              {loadingMore
                ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                : `Yana yuklash (${words.length}/${totalCount})`}
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
  wordList: { display: 'flex', flexDirection: 'column', gap: 8 },
  wordCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 18px', background: 'var(--bg-card)', borderRadius: 12,
    border: '1px solid var(--border-light)', cursor: 'pointer',
    borderLeft: '3px solid transparent',
  },
  wordCardLearned: {
    borderLeftColor: 'var(--success)',
    background: 'var(--success-soft)',
  },
  learnedTick: {
    width: 18, height: 18, borderRadius: '50%', background: 'var(--success)',
    color: '#fff', fontSize: 11, fontWeight: 900,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  wordMain: {},
  wordJp: { fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 2 },
  wordReading: { fontSize: 13, color: 'var(--text-light)' },
  wordMeaning: { fontSize: 14, fontWeight: 500, color: 'var(--primary)', marginTop: 2 },
  wordMeaningEn: { color: 'var(--text-secondary)', fontStyle: 'italic' },
  wordRight: { display: 'flex', alignItems: 'center', gap: 8 },
  wordLevel: {
    padding: '2px 8px', borderRadius: 8, background: 'rgba(33,150,243,0.1)',
    fontSize: 11, fontWeight: 600, color: 'var(--secondary-dark)',
  },
  wordType: { fontSize: 11, color: 'var(--text-light)' },
  saveBtn: { background: 'none', padding: 4 },
  loadMoreBtn: {
    alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 28px', borderRadius: 12, background: 'var(--bg-card)',
    border: '1.5px solid var(--primary)', color: 'var(--primary)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4,
  },
};
