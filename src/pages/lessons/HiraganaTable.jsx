import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getHiragana, getKatakana, getKanaById } from '../../api/dictionary';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import KanaQuiz from '../../components/KanaQuiz';
import { Volume2, Loader, Languages, GraduationCap } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function HiraganaTable() {
  const [tab, setTab] = useState('hiragana');
  const [mode, setMode] = useState('table');   // table | quiz
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const audioRef = useRef(null);

  // Testga uzatish uchun barcha qatorlardagi belgilarni tekislaymiz.
  const allCharacters = useMemo(
    () => rows.flatMap(row => row.characters || []),
    [rows]
  );

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // §7.1/7.2 — KanaListDto { type, rows: [{ rowGroup, characters: [{ id, character, romaji, order, strokeOrderUrl, audioUrl }] }] }
    (tab === 'hiragana' ? getHiragana() : getKatakana())
      .then(data => setRows(data?.rows || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const playAudio = (kana) => {
    audioRef.current?.pause();
    if (kana?.audioUrl) {
      const audio = new Audio(kana.audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {});
    } else if ('speechSynthesis' in window && kana?.character) {
      const utter = new SpeechSynthesisUtterance(kana.character);
      utter.lang = 'ja-JP';
      speechSynthesis.speak(utter);
    }
  };

  return (
    <div style={styles.page} className="stagger">
      <PageHeader
        icon={Languages}
        title={`${tab === 'hiragana' ? 'Hiragana' : 'Katakana'} jadvali`}
        subtitle="Yapon alifbosi"
        accent="pink"
      />

      <div style={styles.tabs}>
        <button onClick={() => { setTab('hiragana'); setMode('table'); }} className={`chip${tab === 'hiragana' ? ' chip--active' : ''}`}>
          <span className="jp">あ</span> Hiragana
        </button>
        <button onClick={() => { setTab('katakana'); setMode('table'); }} className={`chip${tab === 'katakana' ? ' chip--active' : ''}`}>
          <span className="jp">ア</span> Katakana
        </button>
        {mode === 'table' && allCharacters.length >= 2 && (
          <button onClick={() => setMode('quiz')} className="chip" style={styles.quizChip}>
            <GraduationCap size={15} /> Test
          </button>
        )}
      </div>

      {mode === 'quiz' ? (
        <KanaQuiz
          key={tab}
          characters={allCharacters}
          type={tab}
          onExit={() => setMode('table')}
        />
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState title="Kana topilmadi" subtitle="Backend'da kana belgilari hali qo'shilmagan" />
      ) : (
        <div style={styles.rowList}>
          {rows.map(row => (
            <div key={row.rowGroup} style={styles.rowBlock}>
              <div style={styles.rowLabel}>{row.rowGroup}</div>
              <div style={styles.rowGrid}>
                {row.characters.map(kana => (
                  <div key={kana.id} style={styles.cell}
                    onClick={() => {
                      setSelected(kana);
                      playAudio(kana);
                      // §7.3 — to'liq tafsilot (stroke order, audio) alohida endpointdan
                      getKanaById(kana.id).then(d => setSelected(s => (s?.id === kana.id ? d : s))).catch(() => {});
                    }}>
                    <div style={styles.cellChar} className="jp">{kana.character}</div>
                    <div style={styles.cellRomaji}>{kana.romaji}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalChar} className="jp">{selected.character}</div>
            <div style={styles.modalRomaji}>{selected.romaji}</div>
            <div style={styles.modalType}>{tab === 'hiragana' ? 'Hiragana' : 'Katakana'}</div>
            {selected.strokeOrderUrl && (
              <img src={selected.strokeOrderUrl} alt="Chizish tartibi" style={styles.strokeImg} />
            )}
            <div style={styles.modalBtns}>
              <button style={styles.audioBtn} onClick={() => playAudio(selected)}>
                <Volume2 size={16} /> Tinglash
              </button>
              <button style={styles.closeBtn} onClick={() => setSelected(null)}>Yopish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  title: { fontSize: 28, fontWeight: 700, color: 'var(--text)' },
  sub: { fontSize: 14, color: 'var(--text-light)', marginTop: -8 },
  tabs: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  quizChip: { marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 },
  tab: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: 'var(--bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' },
  tabActive: { background: 'var(--secondary)', color: 'white', borderColor: 'var(--secondary)' },
  rowList: { display: 'flex', flexDirection: 'column', gap: 12 },
  rowBlock: {},
  rowLabel: { fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  rowGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 },
  cell: { background: 'var(--bg-card)', borderRadius: 10, padding: '12px 4px', textAlign: 'center', cursor: 'pointer', border: '2px solid var(--border)', transition: 'transform 0.2s, box-shadow 0.2s' },
  cellChar: { fontSize: 28, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 },
  cellRomaji: { fontSize: 10, color: 'var(--text-light)', marginTop: 2 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 },
  modal: { background: 'var(--bg-card)', borderRadius: 24, padding: 32, maxWidth: 320, width: '100%', textAlign: 'center' },
  modalChar: { fontSize: 88, fontWeight: 700, color: 'var(--text)', lineHeight: 1 },
  modalRomaji: { fontSize: 24, fontWeight: 600, color: 'var(--primary)', marginTop: 8 },
  modalType: { fontSize: 13, color: 'var(--text-light)', marginTop: 4, marginBottom: 12 },
  strokeImg: { width: 120, height: 120, objectFit: 'contain', margin: '0 auto 12px', display: 'block' },
  modalBtns: { display: 'flex', gap: 8, justifyContent: 'center' },
  audioBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: 'rgba(88,204,2,0.06)', border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  closeBtn: { padding: '10px 24px', borderRadius: 10, background: 'var(--bg)', border: '2px solid var(--border)', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
};
