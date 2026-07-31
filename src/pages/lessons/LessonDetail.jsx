import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getLessonCards, submitCardResponse, completeLesson } from '../../api/lessons';
import { checkAchievements } from '../../api/gamification';
import { useToast } from '../../context/ToastContext';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { ArrowLeft, RotateCcw, Check, X, Loader } from 'lucide-react';

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [unknown, setUnknown] = useState([]);
  const [finished, setFinished] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const startRef = useRef(Date.now());       // lesson start (for timeSpentSeconds)
  const cardStartRef = useRef(Date.now());    // per-card (for responseTimeMs)

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getLessonCards(id)
      .then(data => {
        // §10.1 — response is LessonCardsDto { title, titleUz, cards: [...] }, not an array.
        const rawCards = data?.cards || (Array.isArray(data) ? data : []);
        const mapped = rawCards.map(c => ({
          id: c.itemId || c.id,
          itemType: c.itemType,
          word: c.word || '',
          reading: c.reading || '',
          meaningUz: Array.isArray(c.meaningsUz)
            ? c.meaningsUz.join(', ')
            : (c.meaningUz || ''),
          exampleSentence: c.exampleSentence || '',
          exampleMeaningUz: c.exampleMeaningUz || '',
        }));
        setCards(mapped);
        setLessonTitle(data?.titleUz || data?.title || 'Dars');
        startRef.current = Date.now();
        cardStartRef.current = Date.now();
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const recordResponse = (isKnown) => {
    const card = cards[currentCard];
    if (card?.id) {
      submitCardResponse({
        itemId: card.id,
        itemType: card.itemType ?? 'Vocabulary',
        known: isKnown,
        responseTimeMs: Date.now() - cardStartRef.current,
        userId: user?.id,
      }).catch(() => {});
    }
    cardStartRef.current = Date.now();
  };

  const handleKnow = () => {
    recordResponse(true);
    setKnown([...known, currentCard]);
    advance(known.length + 1);
  };

  const handleDontKnow = () => {
    recordResponse(false);
    setUnknown([...unknown, currentCard]);
    advance(known.length);
  };

  // correctCount = final number of "known" cards (incl. the one just answered).
  const advance = (correctCount) => {
    setFlipped(false);
    if (currentCard + 1 >= cards.length) {
      setFinished(true);
      // §10.3 — body { correctAnswers, totalAnswers, timeSpentSeconds }.
      completeLesson(id, {
        correctAnswers: correctCount,
        totalAnswers: cards.length,
        timeSpentSeconds: Math.max(1, Math.round((Date.now() - startRef.current) / 1000)),
      })
        .then(() => checkAchievements()) // §15.2 — yangi yutuqlarni tekshirish
        .then(newOnes => {
          (newOnes || []).forEach(a =>
            toast.success(`${a.iconEmoji || '🏆'} Yangi yutuq: ${a.nameUz || a.name}!`, 5000));
        })
        .catch(() => {});
    } else {
      setCurrentCard(currentCard + 1);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!cards.length) return <EmptyState title="Dars bo'sh" subtitle="Bu darsda kartalar topilmadi" />;

  const card = cards[currentCard];
  const total = cards.length;

  if (finished) {
    const score = Math.round((known.length / total) * 100);
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
    return (
      <div style={styles.page} className="stagger">
        <div style={styles.resultCard}>
          <div style={styles.resultEmoji}>
            {score >= 90 ? '🎉' : score >= 70 ? '👏' : score >= 50 ? '💪' : '📚'}
          </div>
          <h1 style={styles.resultTitle}>
            {score >= 90 ? 'Ajoyib!' : score >= 70 ? 'Yaxshi!' : score >= 50 ? 'Davom eting!' : 'Qayta urinib ko\'ring'}
          </h1>
          <div style={styles.resultScore}>{score}%</div>
          <div style={styles.resultStars}>
            {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
          </div>
          <div style={styles.resultStats}>
            <div style={styles.resultStat}>
              <span style={{ color: 'var(--success)' }}>✓ {known.length}</span> bilaman
            </div>
            <div style={styles.resultStat}>
              <span style={{ color: 'var(--danger)' }}>✗ {unknown.length}</span> bilmayman
            </div>
          </div>
          <div style={styles.resultRewards}>
            <span>+{score >= 50 ? 25 : 10} XP</span>
            <span>+{score >= 50 ? 15 : 5} Coin</span>
          </div>
          <div style={styles.resultBtns}>
            <button style={styles.retryBtn} onClick={() => {
              setCurrentCard(0); setFlipped(false);
              setKnown([]); setUnknown([]); setFinished(false);
            }}>
              <RotateCcw size={16} /> Qayta o'rganish
            </button>
            <button style={styles.continueBtn} onClick={() => navigate('/lessons')}>
              Davom etish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => navigate('/lessons')}>
          <ArrowLeft size={20} /> Orqaga
        </button>
        <div style={styles.progressInfo}>
          <span>{currentCard + 1} / {total}</span>
          <div style={styles.topProgress}>
            <div style={{ ...styles.topProgressBar, width: `${((currentCard + 1) / total) * 100}%` }} />
          </div>
        </div>
      </div>

      <h2 style={styles.lessonTitle}>{lessonTitle}</h2>

      <div style={styles.cardContainer} onClick={() => setFlipped(!flipped)}>
        <div style={{ ...styles.flashcard, ...(flipped ? styles.flashcardFlipped : {}) }}>
          {!flipped ? (
            <div style={styles.cardFront}>
              <div style={styles.cardWord} className="jp">{card.word}</div>
              <div style={styles.cardReading}>{card.reading}</div>
              <div style={styles.tapHint}>Kartani bosing</div>
            </div>
          ) : (
            <div style={styles.cardBack}>
              <div style={styles.cardWord} className="jp">{card.word}</div>
              <div style={styles.cardMeaning}>{card.meaningUz}</div>
              <div style={styles.cardReading}>{card.reading}</div>
              {card.exampleSentence && (
                <div style={styles.example}>
                  <div style={styles.exampleJp} className="jp">{card.exampleSentence}</div>
                  <div style={styles.exampleUz}>{card.exampleMeaningUz}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {flipped && (
        <div style={styles.actionBtns}>
          <button style={styles.dontKnowBtn} onClick={handleDontKnow}>
            <X size={20} /> Bilmayman
          </button>
          <button style={styles.knowBtn} onClick={handleKnow}>
            <Check size={20} /> Bilaman
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '0 auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6, background: 'none',
    color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
  },
  progressInfo: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 },
  topProgress: { width: 100, height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' },
  topProgressBar: { height: '100%', background: 'var(--primary)', borderRadius: 3, transition: 'width 0.3s' },
  lessonTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text)' },
  cardContainer: { width: '100%', cursor: 'pointer', perspective: 1000 },
  flashcard: {
    background: 'var(--bg-card)', borderRadius: 20, padding: '48px 32px',
    boxShadow: 'var(--shadow-lg)', border: '2px solid var(--border)',
    minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.3s',
  },
  flashcardFlipped: { background: 'linear-gradient(135deg, var(--primary-soft), var(--bg-card))' },
  cardFront: { textAlign: 'center' },
  cardBack: { textAlign: 'center', width: '100%' },
  cardWord: { fontSize: 56, fontWeight: 700, color: 'var(--text)', marginBottom: 12 },
  cardReading: { fontSize: 18, color: 'var(--text-light)', marginBottom: 8 },
  cardMeaning: {
    fontSize: 24, fontWeight: 600, color: 'var(--primary)', marginBottom: 8,
    background: 'rgba(88,204,2,0.08)', padding: '8px 20px', borderRadius: 10,
    display: 'inline-block',
  },
  tapHint: { fontSize: 13, color: 'var(--text-light)', marginTop: 20 },
  example: {
    marginTop: 20, padding: '14px 18px', background: 'var(--bg)',
    borderRadius: 10, borderLeft: '3px solid var(--primary)',
  },
  exampleJp: { fontSize: 16, fontWeight: 500, color: 'var(--text)', marginBottom: 4 },
  exampleUz: { fontSize: 14, color: 'var(--text-secondary)' },
  actionBtns: { display: 'flex', gap: 16, width: '100%', justifyContent: 'center' },
  dontKnowBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '14px 32px', borderRadius: 12, background: 'var(--bg-card)',
    border: '2px solid var(--danger)', color: 'var(--danger)',
    fontSize: 15, fontWeight: 600,
  },
  knowBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '14px 32px', borderRadius: 12,
    background: 'var(--success)', color: 'white',
    fontSize: 15, fontWeight: 600, border: 'none',
  },
  resultCard: {
    textAlign: 'center', background: 'var(--bg-card)', borderRadius: 20,
    padding: '40px 32px', boxShadow: 'var(--shadow-lg)', width: '100%', marginTop: 20,
  },
  resultEmoji: { fontSize: 64, marginBottom: 12 },
  resultTitle: { fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8 },
  resultScore: { fontSize: 48, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 },
  resultStars: { fontSize: 28, marginBottom: 16 },
  resultStats: { display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 },
  resultStat: { fontSize: 16, fontWeight: 500 },
  resultRewards: {
    display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24,
    fontSize: 14, fontWeight: 600, color: 'var(--accent)',
  },
  resultBtns: { display: 'flex', gap: 12, justifyContent: 'center' },
  retryBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '12px 24px',
    borderRadius: 10, background: 'var(--bg)', border: '2px solid var(--border)',
    fontSize: 14, fontWeight: 500, color: 'var(--text)',
  },
  continueBtn: {
    padding: '12px 24px', borderRadius: 10,
    background: 'var(--primary)', color: 'white',
    fontSize: 14, fontWeight: 600,
  },
};
