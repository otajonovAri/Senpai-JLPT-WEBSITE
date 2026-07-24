import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { generateExercises, submitExerciseResult } from '../../api/lessons';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { ArrowLeft, Check, X, Loader } from 'lucide-react';

export default function FillBlank() {
  const navigate = useNavigate();
  const { id } = useParams(); // lessonId
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const startRef = useRef(Date.now());

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // §11.1 — GET /exercises/generate/{lessonId}?type=FillInBlank
    generateExercises(id, 'FillInBlank', 10)
      .then(data => {
        const qs = (data?.questions || []).map(q => ({
          itemId: q.itemId,
          itemType: q.itemType,
          prompt: q.prompt,
          promptUz: q.promptUz,
          options: q.options || null,
          correctIndex: q.correctIndex,
          correctAnswer: q.correctAnswer,
        }));
        setQuestions(qs);
        startRef.current = Date.now();
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const q = questions[current];

  const isAnswerCorrect = () => {
    if (q.options) return selected === q.correctIndex;
    const norm = s => (s || '').trim().toLowerCase();
    return norm(typed) === norm(q.correctAnswer);
  };

  const handleCheck = () => {
    if (q.options ? selected === null : !typed.trim()) return;
    const correct = isAnswerCorrect();
    setLastCorrect(correct);
    setChecked(true);
    setAnswers(prev => [...prev, {
      itemId: q.itemId,
      itemType: q.itemType || 'Vocabulary',
      isCorrect: correct,
    }]);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      if (answers.some(a => a.itemId)) {
        // §11.2 — POST /exercises/result (exerciseType & itemType as STRINGS here)
        submitExerciseResult({
          lessonId: id,
          exerciseType: 'FillInBlank',
          answers: answers.filter(a => a.itemId),
          timeSpentSeconds: Math.max(1, Math.round((Date.now() - startRef.current) / 1000)),
        }).catch(() => {});
      }
    } else {
      setCurrent(current + 1);
      setSelected(null);
      setTyped('');
      setChecked(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (questions.length === 0) return <EmptyState title="Mashq topilmadi" subtitle="Bu dars uchun bo'sh joy to'ldirish mashqi mavjud emas" />;

  if (finished) {
    const score = answers.filter(a => a.isCorrect).length;
    return (
      <div style={styles.page} className="stagger">
        <div style={styles.resultCard}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✏️</div>
          <h2 style={styles.resultTitle}>Bo'sh joy to'ldirish tugadi!</h2>
          <div style={styles.resultScore}>{score}/{questions.length}</div>
          <button style={styles.btn} onClick={() => navigate(-1)}>Davom etish</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <span style={styles.headerTitle}>Bo'sh joy to'ldirish</span>
        <span style={styles.counter}>{current + 1}/{questions.length}</span>
      </div>
      <div style={styles.progressBg}><div className="progress-shine" style={{ ...styles.progressFill, width: `${((current + 1) / questions.length) * 100}%` }} /></div>

      <div style={styles.sentenceCard} className="anim-scale-in">
        <div style={styles.sentence} className="jp">{q.prompt}</div>
        <div style={styles.hint}>{q.promptUz || (q.options ? "To'g'ri so'zni tanlang" : "Javobni yozing")}</div>
      </div>

      {q.options ? (
        <div style={styles.options}>
          {q.options.map((opt, i) => {
            let bg = 'white';
            let border = 'var(--border)';
            if (checked && i === q.correctIndex) { bg = 'rgba(76,175,80,0.1)'; border = 'var(--success)'; }
            else if (checked && i === selected && i !== q.correctIndex) { bg = 'rgba(239,68,68,0.1)'; border = 'var(--danger)'; }
            else if (!checked && i === selected) { bg = 'rgba(88,204,2,0.06)'; border = 'var(--primary)'; }
            return (
              <button key={i} onClick={() => !checked && setSelected(i)}
                className="press"
                style={{ ...styles.optionBtn, background: bg, borderColor: border }}>
                <span className="jp" style={{ fontSize: 22, fontWeight: 600 }}>{opt}</span>
                {checked && i === q.correctIndex && <Check size={16} color="var(--success)" />}
                {checked && i === selected && i !== q.correctIndex && <X size={16} color="var(--danger)" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={styles.inputSection}>
          <input
            className="jp"
            style={{
              ...styles.answerInput,
              borderColor: checked ? (lastCorrect ? 'var(--success)' : 'var(--danger)') : 'var(--border)',
            }}
            value={typed}
            disabled={checked}
            onChange={e => setTyped(e.target.value)}
            onKeyDown={e => {
              if (e.key !== 'Enter') return;
              if (checked) handleNext(); else handleCheck();
            }}
            placeholder="Javobingizni yozing…"
            autoFocus
          />
          {checked && !lastCorrect && (
            <div style={styles.correctReveal}>
              To'g'ri javob: <span className="jp" style={{ fontWeight: 700 }}>{q.correctAnswer}</span>
            </div>
          )}
          {checked && lastCorrect && (
            <div style={{ ...styles.correctReveal, color: 'var(--success)' }}>✓ To'g'ri!</div>
          )}
        </div>
      )}

      {!checked ? (
        <button
          style={{ ...styles.btn, opacity: (q.options ? selected === null : !typed.trim()) ? 0.5 : 1 }}
          onClick={handleCheck}
          disabled={q.options ? selected === null : !typed.trim()}>
          Tekshirish
        </button>
      ) : (
        <button style={styles.btn} onClick={handleNext}>Keyingi</button>
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
  progressFill: { height: '100%', background: 'var(--primary)', borderRadius: 2, transition: 'width 0.3s' },
  sentenceCard: { textAlign: 'center', padding: '32px 20px', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-light)' },
  sentence: { fontSize: 26, fontWeight: 600, color: 'var(--text)', marginBottom: 8, letterSpacing: 1.5, lineHeight: 1.5 },
  hint: { fontSize: 13, color: 'var(--text-light)' },
  options: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  optionBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '16px', borderRadius: 14, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s' },
  inputSection: { display: 'flex', flexDirection: 'column', gap: 10 },
  answerInput: { padding: '16px 18px', borderRadius: 14, border: '1.5px solid var(--border)', fontSize: 20, fontWeight: 600, textAlign: 'center', outline: 'none', background: 'var(--bg-card)', color: 'var(--text)' },
  correctReveal: { textAlign: 'center', fontSize: 14, color: 'var(--danger)', fontWeight: 500 },
  btn: { padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600, border: 'none' },
  resultCard: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 20, padding: 40, boxShadow: 'var(--shadow-lg)' },
  resultTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 },
  resultScore: { fontSize: 40, fontWeight: 700, color: 'var(--primary)', marginBottom: 24 },
};
