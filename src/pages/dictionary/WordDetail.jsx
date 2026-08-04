import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getVocabularyById } from '../../api/dictionary';
import { toggleSavedItem } from '../../api/profile';
import { pickAudio } from '../../utils/voice';
import { useToast } from '../../context/ToastContext';
import ErrorState from '../../components/ErrorState';
import { Button } from '../../components/ui';
import { Volume2, Bookmark, BookOpen, Loader } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const LEVEL_COLORS = {
  N5: { bg: 'var(--success-soft)', fg: 'var(--success-dark)', bd: 'var(--success)' },
  N4: { bg: 'var(--secondary-soft)', fg: 'var(--secondary-dark)', bd: 'var(--secondary)' },
  N3: { bg: 'var(--accent-soft)', fg: 'var(--accent-dark)', bd: 'var(--accent)' },
  N2: { bg: 'var(--warning-soft)', fg: 'var(--warning-dark)', bd: 'var(--warning)' },
  N1: { bg: 'var(--danger-soft)', fg: 'var(--danger-dark)', bd: 'var(--danger)' },
};

// 44-ekran: So'z Tafsiloti
export default function WordDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState(false);

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
    setPlaying(true);
    const done = () => setTimeout(() => setPlaying(false), 600);
    // Audio yo'q yoki 404 bo'lsa — brauzer TTS zaxirasiga tushamiz (bir marta).
    let handled = false;
    const speak = () => {
      if (handled) return;
      handled = true;
      if ('speechSynthesis' in window && word?.word) {
        const utter = new SpeechSynthesisUtterance(word.word);
        utter.lang = 'ja-JP';
        utter.onend = () => setPlaying(false);
        speechSynthesis.speak(utter);
      } else {
        done();
      }
    };
    const url = pickAudio(word);
    if (url) {
      const a = new Audio(url);
      a.onended = () => setPlaying(false);
      a.onerror = speak;          // fayl R2'da yo'q (404) → TTS
      a.play().catch(speak);
    } else {
      speak();
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
  const lvl = LEVEL_COLORS[word.level] || LEVEL_COLORS.N5;

  return (
    <div style={styles.page} className="stagger">
      <PageHeader
        icon={BookOpen}
        title="So'z tafsiloti"
        accent="purple"
        size="sm"
        back
        right={
          <button className="page-head__back" onClick={handleSave} aria-label="Saqlash">
            <Bookmark size={18} fill={saved ? '#fff' : 'none'} color="#fff" />
          </button>
        }
      />

      {/* Hero word card */}
      <div style={styles.heroCard} className="anim-scale-in">
        <div style={styles.heroBlob} />
        <div style={styles.word} className="jp">{word.word}</div>
        {word.reading && (
          <div style={styles.reading} className="jp">
            {word.reading}{word.romaji ? <span style={styles.romaji}> · {word.romaji}</span> : ''}
          </div>
        )}

        <button
          style={styles.audioBtn}
          className={`press${playing ? ' anim-pulse' : ''}`}
          onClick={playAudio}
          aria-label="Tinglash"
        >
          <Volume2 size={24} />
        </button>

        {meanings.length > 0 && (
          <div style={styles.heroMeaning}>{meanings.slice(0, 2).join(' · ')}</div>
        )}

        <div style={styles.badges}>
          {word.level && (
            <span style={{ ...styles.chip, background: lvl.bg, color: lvl.fg, borderColor: lvl.bd }}>{word.level}</span>
          )}
          {(word.wordTypeUz || word.wordType) && (
            <span style={styles.chip}>{word.wordTypeUz || word.wordType}</span>
          )}
          {word.isLearned && (
            <span style={{ ...styles.chip, background: 'var(--success-soft)', color: 'var(--success-dark)', borderColor: 'var(--success)' }}>✓ O'rganilgan</span>
          )}
        </div>
      </div>

      {/* Meanings */}
      {meanings.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}><BookOpen size={16} color="var(--primary)" /> Ma'nolari</h2>
          <div style={styles.meanings}>
            {meanings.map((m, i) => (
              <div key={i} style={styles.meaningItem} className="hover-scale">
                <span style={styles.meaningNum}>{i + 1}</span>
                <span style={styles.meaningText}>{m}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Used kanji (agar API bersa) */}
      {kanjiBreakdown.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Ishlatilgan kanji · <span className="jp">漢字</span></h2>
          <div style={styles.kanjiList}>
            {kanjiBreakdown.map((k, i) => (
              <div key={i} style={styles.kanjiRow} className="hover-scale">
                <span style={styles.kanjiChar} className="jp">{k.character || k.kanji}</span>
                <span style={styles.kanjiMeaning}>{k.reading ? `${k.reading} · ` : ''}{k.meaningUz || k.meaning}</span>
                {k.level && <span style={styles.kanjiLevel}>{k.level}</span>}
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
                {ex.reading && <div style={styles.exReading} className="jp">{ex.reading}</div>}
                <div style={styles.exUz}>{ex.sentenceUz || ex.sentenceEn}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save action */}
      <div style={styles.actions}>
        <Button variant={saved ? 'secondary' : 'primary'} size="lg" full onClick={handleSave}>
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saqlangan ✓' : 'Saqlash'}
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

  heroCard: {
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(160deg, var(--primary-soft), var(--bg-card) 72%)',
    borderRadius: 24, padding: '32px 24px 26px', border: '2px solid var(--border)',
    textAlign: 'center',
  },
  heroBlob: {
    position: 'absolute', top: -50, right: -40, width: 170, height: 170, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(88,204,2,0.16), transparent 70%)', pointerEvents: 'none',
  },
  word: { position: 'relative', fontSize: 58, fontWeight: 900, color: 'var(--text)', lineHeight: 1.08, marginBottom: 6, letterSpacing: 1 },
  reading: { position: 'relative', fontSize: 18, color: 'var(--primary-dark)', fontWeight: 800, marginBottom: 18 },
  romaji: { color: 'var(--text-light)', fontWeight: 700 },
  audioBtn: {
    position: 'relative', width: 56, height: 56, borderRadius: '50%',
    background: 'var(--primary)', color: '#fff', border: 'none',
    boxShadow: '0 4px 0 var(--primary-dark)', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 18,
  },
  heroMeaning: {
    position: 'relative', display: 'inline-block',
    background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 999,
    padding: '8px 18px', fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 14,
  },
  badges: { position: 'relative', display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  chip: { padding: '5px 14px', borderRadius: 999, background: 'var(--bg-alt)', border: '2px solid var(--border)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 800 },

  section: { background: 'var(--bg-card)', borderRadius: 18, padding: 20, border: '2px solid var(--border)' },
  sectionTitle: { fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 },

  meanings: { display: 'flex', flexDirection: 'column', gap: 8 },
  meaningItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-alt)', borderRadius: 12 },
  meaningNum: { width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', flexShrink: 0 },
  meaningText: { fontSize: 15, fontWeight: 700, color: 'var(--text)' },

  kanjiList: { display: 'flex', flexDirection: 'column', gap: 8 },
  kanjiRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-alt)', borderRadius: 12 },
  kanjiChar: { fontSize: 30, fontWeight: 800, color: 'var(--text)', width: 40, textAlign: 'center' },
  kanjiMeaning: { flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' },
  kanjiLevel: { padding: '3px 10px', borderRadius: 999, background: 'var(--secondary-soft)', color: 'var(--secondary-dark)', fontSize: 12, fontWeight: 800 },

  examples: { display: 'flex', flexDirection: 'column', gap: 10 },
  exCard: { padding: '14px 16px', background: 'var(--bg-alt)', borderRadius: 14, borderLeft: '4px solid var(--primary)' },
  exJp: { fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 4 },
  exReading: { fontSize: 12, color: 'var(--primary-dark)', fontWeight: 700, marginBottom: 4 },
  exUz: { fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' },

  actions: { display: 'flex', gap: 10, marginTop: 4, marginBottom: 8 },
};
