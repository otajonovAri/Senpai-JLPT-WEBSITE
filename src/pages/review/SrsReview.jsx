import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDueReviews, submitReview } from '../../api/review';
import { getVocabularyById, getKanjiById } from '../../api/dictionary';
import ErrorState from '../../components/ErrorState';
import { Loader, AlertTriangle, Calendar, Layers, Star } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function SrsReview() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState([]);
  const [finished, setFinished] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // §12.1 — DueReviewDto faqat itemId/itemType beradi; so'z matnini alohida olamiz.
    getDueReviews()
      .then(async (data) => {
        const due = (data || []).slice(0, 20);
        const enriched = await Promise.all(due.map(async (r) => {
          const base = { id: r.itemId, itemType: r.itemType, word: '', reading: '', meaningUz: '' };
          try {
            if (r.itemType === 'Kanji') {
              const k = await getKanjiById(r.itemId);
              return { ...base, word: k.character, reading: (k.kunyomi || []).join('、'),
                meaningUz: (k.meaningsUz?.length ? k.meaningsUz : k.meanings || []).slice(0, 2).join(', ') };
            }
            const v = await getVocabularyById(r.itemId);
            return { ...base, word: v.word, reading: v.reading,
              meaningUz: (v.meaningsUz?.length ? v.meaningsUz : v.meanings || []).join(', ') };
          } catch {
            return null; // topilmagan element o'tkazib yuboriladi
          }
        }));
        setCards(enriched.filter(Boolean));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleResponse = (quality) => {
    const card = cards[current];
    if (card.id) {
      submitReview(card.id, card.itemType ?? 'Vocabulary', quality).catch(() => {});
    }
    setResults([...results, { quality }]);
    setFlipped(false);
    if (current + 1 >= cards.length) setFinished(true);
    else setCurrent(current + 1);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  if (cards.length === 0) {
    return (
      <div style={styles.page} className="anim-scale-in">
        <div style={styles.emptyCard}>
          <div style={{ fontSize: 64, marginBottom: 12 }} className="anim-bounce">
            <img src="/mascot/Dragon_Empty_Review_Box-removebg-preview.png" alt="Banner" style={styles.bannerImage} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }} className="anim-fade-up">Takrorlash kerak emas!</h2>
          <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Barcha so'zlar takrorlangan</p>
          <div className="chip-row" style={{ justifyContent: 'center', marginTop: 16 }}>
            <Link to="/review/weak-words" className="chip"><AlertTriangle size={14} /> Zaif so'zlar</Link>
            <Link to="/review/forecast" className="chip"><Calendar size={14} /> Prognoz</Link>
            <Link to="/review/flashcards" className="chip"><Layers size={14} /> Flashcard</Link>
          </div>
          <button style={styles.btn} className="press tappable" onClick={() => navigate('/dashboard')}>Bosh sahifaga</button>
        </div>
      </div>
    );
  }

  if (finished) {
    const good = results.filter(r => r.quality >= 3).length;
    return (
      <div style={styles.page} className="anim-scale-in">
        <div style={styles.resultCard}>
          <div style={{ fontSize: 56, marginBottom: 12 }} className="anim-bounce">🧠</div>
          <h2 style={styles.resultTitle} className="gradient-text">Takrorlash tugadi!</h2>
          <div style={styles.resultStats} className="stagger">
            <span style={{ color: 'var(--success)' }} className="anim-pop">✓ {good} bilaman</span>
            <span style={{ color: 'var(--danger)' }} className="anim-pop">✗ {results.length - good} takrorlash kerak</span>
          </div>
          <div className="chip-row" style={{ justifyContent: 'center', marginTop: 16 }}>
            <Link to="/review/weak-words" className="chip"><AlertTriangle size={14} /> Zaif so'zlar</Link>
            <Link to="/review/forecast" className="chip"><Calendar size={14} /> Prognoz</Link>
            <Link to="/review/flashcards" className="chip"><Layers size={14} /> Flashcard</Link>
          </div>
          <button style={styles.btn} className="press tappable" onClick={() => navigate('/dashboard')}>Bosh sahifaga</button>
        </div>
      </div>
    );
  }

  const card = cards[current];

  return (
    <div style={styles.page} className="stagger">
      <PageHeader
        icon={Star}
        title="SRS Takrorlash"
        subtitle={`${current + 1}/${cards.length} karta`}
        accent="pink"
        size="sm"
        back
      />
      <div className="chip-row" style={{ width: '100%' }}>
        <Link to="/review/weak-words" className="chip"><AlertTriangle size={14} /> Zaif so'zlar</Link>
        <Link to="/review/forecast" className="chip"><Calendar size={14} /> Prognoz</Link>
        <Link to="/review/flashcards" className="chip"><Layers size={14} /> Flashcard</Link>
      </div>
      <div className="progress progress--sm" style={{ width: '100%' }}>
        <i style={{ width: `${((current + 1) / cards.length) * 100}%` }} />
      </div>

      <div style={styles.flashcard} className="flip-container" onClick={() => setFlipped(!flipped)}>
        <div style={styles.flipInner} className={`flip-card${flipped ? ' flipped' : ''}`}>
          <div className="flip-front" style={styles.cardFace}>
            <div style={styles.cardFront}>
              <div style={styles.cardWord} className="jp">{card.word}</div>
              <div style={styles.cardReading}>{card.reading}</div>
              <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 20 }}>Kartani bosing</div>
            </div>
          </div>
          <div className="flip-back" style={styles.cardFace}>
            <div style={styles.cardBack}>
              <div style={styles.cardWord} className="jp">{card.word}</div>
              <div style={styles.cardMeaning} className="anim-pop">{card.meaningUz}</div>
              <div style={styles.cardReading}>{card.reading}</div>
            </div>
          </div>
        </div>
      </div>

      {flipped && (
        <div style={styles.qualityBtns} className="stagger">
          <button style={{ ...styles.qBtn, background: 'var(--danger)' }} className="press ripple" onClick={() => handleResponse(1)}>Unutdim</button>
          <button style={{ ...styles.qBtn, background: 'var(--accent)' }} className="press ripple" onClick={() => handleResponse(3)}>Qiyin</button>
          <button style={{ ...styles.qBtn, background: 'var(--info)' }} className="press ripple" onClick={() => handleResponse(4)}>Yaxshi</button>
          <button style={{ ...styles.qBtn, background: 'var(--success)' }} className="press ripple" onClick={() => handleResponse(5)}>Oson</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500, margin: '0 auto', alignItems: 'center' },
  progressBg: { height: 4, background: 'var(--border-light)', borderRadius: 2, overflow: 'hidden', width: '100%' },
  progressFill: { height: '100%', background: 'var(--primary)', borderRadius: 2, transition: 'width 0.3s' },
  flashcard: { width: '100%', minHeight: 280, cursor: 'pointer' },
  flipInner: { width: '100%', minHeight: 280, position: 'relative' },
  cardFace: { background: 'var(--bg-card)', borderRadius: 20, padding: '48px 24px', boxShadow: 'var(--shadow-lg)', border: '2px solid var(--border)', textAlign: 'center', width: '100%', minHeight: 280 },
  cardFront: { textAlign: 'center' },
  cardBack: { textAlign: 'center' },
  cardWord: { fontSize: 48, fontWeight: 700, color: 'var(--text)', marginBottom: 8 },
  cardReading: { fontSize: 16, color: 'var(--text-light)' },
  cardMeaning: { fontSize: 22, fontWeight: 600, color: 'var(--primary)', marginBottom: 8, background: 'rgba(88,204,2,0.08)', padding: '6px 16px', borderRadius: 10, display: 'inline-block' },
  qualityBtns: { display: 'flex', gap: 8, width: '100%' },
  qBtn: { flex: 1, padding: '12px 8px', borderRadius: 10, color: 'white', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' },
  emptyCard: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 20, padding: 40, boxShadow: 'var(--shadow-lg)' },
  resultCard: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 20, padding: 40, boxShadow: 'var(--shadow-lg)' },
  resultTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 16 },
  resultStats: { display: 'flex', justifyContent: 'center', gap: 24, fontSize: 15, fontWeight: 500, marginBottom: 24 },
  btn: { width: '100%', padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', marginTop: 16 },
  bannerImage: { width: 80, height: 80, objectFit: 'contain', marginBottom: 12 },
};
