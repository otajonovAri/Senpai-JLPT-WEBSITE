import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGrammarList } from '../../api/dictionary';
import { submitExerciseResult } from '../../api/lessons';
import { GAME_LESSON_ID } from '../../utils/practice';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { ArrowLeft, Loader, Zap } from 'lucide-react';

// Grammatika viktorina — pattern ↔ ma'no (ko'p tanlovli). Yangi seed grammatikani mashq qildiradi.
// Hisob/XP backendda: session oxirida /exercises/result (itemType Grammar).
// O'yin darsga bog'liq emas. Server LessonId/ExerciseType'ni ishlatmaydi, validator faqat
// LessonId NotEmpty va ExerciseType whitelist talab qiladi.
const LEVELS = ['N5', 'N4', 'N3'];
const ROUND = 10;

const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const meaningOf = (g) => g.meaningUz || g.meaning || '';

function buildQuestion(item, pool) {
  const p2m = Math.random() < 0.5;
  if (p2m) {
    const correct = meaningOf(item);
    const distractors = shuffle(pool.filter(g => g.id !== item.id && meaningOf(g) && meaningOf(g) !== correct))
      .slice(0, 3).map(meaningOf);
    return { id: item.id, prompt: item.pattern, promptJp: true, correct, optionsJp: false, options: shuffle([correct, ...distractors]) };
  }
  const correct = item.pattern;
  const distractors = shuffle(pool.filter(g => g.id !== item.id && g.pattern && g.pattern !== correct))
    .slice(0, 3).map(g => g.pattern);
  return { id: item.id, prompt: meaningOf(item), promptJp: false, correct, optionsJp: true, options: shuffle([correct, ...distractors]) };
}

export default function GrammarGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('menu');   // menu | empty | playing | over
  const [level, setLevel] = useState('N5');
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const start = useCallback((lvl) => {
    setLoading(true);
    setError(null);
    getGrammarList(lvl)
      .then(list => {
        const pool = (list || []).filter(g => g.pattern && meaningOf(g));
        if (pool.length < 4) { setPhase('empty'); return; }
        const chosen = shuffle(pool).slice(0, ROUND);
        setQuestions(chosen.map(it => buildQuestion(it, pool)));
        setIdx(0); setPicked(null); setCorrectCount(0); setAnswers([]); setResult(null);
        setLevel(lvl); setPhase('playing');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const q = questions[idx];

  const choose = (opt) => {
    if (picked) return;
    const correct = opt === q.correct;
    setPicked(opt);
    if (correct) setCorrectCount(c => c + 1);
    setAnswers(a => [...a, { itemId: q.id, itemType: 'Grammar', isCorrect: correct }]);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      const answersFinal = answers;
      const timeSpentSeconds = Math.max(1, questions.length * 5);
      submitExerciseResult({ lessonId: GAME_LESSON_ID, exerciseType: 'MultipleChoice', answers: answersFinal, timeSpentSeconds })
        .then(res => setResult(res || null))
        .catch(() => setResult({ localOnly: true }));
      setPhase('over');
      return;
    }
    setIdx(i => i + 1);
    setPicked(null);
  };

  // ── Menu / empty ──
  if (phase === 'menu' || phase === 'empty') {
    return (
      <div style={styles.page} className="stagger">
        <div style={styles.header}>
          <button style={styles.backBtn} className="press" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <span style={styles.headerTitle}>Grammatika O'yin</span>
          <span style={{ width: 20 }} />
        </div>
        <div style={styles.menuCard} className="anim-scale-in">
          <div style={{ fontSize: 50 }}>📝</div>
          <h2 style={styles.menuTitle}>Grammatika Viktorina</h2>
          <p style={styles.menuSub}>Grammatika patternini ma'nosiga (yoki aksincha) moslang. To'g'ri variantni tanlang!</p>
          <div style={styles.levelRow}>
            {LEVELS.map(lv => (
              <button key={lv} className="press" style={{ ...styles.lvl, ...(level === lv ? styles.lvlActive : {}) }} onClick={() => setLevel(lv)}>{lv}</button>
            ))}
          </div>
          {phase === 'empty' && <EmptyState emoji="🗂️" title="Bu daraja uchun grammatika yetarli emas" subtitle="Boshqa darajani tanlang" />}
          <button style={styles.playBtn} className="press" onClick={() => start(level)} disabled={loading}>
            {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Boshlash'}
          </button>
          {error && <div style={styles.err}>{error}</div>}
        </div>
      </div>
    );
  }

  // ── Over ──
  if (phase === 'over') {
    const pct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
    return (
      <div style={styles.page} className="stagger">
        <div style={styles.resultCard} className="anim-scale-in">
          <div style={{ fontSize: 52 }} className="anim-bounce">{pct >= 80 ? '🎉' : '📚'}</div>
          <h2 style={styles.menuTitle}>O'yin tugadi!</h2>
          <div style={styles.bigScore}>{correctCount}/{questions.length}</div>
          <div style={styles.scoreLabel}>to'g'ri · {pct}%</div>
          {result?.xpEarned > 0 && <div style={styles.xpBadge}><Zap size={14} /> +{result.xpEarned} XP</div>}
          {result?.localOnly && <div style={styles.err}>Natija saqlanmadi (server bilan aloqa yo'q)</div>}
          <div style={styles.resultBtns}>
            <button style={styles.secBtn} className="press" onClick={() => setPhase('menu')}>Menyu</button>
            <button style={styles.playBtn} className="press" onClick={() => start(level)}>Yana</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div style={styles.center}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={() => start(level)} />;
  if (!q) return null;

  // ── Playing ──
  return (
    <div style={styles.page} className="stagger">
      <div style={styles.hud}>
        <button style={styles.backBtn} className="press" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <div style={styles.progressBg}><div style={{ ...styles.progressFill, width: `${((idx + (picked ? 1 : 0)) / questions.length) * 100}%` }} /></div>
        <span style={styles.counter}>{idx + 1}/{questions.length}</span>
      </div>

      <div style={styles.card}>
        <div style={styles.prompt}>{q.promptJp ? "Bu grammatika nimani bildiradi?" : "Qaysi pattern mos keladi?"}</div>
        <div style={{ ...styles.promptText, ...(q.promptJp ? styles.promptJp : {}) }} className={q.promptJp ? 'jp' : ''}>{q.prompt}</div>
      </div>

      <div style={styles.options}>
        {q.options.map((opt, i) => {
          let s = { ...styles.option };
          if (picked) {
            if (opt === q.correct) s = { ...s, ...styles.optCorrect };
            else if (opt === picked) s = { ...s, ...styles.optWrong };
            else s = { ...s, ...styles.optDim };
          }
          return (
            <button key={i} className="press" style={{ ...s, ...(q.optionsJp ? styles.optJp : {}) }}
              onClick={() => choose(opt)} disabled={!!picked}>
              <span className={q.optionsJp ? 'jp' : ''}>{opt}</span>
            </button>
          );
        })}
      </div>

      {picked && (
        <button style={styles.playBtn} className="press" onClick={next}>
          {idx + 1 >= questions.length ? 'Yakunlash' : 'Keyingi →'}
        </button>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 500, margin: '0 auto' },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  header: { display: 'flex', alignItems: 'center', gap: 10 },
  backBtn: { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 800, color: 'var(--text)' },
  menuCard: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-lg)', border: '2px solid var(--border)' },
  menuTitle: { fontSize: 22, fontWeight: 900, color: 'var(--text)', margin: '8px 0' },
  menuSub: { fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 20, lineHeight: 1.5 },
  levelRow: { display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' },
  lvl: { padding: '8px 18px', borderRadius: 'var(--radius-full)', border: '2px solid var(--border)', background: 'var(--bg-alt)', color: 'var(--text-light)', fontSize: 14, fontWeight: 800, cursor: 'pointer' },
  lvlActive: { background: 'var(--primary-soft)', color: 'var(--primary-dark)', borderColor: 'var(--primary)' },
  playBtn: { width: '100%', padding: '14px 24px', borderRadius: 16, background: 'var(--primary)', color: '#fff', fontSize: 15, fontWeight: 800, border: 'none', boxShadow: '0 4px 0 var(--primary-dark)', cursor: 'pointer' },
  secBtn: { flex: 1, padding: '14px 24px', borderRadius: 16, background: 'var(--bg-alt)', color: 'var(--text)', fontSize: 15, fontWeight: 700, border: '2px solid var(--border)', cursor: 'pointer' },
  err: { marginTop: 14, fontSize: 13, color: 'var(--danger)', fontWeight: 600 },
  hud: { display: 'flex', alignItems: 'center', gap: 12 },
  progressBg: { flex: 1, height: 8, background: 'var(--border-light)', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--primary)', borderRadius: 999, transition: 'width 0.3s' },
  counter: { fontSize: 13, fontWeight: 700, color: 'var(--text-light)' },
  card: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 22, padding: '30px 20px', boxShadow: 'var(--shadow)', border: '2px solid var(--border-light)' },
  prompt: { fontSize: 12, fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  promptText: { fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 },
  promptJp: { fontSize: 34, fontWeight: 900 },
  options: { display: 'flex', flexDirection: 'column', gap: 10 },
  option: { padding: '15px 18px', borderRadius: 14, border: '2px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 15, fontWeight: 700, cursor: 'pointer', textAlign: 'left' },
  optJp: { fontSize: 20, fontWeight: 800, textAlign: 'center' },
  optCorrect: { borderColor: 'var(--success)', background: 'var(--success-soft)', color: 'var(--success-dark)' },
  optWrong: { borderColor: 'var(--danger)', background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)' },
  optDim: { opacity: 0.5 },
  resultCard: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 24, padding: 36, boxShadow: 'var(--shadow-lg)', border: '2px solid var(--border)' },
  bigScore: { fontSize: 52, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 },
  scoreLabel: { fontSize: 14, color: 'var(--text-light)', fontWeight: 700, marginBottom: 16 },
  xpBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 16px', borderRadius: 12, background: 'color-mix(in srgb, var(--purple) 14%, transparent)', color: 'var(--purple-dark)', fontSize: 14, fontWeight: 800, marginBottom: 18 },
  resultBtns: { display: 'flex', gap: 10, marginTop: 8 },
};
