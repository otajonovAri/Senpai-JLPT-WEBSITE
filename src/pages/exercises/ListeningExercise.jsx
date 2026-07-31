import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { generateExercises, submitExerciseResult } from '../../api/lessons';
import ErrorState from '../../components/ErrorState';
import { ArrowLeft, Volume2, Check, X, Loader } from 'lucide-react';

export default function ListeningExercise() {
  const navigate = useNavigate();
  const { id } = useParams(); // lessonId
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [playing, setPlaying] = useState(false);
  const startRef = useRef(Date.now());
  const audioRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // §11.1 — GET /exercises/generate/{lessonId}?type=Listening
    generateExercises(id, 'Listening', 10)
      .then(data => {
        const qs = (data?.questions || []).map(q => ({
          itemId: q.itemId,
          itemType: q.itemType,
          prompt: q.prompt,
          options: q.options || [],
          correctIndex: q.correctIndex ?? 0,
          audioUrl: q.audioUrl,
        }));
        setQuestions(qs);
        startRef.current = Date.now();
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Yangi savol ochilganda audio avto-ijro
  useEffect(() => {
    const q = questions[current];
    if (q?.audioUrl) playAudio(q.audioUrl);
    return () => audioRef.current?.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, questions]);

  const playAudio = (url) => {
    if (!url) return;
    audioRef.current?.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlaying(true);
    audio.onended = () => setPlaying(false);
    audio.play().catch(() => setPlaying(false));
  };

  const q = questions[current];

  const handleCheck = () => {
    if (selected === null) return;
    setChecked(true);
    setAnswers(prev => [...prev, {
      itemId: q.itemId,
      itemType: q.itemType || 'Vocabulary',
      isCorrect: selected === q.correctIndex,
    }]);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      if (answers.some(a => a.itemId)) {
        submitExerciseResult({
          lessonId: id,
          exerciseType: 'Listening',
          answers: answers.filter(a => a.itemId),
          timeSpentSeconds: Math.max(1, Math.round((Date.now() - startRef.current) / 1000)),
        }).catch(() => {});
      }
    } else {
      setCurrent(current + 1);
      setSelected(null);
      setChecked(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  if (questions.length === 0) {
    return (
      <div style={styles.page} className="stagger">
        <div style={styles.resultCard}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎧</div>
          <h2 style={styles.resultTitle}>Bu dars uchun tinglash mashqi yo'q</h2>
          <button style={styles.btn} onClick={() => navigate(-1)}>Orqaga</button>
        </div>
      </div>
    );
  }

  if (finished) {
    const score = answers.filter(a => a.isCorrect).length;
    return (
      <div style={styles.page} className="stagger">
        <div style={styles.resultCard}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{score >= questions.length * 0.7 ? '🎧' : '📖'}</div>
          <h2 style={styles.resultTitle}>Tinglash mashqi tugadi!</h2>
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
        <span style={styles.headerTitle}>Tinglash mashqi</span>
        <span style={styles.counter}>{current + 1}/{questions.length}</span>
      </div>
      <div style={styles.progressBg}><div className="progress-shine" style={{ ...styles.progressFill, width: `${((current + 1) / questions.length) * 100}%` }} /></div>

      <div style={styles.audioCard} className="anim-scale-in">
        <button
          className="press"
          style={{ ...styles.playBtn, ...(playing ? { transform: 'scale(1.05)', boxShadow: '0 0 24px rgba(88,204,2,0.25)' } : {}) }}
          onClick={() => playAudio(q.audioUrl)}>
          <Volume2 size={32} color="var(--primary)" className={playing ? 'anim-pulse' : ''} />
        </button>
        <div style={styles.playLabel}>{q.audioUrl ? (playing ? 'Ijro etilmoqda…' : 'Qayta tinglash uchun bosing') : 'Bu savol uchun audio mavjud emas'}</div>
      </div>

      <div style={styles.question}>{q.prompt || 'Nima eshitdingiz?'}</div>

      <div style={styles.answers} className="stagger">
        {q.options.map((ans, i) => {
          let bg = 'white';
          let border = 'var(--border)';
          if (checked && i === q.correctIndex) { bg = 'rgba(76,175,80,0.1)'; border = 'var(--success)'; }
          else if (checked && i === selected && i !== q.correctIndex) { bg = 'rgba(239,68,68,0.1)'; border = 'var(--danger)'; }
          else if (!checked && i === selected) { bg = 'rgba(88,204,2,0.06)'; border = 'var(--primary)'; }
          return (
            <button key={i} onClick={() => !checked && setSelected(i)}
              className="press"
              style={{ ...styles.answerBtn, background: bg, borderColor: border }}>
              <span className="jp" style={styles.answerText}>{ans}</span>
              {checked && i === q.correctIndex && <Check size={18} color="var(--success)" />}
              {checked && i === selected && i !== q.correctIndex && <X size={18} color="var(--danger)" />}
            </button>
          );
        })}
      </div>

      {!checked ? (
        <button style={{ ...styles.btn, opacity: selected === null ? 0.5 : 1 }} className="press ripple" onClick={handleCheck} disabled={selected === null}>
          Tekshirish
        </button>
      ) : (
        <button style={styles.btn} className="press ripple anim-pop" onClick={handleNext}>Keyingi</button>
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
  audioCard: { textAlign: 'center', padding: '32px 20px', background: 'var(--bg-card)', borderRadius: 16, border: '2px solid var(--border)' },
  playBtn: { width: 72, height: 72, borderRadius: '50%', background: 'rgba(88,204,2,0.08)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', cursor: 'pointer', transition: 'all 0.2s' },
  playLabel: { fontSize: 13, color: 'var(--text-light)' },
  question: { fontSize: 16, fontWeight: 600, color: 'var(--text)', textAlign: 'center' },
  answers: { display: 'flex', flexDirection: 'column', gap: 8 },
  answerBtn: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, border: '1.5px solid', fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' },
  answerText: { fontSize: 20, fontWeight: 500 },
  btn: { padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', textAlign: 'center' },
  resultCard: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 20, padding: 40, boxShadow: 'var(--shadow-lg)' },
  resultTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 },
  resultScore: { fontSize: 40, fontWeight: 700, color: 'var(--primary)', marginBottom: 24 },
};
