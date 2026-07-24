import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVocabularyById } from '../../api/dictionary';
import { toggleSavedItem } from '../../api/profile';
import { useToast } from '../../context/ToastContext';
import ErrorState from '../../components/ErrorState';
import { Button } from '../../components/ui';
import { ArrowLeft, Volume2, Bookmark, Loader } from 'lucide-react';

// 44-ekran: So'z Tafsiloti
export default function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getVocabularyById(id)
      .then(v => { setWord(v); setSaved(!!v?.isSaved); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const playAudio = () => {
    if (word?.audioUrl) {
      new Audio(word.audioUrl).play().catch(() => {});
    } else if ('speechSynthesis' in window && word?.word) {
      const utter = new SpeechSynthesisUtterance(word.word);
      utter.lang = 'ja-JP';
      speechSynthesis.speak(utter);
    }
  };

  const handleSave = async () => {
    try {
      // §5.8 — itemType raqam bilan ketadi (helper ichida)
      const res = await toggleSavedItem(word.id, 'Vocabulary');
      setSaved(!!res?.isSaved);
      toast.success(res?.isSaved ? "Saqlanganlarga qo'shildi" : "Saqlanganlardan olib tashlandi");
    } catch (err) {
      toast.error(err.message || 'Xatolik yuz berdi');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={26} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!word) return <ErrorState message="So'z topilmadi" />;

  const meanings = (word.meaningsUz?.length ? word.meaningsUz : word.meanings) || [];
  const kanjiBreakdown = word.kanjiBreakdown || word.usedKanji || [];

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.header}>
        <button style={styles.iconBtn} className="press" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h1 style={styles.title}>So'z tafsiloti</h1>
        <button style={{ ...styles.iconBtn, ...(saved ? styles.savedBtn : {}) }} className="press" onClick={handleSave}>
          <Bookmark size={18} fill={saved ? 'var(--accent)' : 'none'} color={saved ? 'var(--accent)' : 'currentColor'} />
        </button>
      </div>

      {/* Main word card */}
      <div style={styles.mainCard} className="anim-scale-in">
        <div style={styles.word} className="jp">{word.word}</div>
        <div style={styles.reading}>
          {word.reading && <span className="jp">{word.reading}</span>}
          {word.reading && word.romaji ? ' · ' : ''}
          {word.romaji}
        </div>
        {meanings.length > 0 && (
          <div style={styles.uzChip}>🇺🇿 {meanings.slice(0, 2).join(' · ')}</div>
        )}
        <div style={styles.badges}>
          {word.level && <span style={{ ...styles.chip, ...styles.chipLevel }}>{word.level}</span>}
          {(word.wordTypeUz || word.wordType) && (
            <span style={styles.chip}>{word.wordTypeUz || word.wordType}</span>
          )}
        </div>
      </div>

      {/* Used kanji (agar API bersa) */}
      {kanjiBreakdown.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Ishlatilgan kanji · <span className="jp">漢字</span></h2>
          <div style={styles.kanjiList}>
            {kanjiBreakdown.map((k, i) => (
              <div key={i} style={styles.kanjiRow}>
                <span style={styles.kanjiChar} className="jp">{k.character || k.kanji}</span>
                <span style={styles.kanjiMeaning}>{k.reading ? `${k.reading} · ` : ''}{k.meaningUz || k.meaning}</span>
                {k.level && <span style={styles.kanjiLevel}>{k.level}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meanings */}
      {meanings.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Ma'nolari</h2>
          <div style={styles.meanings}>
            {meanings.map((m, i) => (
              <div key={i} style={styles.meaningItem}>
                <span style={styles.meaningNum}>{i + 1}</span>
                <span style={styles.meaningText}>{m}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examples */}
      {word.examples?.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Misol gaplar · <span className="jp">例文</span></h2>
          <div style={styles.examples}>
            {word.examples.map((ex, i) => (
              <div key={i} style={styles.exCard}>
                <div style={styles.exJp} className="jp">{ex.sentenceJp}</div>
                {ex.reading && <div style={styles.exReading}>{ex.reading}</div>}
                <div style={styles.exUz}>{ex.sentenceUz || ex.sentenceEn}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky-ish actions */}
      <div style={styles.actions}>
        <Button variant="secondary" size="lg" full onClick={playAudio}>
          <Volume2 size={18} /> Tinglash
        </Button>
        <Button variant={saved ? 'primary' : 'purple'} size="lg" full onClick={handleSave}>
          <Bookmark size={18} /> {saved ? 'Saqlangan' : 'Saqlash'}
        </Button>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: 12 },
  iconBtn: { background: 'var(--bg-alt)', border: '2px solid var(--border)', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 },
  savedBtn: { borderColor: 'var(--accent)', color: 'var(--accent-dark)', background: 'var(--accent-soft)' },
  title: { flex: 1, fontSize: 20, fontWeight: 900, color: 'var(--text)' },
  mainCard: { background: 'var(--bg-card)', borderRadius: 22, padding: '32px 24px', border: '2px solid var(--border)', textAlign: 'center' },
  word: { fontSize: 56, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, marginBottom: 8 },
  reading: { fontSize: 17, color: 'var(--primary)', fontWeight: 800, marginBottom: 12 },
  uzChip: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--pink-soft)', color: 'var(--pink-dark)', border: '2px solid var(--pink)', borderRadius: 999, padding: '6px 14px', fontSize: 14, fontWeight: 800, marginBottom: 14 },
  badges: { display: 'flex', gap: 8, justifyContent: 'center' },
  chip: { padding: '5px 13px', borderRadius: 999, background: 'var(--bg-alt)', border: '2px solid var(--border)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 800 },
  chipLevel: { background: 'var(--secondary-soft)', borderColor: 'var(--secondary)', color: 'var(--secondary-dark)' },
  section: { background: 'var(--bg-card)', borderRadius: 18, padding: 20, border: '2px solid var(--border)' },
  sectionTitle: { fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 14 },
  kanjiList: { display: 'flex', flexDirection: 'column', gap: 8 },
  kanjiRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-alt)', borderRadius: 12 },
  kanjiChar: { fontSize: 30, fontWeight: 800, color: 'var(--text)', width: 40, textAlign: 'center' },
  kanjiMeaning: { flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' },
  kanjiLevel: { padding: '3px 10px', borderRadius: 999, background: 'var(--secondary-soft)', color: 'var(--secondary-dark)', fontSize: 12, fontWeight: 800 },
  meanings: { display: 'flex', flexDirection: 'column', gap: 8 },
  meaningItem: { display: 'flex', alignItems: 'center', gap: 10 },
  meaningNum: { width: 24, height: 24, borderRadius: 8, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: 'var(--primary-dark)', flexShrink: 0 },
  meaningText: { fontSize: 15, fontWeight: 700, color: 'var(--text)' },
  examples: { display: 'flex', flexDirection: 'column', gap: 10 },
  exCard: { padding: '14px 16px', background: 'var(--bg-alt)', borderRadius: 14, borderLeft: '4px solid var(--primary)' },
  exJp: { fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 4 },
  exReading: { fontSize: 12, color: 'var(--primary)', fontWeight: 700, marginBottom: 4 },
  exUz: { fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' },
  actions: { display: 'flex', gap: 10, marginTop: 4 },
};
