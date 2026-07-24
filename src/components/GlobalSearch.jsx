import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchDictionary } from '../api/dictionary';
import { Search, X, BookOpen, Languages, Loader } from 'lucide-react';

export default function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults(null);
      return;
    }
    const timeout = setTimeout(() => {
      setLoading(true);
      searchDictionary(query.trim())
        .then(setResults)
        .catch(() => setResults(null))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (type, id) => {
    onClose();
    if (type === 'vocabulary') navigate(`/word/${id}`);
    else if (type === 'kanji') navigate(`/kanji/${id}`);
    else if (type === 'grammar') navigate(`/grammar/${id}`);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const vocab = results?.vocabulary || [];
  const kanji = results?.kanji || [];
  const grammar = results?.grammar || [];
  const hasResults = vocab.length > 0 || kanji.length > 0 || grammar.length > 0;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.searchBar}>
          <Search size={20} color="var(--text-light)" />
          <input
            ref={inputRef}
            style={styles.input}
            placeholder="So'z, kanji yoki grammatika qidiring..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {loading && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
          <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div style={styles.results}>
          {!results && !loading && (
            <div style={styles.hint}>Kamida 2 ta belgi kiriting</div>
          )}

          {results && !hasResults && (
            <div style={styles.hint}>Natija topilmadi</div>
          )}

          {vocab.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}><Languages size={14} /> So'zlar ({vocab.length})</div>
              {vocab.slice(0, 5).map(v => (
                <div key={v.id} style={styles.item} onClick={() => handleSelect('vocabulary', v.id)}>
                  <span style={styles.itemJp} className="jp">{v.word}</span>
                  <span style={styles.itemMeaning}>{v.reading} — {(v.meaningsUz || v.meanings || []).join(', ')}</span>
                </div>
              ))}
            </div>
          )}

          {kanji.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}><BookOpen size={14} /> Kanji ({kanji.length})</div>
              {kanji.slice(0, 5).map(k => (
                <div key={k.id} style={styles.item} onClick={() => handleSelect('kanji', k.id)}>
                  <span style={styles.itemJp} className="jp">{k.character}</span>
                  <span style={styles.itemMeaning}>{k.meanings?.join(', ')}</span>
                </div>
              ))}
            </div>
          )}

          {grammar.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Grammatika ({grammar.length})</div>
              {grammar.slice(0, 5).map(g => (
                <div key={g.id} style={styles.item} onClick={() => handleSelect('grammar', g.id)}>
                  <span style={styles.itemJp} className="jp">{g.title}</span>
                  <span style={styles.itemMeaning}>{g.level}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <kbd style={styles.kbd}>ESC</kbd> yopish
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80, zIndex: 9999 },
  modal: { background: 'var(--bg-card, white)', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' },
  searchBar: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid var(--border-light)' },
  input: { flex: 1, border: 'none', outline: 'none', fontSize: 16, background: 'transparent', color: 'var(--text)' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text-light)', padding: 4, cursor: 'pointer' },
  results: { flex: 1, overflowY: 'auto', padding: '8px 12px' },
  hint: { textAlign: 'center', padding: 24, fontSize: 13, color: 'var(--text-light)' },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', padding: '8px 6px 4px', display: 'flex', alignItems: 'center', gap: 6 },
  item: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' },
  itemJp: { fontSize: 18, fontWeight: 600, color: 'var(--text)', minWidth: 48 },
  itemMeaning: { fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  footer: { padding: '10px 18px', borderTop: '1px solid var(--border-light)', fontSize: 12, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 6 },
  kbd: { padding: '2px 6px', borderRadius: 4, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 11, fontFamily: 'monospace' },
};
