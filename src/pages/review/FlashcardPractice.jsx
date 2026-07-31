import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFlashcardItems, submitReview } from '../../api/review';
import { getVocabularyById, getKanjiById } from '../../api/dictionary';
import { kanaToRomaji } from '../../utils/kana';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Loader, RotateCcw, Layers, BookOpen, BookMarked } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const TYPES = [
  { value: null, label: 'Barchasi', icon: Layers },
  { value: 0, label: "So'zlar", icon: BookOpen },
  { value: 1, label: 'Kanji', icon: BookMarked },
];

// Flashcard yo'nalishlari — old (prompt) va orqa (answer) tomonda qaysi maydon ko'rsatiladi.
// k=kana, e=ma'no, kj=kanji, r=romaji, kk=kanji+kana
const MODES = [
  { id: 'kana2en', prompt: 'k', answer: 'e', label: 'かな → Ma\'no' },
  { id: 'en2kana', prompt: 'e', answer: 'k', label: 'Ma\'no → かな' },
  { id: 'kanji2en', prompt: 'kj', answer: 'e', label: '漢字 → Ma\'no' },
  { id: 'romaji2en', prompt: 'r', answer: 'e', label: 'Rōmaji → Ma\'no' },
  { id: 'en2romaji', prompt: 'e', answer: 'r', label: 'Ma\'no → Rōmaji' },
  { id: 'kana2romaji', prompt: 'k', answer: 'r', label: 'かな → Rōmaji' },
  { id: 'kanjiKana2romaji', prompt: 'kk', answer: 'r', label: '漢字＋かな → Rōmaji' },
];

const isJp = (f) => f === 'k' || f === 'kj' || f === 'kk';

// Kartadan berilgan maydon matnini oladi (bo'sh bo'lsa mos zaxira maydon).
function fieldText(card, f) {
  switch (f) {
    case 'k': return card.kana || card.kanji;
    case 'e': return card.meaning;
    case 'kj': return card.kanji || card.kana;
    case 'r': return card.romaji || kanaToRomaji(card.kana);
    case 'kk': return card.kana && card.kana !== card.kanji ? `${card.kanji}（${card.kana}）` : card.kanji;
    default: return card.kanji;
  }
}

export default function FlashcardPractice() {
  const navigate = useNavigate();
  const [type, setType] = useState(null);
  const [mode, setMode] = useState(MODES[0]);
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
              const kana = (k.kunyomi || []).join('、');
              const firstKun = (k.kunyomi || [])[0] || (k.onyomi || [])[0] || '';
              return {
                ...item,
                kanji: k.character,
                kana,
                romaji: kanaToRomaji(firstKun.replace(/[.．・]/g, '')),
                meaning: (k.meaningsUz?.length ? k.meaningsUz : k.meanings || []).slice(0, 3).join(', '),
              };
            }
            const v = await getVocabularyById(item.itemId);
            return {
              ...item,
              kanji: v.word,
              kana: v.reading,
              romaji: v.romaji || kanaToRomaji(v.reading),
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
    const card = cards[current];
    // §12.2 — natijani backend SRS'ga yuboramiz (quality: bilaman=5, bilmayman=2).
    if (card?.itemId) {
      submitReview(card.itemId, card.itemType, knew ? 5 : 2).catch(() => {});
    }
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

  const card = cards[current];

  return (
    <div style={styles.page} className="stagger">
      <PageHeader
        icon={Layers}
        title="Flashcard Mashq"
        subtitle={cards.length > 0 && !finished ? `${current + 1}/${cards.length} karta` : undefined}
        accent="pink"
        size="sm"
        back
      />

      <div className="chip-row" style={{ width: '100%' }}>
        {TYPES.map(t => {
          const Icon = t.icon;
          const active = type === t.value;
          return (
            <button
              key={String(t.value)}
              className={`chip${active ? ' chip--active' : ''}`}
              onClick={() => setType(t.value)}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Yo'nalish (rejim) tanlash — 7 xil savol-javob turi */}
      <div style={styles.modeRow}>
        {MODES.map(m => (
          <button
            key={m.id}
            className={`chip jp${mode.id === m.id ? ' chip--active' : ''}`}
            onClick={() => { setMode(m); setFlipped(false); }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={styles.filterRow}>
        <div className="chip-row">
          {[null, 'N5', 'N4', 'N3', 'N2', 'N1'].map(lv => (
            <button
              key={lv || 'all'}
              className={`chip${level === lv ? ' chip--active' : ''}`}
              onClick={() => setLevel(lv)}
            >
              {lv || 'Barcha daraja'}
            </button>
          ))}
        </div>
        <button
          className={`chip${learnedOnly ? ' chip--active' : ''}`}
          onClick={() => setLearnedOnly(v => !v)}
        >
          {learnedOnly ? '✓ ' : ''}Faqat o'rganilgan
        </button>
      </div>

      {cards.length === 0 && !loading && (
        <EmptyState
          emoji="📚"
          title="Hali o'rganilgan so'zlar yo'q"
          subtitle="Darslarni tugatib, so'zlar o'rgangandan keyin flashcard mashq ochiladi"
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

      {!finished && card && (
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
                    {card.itemType === 'Kanji' ? '漢字' : '単語'}
                  </div>
                  <div style={styles.modeHint}>{mode.label}</div>
                  <div
                    style={{ ...styles.cardWord, ...(isJp(mode.prompt) ? {} : styles.cardWordLatin) }}
                    className={isJp(mode.prompt) ? 'jp' : ''}
                  >
                    {fieldText(card, mode.prompt)}
                  </div>
                  <div style={styles.tapHint}>Kartani bosing</div>
                </div>
              </div>
              <div className="flip-back" style={styles.cardFace}>
                <div style={styles.cardBack}>
                  <div style={styles.answerLabel}>Javob</div>
                  <div
                    style={{ ...styles.cardAnswer, ...(isJp(mode.answer) ? {} : styles.cardAnswerLatin) }}
                    className={`anim-pop${isJp(mode.answer) ? ' jp' : ''}`}
                  >
                    {fieldText(card, mode.answer)}
                  </div>
                  <div style={styles.supportBlock}>
                    <div style={styles.supWord} className="jp">{card.kanji}</div>
                    <div style={styles.supReading}>
                      {card.kana}{card.romaji ? ` · ${card.romaji}` : ''}
                    </div>
                    <div style={styles.supMeaning}>{card.meaning}</div>
                  </div>
                  {card.mastery && <div style={styles.masteryBadge}>{card.mastery}</div>}
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
  tab: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 10,
    border: '2px solid var(--border)',
    background: 'var(--bg)', color: 'var(--text-secondary)',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
  tabActive: {
    background: 'var(--primary)', color: 'white',
    border: '1px solid var(--primary)',
  },
  modeRow: {
    display: 'flex', gap: 6, width: '100%', overflowX: 'auto',
    paddingBottom: 4, scrollbarWidth: 'thin',
  },
  filterRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 10, width: '100%', flexWrap: 'wrap',
  },
  progressBg: { height: 4, background: 'var(--border-light)', borderRadius: 2, overflow: 'hidden', width: '100%' },
  progressFill: { height: '100%', background: 'var(--primary)', borderRadius: 2, transition: 'width 0.3s' },
  flashcard: { width: '100%', minHeight: 280, cursor: 'pointer' },
  flipInner: { width: '100%', minHeight: 280, position: 'relative' },
  cardFace: {
    background: 'var(--bg-card, white)', borderRadius: 20, padding: '40px 24px',
    boxShadow: 'var(--shadow-lg)', border: '2px solid var(--border)',
    textAlign: 'center', width: '100%', minHeight: 280,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cardFront: { textAlign: 'center', width: '100%' },
  cardBack: { textAlign: 'center', width: '100%' },
  cardWord: { fontSize: 48, fontWeight: 700, color: 'var(--text)', marginBottom: 8, wordBreak: 'break-word' },
  cardWordLatin: { fontSize: 30 },
  modeHint: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 8, marginBottom: 14,
    background: 'var(--secondary-soft)', color: 'var(--secondary-dark)',
    fontSize: 11, fontWeight: 800,
  },
  answerLabel: { fontSize: 11, fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  cardAnswer: {
    fontSize: 34, fontWeight: 800, color: 'var(--primary)', marginBottom: 16,
    background: 'var(--primary-soft)', padding: '8px 18px', borderRadius: 12,
    display: 'inline-block', wordBreak: 'break-word',
  },
  cardAnswerLatin: { fontSize: 26 },
  supportBlock: {
    borderTop: '1px dashed var(--border)', paddingTop: 12, marginTop: 4,
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  supWord: { fontSize: 24, fontWeight: 700, color: 'var(--text)' },
  supReading: { fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 },
  supMeaning: { fontSize: 13, color: 'var(--text-light)', marginTop: 2 },
  typeBadge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 6,
    background: 'var(--bg)', color: 'var(--text-light)',
    fontSize: 11, fontWeight: 600, marginBottom: 8,
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
    fontSize: 14, fontWeight: 600, border: '2px solid var(--border)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
};
