import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { generateExercises, submitExerciseResult } from '../../api/lessons';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { ArrowLeft, Check, Loader } from 'lucide-react';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WordMatching() {
  const navigate = useNavigate();
  const { id } = useParams(); // lessonId
  const [pairs, setPairs] = useState([]);
  const [meta, setMeta] = useState(null); // { itemId, itemType } — natija yuborish uchun
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jpOrder, setJpOrder] = useState([]);
  const [uzOrder, setUzOrder] = useState([]);
  const [selectedJp, setSelectedJp] = useState(null);
  const [selectedUz, setSelectedUz] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [wrong, setWrong] = useState(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const startRef = useRef(Date.now());

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // §11.1 — type=Matching bitta savolda matchPairs: [{left, right}] qaytaradi.
    generateExercises(id, 'Matching', 10)
      .then(data => {
        const q = data?.questions?.[0];
        const apiPairs = (q?.matchPairs || []).map(p => ({ jp: p.left, uz: p.right }));
        if (apiPairs.length >= 2) {
          setMeta({ itemId: q.itemId, itemType: q.itemType || 'Vocabulary' });
        }
        initPairs(apiPairs);
        startRef.current = Date.now();
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const initPairs = (list) => {
    setPairs(list);
    setJpOrder(shuffle(list.map((p, i) => ({ ...p, idx: i }))));
    setUzOrder(shuffle(list.map((p, i) => ({ ...p, idx: i }))));
  };

  useEffect(() => {
    if (selectedJp !== null && selectedUz !== null) {
      if (selectedJp === selectedUz) {
        setMatched(prev => new Set([...prev, selectedJp]));
        setSelectedJp(null);
        setSelectedUz(null);
      } else {
        setWrongCount(c => c + 1);
        setWrong({ jp: selectedJp, uz: selectedUz });
        setTimeout(() => { setWrong(null); setSelectedJp(null); setSelectedUz(null); }, 600);
      }
    }
  }, [selectedJp, selectedUz]);

  const allMatched = pairs.length > 0 && matched.size === pairs.length;

  // Barcha juftlik topilganda natijani yuborish (bir marta)
  useEffect(() => {
    if (allMatched && !submitted && meta?.itemId) {
      setSubmitted(true);
      submitExerciseResult({
        lessonId: id,
        exerciseType: 'Matching',
        // Xatosiz (yoki kam xato bilan) topilsa to'g'ri hisoblanadi
        answers: [{ itemId: meta.itemId, itemType: meta.itemType, isCorrect: wrongCount <= Math.ceil(pairs.length / 2) }],
        timeSpentSeconds: Math.max(1, Math.round((Date.now() - startRef.current) / 1000)),
      }).catch(() => {});
    }
  }, [allMatched, submitted, id, meta, wrongCount, pairs.length]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (pairs.length < 2) return <EmptyState title="Mashq topilmadi" subtitle="Bu dars uchun juftlash mashqi mavjud emas" />;

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <span style={styles.headerTitle}>So'z juftlash</span>
        <span style={styles.counter}>{matched.size}/{pairs.length}</span>
      </div>
      <div style={styles.progressBg}><div className="progress-shine" style={{ ...styles.progressFill, width: `${pairs.length ? (matched.size / pairs.length) * 100 : 0}%` }} /></div>

      {allMatched ? (
        <div style={styles.resultCard}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎯</div>
          <h2 style={styles.resultTitle}>Barcha juftliklar topildi!</h2>
          {wrongCount > 0 && <div style={styles.wrongInfo}>{wrongCount} ta xato urinish</div>}
          <button style={styles.btn} onClick={() => navigate(-1)}>Davom etish</button>
        </div>
      ) : (
        <div style={styles.matchGrid}>
          <div style={styles.column}>
            <div style={styles.colLabel}>Yaponcha</div>
            {jpOrder.map(item => (
              <button key={item.idx} disabled={matched.has(item.idx)}
                className="press"
                onClick={() => setSelectedJp(item.idx)}
                style={{
                  ...styles.matchBtn,
                  ...(matched.has(item.idx) ? styles.matchedBtn : {}),
                  ...(selectedJp === item.idx ? styles.selectedBtn : {}),
                  ...(wrong?.jp === item.idx ? styles.wrongBtn : {}),
                }}>
                <span className="jp">{item.jp}</span>
                {matched.has(item.idx) && <Check size={14} color="var(--success)" />}
              </button>
            ))}
          </div>
          <div style={styles.column}>
            <div style={styles.colLabel}>O'zbekcha</div>
            {uzOrder.map(item => (
              <button key={item.idx} disabled={matched.has(item.idx)}
                className="press"
                onClick={() => setSelectedUz(item.idx)}
                style={{
                  ...styles.matchBtn,
                  ...(matched.has(item.idx) ? styles.matchedBtn : {}),
                  ...(selectedUz === item.idx ? styles.selectedBtn : {}),
                  ...(wrong?.uz === item.idx ? styles.wrongBtn : {}),
                }}>
                <span>{item.uz}</span>
                {matched.has(item.idx) && <Check size={14} color="var(--success)" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { background: 'none', color: 'var(--text-secondary)' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: 700, color: 'var(--text)' },
  counter: { fontSize: 13, fontWeight: 600, color: 'var(--text-light)' },
  progressBg: { height: 4, background: 'var(--border-light)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--success)', borderRadius: 2, transition: 'width 0.3s' },
  matchGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  column: { display: 'flex', flexDirection: 'column', gap: 8 },
  colLabel: { fontSize: 12, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  matchBtn: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px', borderRadius: 12, background: 'var(--bg-card)', border: '1.5px solid var(--border)', fontSize: 16, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' },
  selectedBtn: { borderColor: 'var(--primary)', background: 'rgba(88,204,2,0.06)' },
  matchedBtn: { opacity: 0.5, background: 'rgba(76,175,80,0.06)', borderColor: 'var(--success)' },
  wrongBtn: { borderColor: 'var(--danger)', background: 'rgba(239,68,68,0.08)', animation: 'pulse 0.3s' },
  resultCard: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 20, padding: 40, boxShadow: 'var(--shadow-lg)', marginTop: 20 },
  resultTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 12 },
  wrongInfo: { fontSize: 13, color: 'var(--text-light)', marginBottom: 16 },
  btn: { padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600, border: 'none' },
};
