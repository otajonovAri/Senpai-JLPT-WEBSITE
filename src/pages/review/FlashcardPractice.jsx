import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFlashcardItems } from '../../api/review';
import { getVocabularyById, getKanjiById } from '../../api/dictionary';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { ArrowLeft, Loader, RotateCcw, Layers, BookOpen, BookMarked } from 'lucide-react';

const TYPES = [
  { value: null, label: 'Barchasi', icon: Layers },
  { value: 0, label: "So'zlar", icon: BookOpen },
  { value: 1, label: 'Kanji', icon: BookMarked },
];

export default function FlashcardPractice() {
  const navigate = useNavigate();
  const [type, setType] = useState(null);
  const [level, setLevel] = useState(null);         // JlptLevel nomi: null | 'N5'..'N1'
  const [learnedOnly, setLearnedOnly] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ known: 0, review: 0 });

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setCurrent(0);
    setFlipped(false);
    setStats({ known: 0, review: 0 });

    getFlashcardItems(type, 30, level, learnedOnly)
      .then(async (data) => {
        const items = data || [];
        if (items.length === 0) {
          setCards([]);
          setLoading(false);
          return;
        }
        const enriched = await Promise.all(items.map(async (item) => {
          try {
            if (item.itemType === 'Kanji') {
              const k = await getKanjiById(item.itemId);
              return {
                ...item,
                word: k.character,
                reading: (k.kunyomi || []).join('、'),
                meaning: (k.meaningsUz?.length ? k.meaningsUz : k.meanings || []).slice(0, 3).join(', '),
              };
            }
            const v = await getVocabularyById(item.itemId);
            return {
              ...item,
              word: v.word,
              reading: v.reading,
              meaning: (v.meaningsUz?.length ? v.meaningsUz : v.meanings || []).join(', '),
            };
          } catch {
            return null;
          }
        }));
        setCards(enriched.filter(Boolean));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [type, level, learnedOnly]);

  useEffect(() => { load(); }, [load]);

  const handleNext = (knew) => {
    setStats(prev => ({
      known: prev.known + (knew ? 1 : 0),
      review: prev.review + (knew ? 0 : 1),
    }));
    setFlipped(false);
    setCurrent(prev => prev + 1);
  };

  const finished = current >= cards.length && cards.length > 0;

  if (loading) {
    return (
      <div style={styles.center}>
        <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={() => load()} />;

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.header}>
        <button style={styles.backBtn} className="press" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <span style={styles.headerTitle}>Flashcard Mashq</span>
        {cards.length > 0 && !finished && (
          <span style={styles.counter}>{current + 1}/{cards.length}</span>
        )}
      </div>

      <div style={styles.tabs}>
        {TYPES.map(t => {
          const Icon = t.icon;
          const active = type === t.value;
          return (
            <button
              key={String(t.value)}
              style={{ ...styles.tab, ...(active ? styles.tabActive : {}) }}
              className="press"
              onClick={() => setType(t.value)}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={styles.filterRow}>
        <div style={styles.levelChips}>
          {[null, 'N5', 'N4', 'N3', 'N2', 'N1'].map(lv => (
            <button
              key={lv || 'all'}
              style={{ ...styles.levelChip, ...(level === lv ? styles.levelChipActive : {}) }}
              className="press"
              onClick={() => setLevel(lv)}
            >
              {lv || 'Barcha daraja'}
            </button>
          ))}
        </div>
        <button
          style={{ ...styles.learnedToggle, ...(learnedOnly ? styles.learnedToggleActive : {}) }}
          className="press"
          onClick={() => setLearnedOnly(v => !v)}
        >
          {learnedOnly ? '✓ ' : ''}Faqat o'rganilgan
        </button>
      </div>

      {cards.length === 0 && !loading && (
        <EmptyState
          emoji="📚"
          title="Hali o'rganilgan so'zlar yo'q"
          subtitle="Darslarni tugatib, so'zlar o'rganingdan keyin flashcard mashq ochiladi"
        />
      )}

      {finished && (
        <div style={styles.resultCard} className="anim-scale-in">
          <div style={{ fontSize: 56, marginBottom: 12 }} className="anim-bounce">🎴</div>
          <h2 style={styles.resultTitle} className="gradient-text">Mashq tugadi!</h2>
          <div style={styles.resultStats} className="stagger">
            <span style={{ color: 'var(--success)' }}>✓ {stats.known} bilaman</span>
            <span style={{ color: 'var(--danger)' }}>✗ {stats.review} takrorlash kerak</span>
          </div>
          <div style={styles.resultBtns}>
            <button style={styles.btnOutline} className="press" onClick={() => load()}>
              <RotateCcw size={16} /> Yana mashq
            </button>
            <button style={styles.btn} className="press" onClick={() => navigate('/review')}>
              SRS Takrorlash
            </button>
          </div>
        </div>
      )}

      {!finished && cards.length > 0 && (
        <>
          <div style={styles.progressBg}>
            <div style={{ ...styles.progressFill, width: `${((current + 1) / cards.length) * 100}%` }} />
          </div>

          <div
            style={styles.flashcard}
            className="flip-container"
            onClick={() => setFlipped(!flipped)}
          >
            <div style={styles.flipInner} className={`flip-card${flipped ? ' flipped' : ''}`}>
              <div className="flip-front" style={styles.cardFace}>
                <div style={styles.cardFront}>
                  <div style={styles.typeBadge}>
                    {cards[current].itemType === 'Kanji' ? '漢字' : '単語'}
                  </div>
                  <div style={styles.cardWord} className="jp">{cards[current].word}</div>
                  <div style={styles.cardReading}>{cards[current].reading}</div>
                  <div style={styles.tapHint}>Kartani bosing</div>
                </div>
              </div>
              <div className="flip-back" style={styles.cardFace}>
                <div style={styles.cardBack}>
                  <div style={styles.cardWord} className="jp">{cards[current].word}</div>
                  <div style={styles.cardMeaning} className="anim-pop">{cards[current].meaning}</div>
                  <div style={styles.cardReading}>{cards[current].reading}</div>
                  <div style={styles.masteryBadge}>{cards[current].mastery}</div>
                </div>
              </div>
            </div>
          </div>

          {flipped && (
            <div style={styles.actionBtns} className="stagger">
              <button
                style={{ ...styles.actionBtn, background: 'var(--danger)' }}
                className="press ripple"
                onClick={() => handleNext(false)}
              >
                Bilmayman
              </button>
              <button
                style={{ ...styles.actionBtn, background: 'var(--success)' }}
                className="press ripple"
                onClick={() => handleNext(true)}
              >
                Bilaman
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500, margin: '0 auto', alignItems: 'center' },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  header: { display: 'flex', alignItems: 'center', gap: 12, width: '100%' },
  backBtn: { background: 'none', color: 'var(--text-secondary)' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: 700, color: 'var(--text)' },
  counter: { fontSize: 13, fontWeight: 600, color: 'var(--text-light)' },
  tabs: { display: 'flex', gap: 8, width: '100%' },
  tab: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--bg)', color: 'var(--text-secondary)',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
  tabActive: {
    background: 'var(--primary)', color: 'white',
    border: '1px solid var(--primary)',
  },
  filterRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 10, width: '100%', flexWrap: 'wrap',
  },
  levelChips: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  levelChip: {
    padding: '6px 12px', borderRadius: 'var(--radius-full)',
    border: '2px solid var(--border)', background: 'var(--bg-alt)',
    color: 'var(--text-light)', fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
  },
  levelChipActive: {
    background: 'var(--primary-soft)', color: 'var(--primary-dark)', borderColor: 'var(--primary)',
  },
  learnedToggle: {
    padding: '6px 14px', borderRadius: 'var(--radius-full)',
    border: '2px solid var(--border)', background: 'var(--bg-alt)',
    color: 'var(--text-light)', fontSize: 12.5, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  learnedToggleActive: {
    background: 'var(--success-soft)', color: 'var(--success-dark)', borderColor: 'var(--success)',
  },
  progressBg: { height: 4, background: 'var(--border-light)', borderRadius: 2, overflow: 'hidden', width: '100%' },
  progressFill: { height: '100%', background: 'var(--primary)', borderRadius: 2, transition: 'width 0.3s' },
  flashcard: { width: '100%', minHeight: 280, cursor: 'pointer' },
  flipInner: { width: '100%', minHeight: 280, position: 'relative' },
  cardFace: {
    background: 'var(--bg-card, white)', borderRadius: 20, padding: '48px 24px',
    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)',
    textAlign: 'center', width: '100%', minHeight: 280,
  },
  cardFront: { textAlign: 'center' },
  cardBack: { textAlign: 'center' },
  cardWord: { fontSize: 48, fontWeight: 700, color: 'var(--text)', marginBottom: 8 },
  cardReading: { fontSize: 16, color: 'var(--text-light)' },
  cardMeaning: {
    fontSize: 22, fontWeight: 600, color: 'var(--primary)', marginBottom: 8,
    background: 'rgba(88,204,2,0.08)', padding: '6px 16px', borderRadius: 10,
    display: 'inline-block',
  },
  typeBadge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 6,
    background: 'var(--bg)', color: 'var(--text-light)',
    fontSize: 11, fontWeight: 600, marginBottom: 16,
    fontFamily: 'var(--font-jp)',
  },
  masteryBadge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 6,
    background: 'rgba(76,175,80,0.1)', color: 'var(--success)',
    fontSize: 11, fontWeight: 600, marginTop: 12,
  },
  tapHint: { fontSize: 13, color: 'var(--text-light)', marginTop: 20 },
  actionBtns: { display: 'flex', gap: 12, width: '100%' },
  actionBtn: {
    flex: 1, padding: '14px 8px', borderRadius: 12,
    color: 'white', fontSize: 14, fontWeight: 600,
    border: 'none', cursor: 'pointer',
  },
  resultCard: {
    textAlign: 'center', background: 'var(--bg-card, white)',
    borderRadius: 20, padding: 40, boxShadow: 'var(--shadow-lg)', width: '100%',
  },
  resultTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 16 },
  resultStats: { display: 'flex', justifyContent: 'center', gap: 24, fontSize: 15, fontWeight: 500, marginBottom: 24 },
  resultBtns: { display: 'flex', gap: 10 },
  btn: {
    flex: 1, padding: 14, borderRadius: 12,
    background: 'var(--primary)', color: 'white',
    fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
  },
  btnOutline: {
    flex: 1, padding: 14, borderRadius: 12,
    background: 'var(--bg)', color: 'var(--text)',
    fontSize: 14, fontWeight: 600, border: '1px solid var(--border)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
};
