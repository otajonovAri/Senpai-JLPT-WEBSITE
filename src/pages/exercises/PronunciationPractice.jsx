import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchVocabulary } from '../../api/dictionary';
import ErrorState from '../../components/ErrorState';
import { Pill } from '../../components/ui';
import PronunciationSession from './PronunciationSession';
import { Mic, Loader, ChevronRight } from 'lucide-react';

const LEVELS = [
  { id: 'N5', label: 'N5', sub: 'Boshlang\'ich', color: 'var(--success)' },
  { id: 'N4', label: 'N4', sub: 'Asosiy', color: 'var(--secondary)' },
  { id: 'N3', label: 'N3', sub: "O'rta", color: 'var(--primary)' },
  { id: 'N2', label: 'N2', sub: 'Yuqori', color: 'var(--warning)' },
  { id: 'N1', label: 'N1', sub: 'Ilg\'or', color: 'var(--danger)' },
];

// Fisher–Yates aralashtirish
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mustaqil "Talaffuz mashqi" markazi — darajа bo'yicha so'zlarni yuklab mashq qildiradi.
// Duolingo'даги "Practice" bo'limiga o'xshaydi (navbar'da Mic ikonasi bilan).
export default function PronunciationPractice() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);

  const startLevel = useCallback((lvl) => {
    setLevel(lvl);
    setLoading(true);
    setError(null);
    setStarted(false);
    searchVocabulary({ level: lvl, page: 1, pageSize: 40 })
      .then(data => {
        const items = data?.items || [];
        const mapped = items
          .filter(v => v.word)
          .map(v => ({
            vocabularyId: v.id,
            jp: v.word,
            reading: v.reading || v.romaji || '',
            uz: (v.meaningsUz?.length ? v.meaningsUz : v.meanings || []).slice(0, 3).join(', '),
            audioUrl: v.audioUrl,
          }));
        const picked = shuffle(mapped).slice(0, 10);
        if (picked.length === 0) {
          setError('Bu daraja uchun so\'z topilmadi');
        } else {
          setWords(picked);
          setStarted(true);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const exit = () => { setStarted(false); setWords([]); setLevel(null); setError(null); };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={26} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} /></div>;
  }

  if (error && !started) {
    return <ErrorState message={error} onRetry={() => level ? startLevel(level) : exit()} />;
  }

  if (started && words.length > 0) {
    return (
      <PronunciationSession
        words={words}
        badge={<Pill tone="purple">{level}</Pill>}
        onExit={exit}
        onRestart={() => startLevel(level)}
      />
    );
  }

  // Level picker (hub)
  return (
    <div style={styles.page} className="stagger">
      <div style={styles.hero}>
        <div>
          <img src="/mascot/microphone.png" style={{ width: 80, height: 80, objectFit: 'contain' }} />
        </div>
        <h1 style={styles.heroTitle}>Talaffuz mashqi</h1>
        <p style={styles.heroSub}>Darajani tanlang va yapon so'zlari talaffuzini mikrofon orqali mashq qiling. Har bo'g'in aniqligini ko'rasiz.</p>
      </div>

      <div style={styles.levelLabel}>Darajani tanlang</div>
      <div style={styles.levels}>
        {LEVELS.map(l => (
          <button key={l.id} style={styles.levelCard} className="card--tappable press" onClick={() => startLevel(l.id)}>
            <div style={{ ...styles.levelBadge, background: l.color }}>{l.label}</div>
            <div style={styles.levelInfo}>
              <div style={styles.levelName}>{l.label} darajа</div>
              <div style={styles.levelSub}>{l.sub}</div>
            </div>
            <ChevronRight size={20} color="var(--text-light)" />
          </button>
        ))}
      </div>

      <button style={styles.backLink} className="press" onClick={() => navigate('/dashboard')}>
        Bosh sahifaga qaytish
      </button>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560, margin: '0 auto' },
  hero: { textAlign: 'center', padding: '12px 12px 4px' },
  heroIcon: {
    width: 80, height: 80, borderRadius: 24, margin: '0 auto 16px',
    background: 'linear-gradient(150deg, var(--primary-light), var(--primary))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 6px 0 var(--primary-dark)',
  },
  heroTitle: { fontSize: 28, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 8 },
  heroSub: { fontSize: 15, color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.5, maxWidth: 420, margin: '0 auto' },
  levelLabel: { fontSize: 14, fontWeight: 900, color: 'var(--text-secondary)', marginTop: 8 },
  levels: { display: 'flex', flexDirection: 'column', gap: 10 },
  levelCard: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
    background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 16,
    cursor: 'pointer', textAlign: 'left', width: '100%',
  },
  levelBadge: {
    width: 46, height: 46, borderRadius: 14, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 900, flexShrink: 0,
  },
  levelInfo: { flex: 1 },
  levelName: { fontSize: 16, fontWeight: 800, color: 'var(--text)' },
  levelSub: { fontSize: 13, color: 'var(--text-light)', fontWeight: 700 },
  backLink: {
    background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 14,
    fontWeight: 800, cursor: 'pointer', padding: 8, marginTop: 4,
  },
};
