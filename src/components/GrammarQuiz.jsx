import { useState, useRef, useCallback } from 'react';
import { Check, X, RefreshCw, Zap, GraduationCap, Loader } from 'lucide-react';
import { getGrammarList } from '../api/dictionary';
import { submitExerciseResult } from '../api/lessons';
import { GAME_LESSON_ID, buildGrammarQuestions, accuracyPercent } from '../utils/practice';

// Grammatika darsining mini testi.
// Savollar shu darsning o'z misollaridan quriladi; chalg'ituvchilar — bir xil
// darajadagi boshqa grammatika nomlari (faqat test boshlanganda yuklanadi).
// Savol qurish mantiqi UI'dan ajratilgan: utils/practice.js.
// Hisob/XP backendda: /exercises/result (itemType Grammar).

const REVEAL_MS = 900;

export default function GrammarQuiz({ grammar }) {
  const [phase, setPhase] = useState('idle');   // idle | loading | playing | done | unavailable
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null);

  const correctRef = useRef(0);
  const answersRef = useRef([]);
  const startRef = useRef(0);
  const lockRef = useRef(false);
  const siblingsRef = useRef(null);            // bir marta yuklanadi, keyin keshdan

  const begin = useCallback(async () => {
    setPhase('loading');
    try {
      if (siblingsRef.current === null) {
        const list = await getGrammarList(grammar.level);
        const items = list?.items || list || [];
        siblingsRef.current = items.map(g => g.title).filter(Boolean);
      }
      const built = buildGrammarQuestions(grammar, siblingsRef.current);
      if (built.length === 0) { setPhase('unavailable'); return; }

      correctRef.current = 0;
      answersRef.current = [];
      startRef.current = Date.now();
      lockRef.current = false;
      setQuestions(built);
      setIdx(0);
      setPicked(null);
      setResult(null);
      setPhase('playing');
    } catch {
      setPhase('unavailable');
    }
  }, [grammar]);

  const current = questions[idx];

  const choose = (option) => {
    if (lockRef.current || !current) return;
    lockRef.current = true;
    const isCorrect = option === current.answer;
    setPicked(option);

    answersRef.current.push({ itemId: grammar.id, itemType: 'Grammar', isCorrect });
    if (isCorrect) correctRef.current += 1;

    setTimeout(() => {
      lockRef.current = false;
      setPicked(null);
      if (idx + 1 >= questions.length) {
        const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
        submitExerciseResult({
          lessonId: GAME_LESSON_ID,
          exerciseType: 'MultipleChoice',
          answers: answersRef.current,
          timeSpentSeconds,
        })
          .then(res => setResult(res || {}))
          .catch(() => setResult({ localOnly: true }));
        setPhase('done');
      } else {
        setIdx(i => i + 1);
      }
    }, REVEAL_MS);
  };

  // Misol yo'q — testni umuman taklif qilmaymiz.
  if (!grammar?.examples?.length) return null;

  if (phase === 'idle' || phase === 'loading' || phase === 'unavailable') {
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}><GraduationCap size={18} /> Mini test</h2>
        {phase === 'unavailable' ? (
          <p style={styles.hint}>Bu daraja uchun test savollarini qurishga ma'lumot yetarli emas.</p>
        ) : (
          <>
            <p style={styles.hint}>Ushbu grammatikani misollar orqali tekshirib ko'ring.</p>
            <button style={styles.primaryBtn} className="press" onClick={begin} disabled={phase === 'loading'}>
              {phase === 'loading'
                ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                : <>Testni boshlash</>}
            </button>
          </>
        )}
      </div>
    );
  }

  if (phase === 'done') {
    const total = questions.length;
    const correct = correctRef.current;
    const pct = accuracyPercent(correct, total);
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}><GraduationCap size={18} /> Mini test</h2>
        <div style={styles.resultEmoji}>{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '🌱'}</div>
        <div style={styles.bigScore}>{correct}<span style={styles.scoreOf}>/{total}</span></div>
        <div style={styles.resultLabel}>To'g'ri javoblar · {pct}%</div>
        {result?.xpEarned > 0 && (
          <div style={styles.xpBadge}><Zap size={14} /> +{result.xpEarned} XP</div>
        )}
        {result?.localOnly && (
          <div style={styles.warn}>Natija saqlanmadi (server bilan aloqa yo'q)</div>
        )}
        <button style={styles.primaryBtn} className="press" onClick={begin}>
          <RefreshCw size={15} /> Qayta urinish
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div style={styles.section}>
      <div style={styles.quizHead}>
        <h2 style={styles.sectionTitle}><GraduationCap size={18} /> Mini test</h2>
        <span style={styles.counter}>{idx + 1} / {questions.length}</span>
      </div>
      <div style={styles.progressBg}>
        <div style={{ ...styles.progressFill, width: `${(idx / questions.length) * 100}%` }} />
      </div>

      <div style={styles.qCard}>
        <div style={styles.qSentence} className="jp">{current.sentence}</div>
        {current.meaning && <div style={styles.qMeaning}>{current.meaning}</div>}
      </div>
      <p style={styles.qHint}>
        {current.masked ? "Bo'sh joyga qaysi grammatika mos keladi?" : 'Bu gapda qaysi grammatika ishlatilgan?'}
      </p>

      <div style={styles.options}>
        {current.options.map(option => {
          const isAnswer = option === current.answer;
          const isPicked = picked === option;
          const revealed = picked !== null;
          return (
            <button
              key={option}
              className="press jp"
              style={{
                ...styles.option,
                ...(revealed && isAnswer ? styles.optionCorrect : {}),
                ...(revealed && isPicked && !isAnswer ? styles.optionWrong : {}),
              }}
              onClick={() => choose(option)}
              disabled={revealed}
            >
              <span style={{ flex: 1, textAlign: 'left' }}>{option}</span>
              {revealed && isAnswer && <Check size={16} color="var(--primary)" />}
              {revealed && isPicked && !isAnswer && <X size={16} color="var(--danger)" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  section: { background: 'var(--bg-card)', borderRadius: 16, padding: 20, border: '2px solid var(--border)' },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  quizHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  counter: { fontSize: 13, color: 'var(--text-light)', fontWeight: 700, marginBottom: 12 },
  hint: { fontSize: 13, color: 'var(--text-light)', fontWeight: 500, lineHeight: 1.5, marginBottom: 14 },
  primaryBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%',
    padding: '12px 20px', borderRadius: 'var(--radius-md)', background: 'var(--primary)',
    color: '#fff', fontSize: 14.5, fontWeight: 800, border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 0 var(--primary-dark)',
  },
  progressBg: { height: 6, background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 18 },
  progressFill: { height: '100%', background: 'var(--primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.35s' },
  qCard: { padding: '16px 18px', background: 'var(--bg)', borderRadius: 12, borderLeft: '3px solid var(--primary)' },
  qSentence: { fontSize: 20, fontWeight: 600, color: 'var(--text)', lineHeight: 1.6 },
  qMeaning: { fontSize: 13.5, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 6 },
  qHint: { fontSize: 12.5, color: 'var(--text-light)', fontWeight: 600, margin: '12px 0 14px' },
  options: { display: 'flex', flexDirection: 'column', gap: 8 },
  option: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '13px 16px',
    borderRadius: 'var(--radius-md)', background: 'var(--bg-alt)',
    borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--border)',
    color: 'var(--text)', fontSize: 15, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
  },
  optionCorrect: { borderColor: 'var(--primary)', background: 'var(--primary-soft)' },
  optionWrong: { borderColor: 'var(--danger)', background: 'rgba(255,75,75,0.08)' },
  resultEmoji: { fontSize: 44, textAlign: 'center' },
  bigScore: { fontSize: 50, fontWeight: 800, color: 'var(--primary)', textAlign: 'center', lineHeight: 1 },
  scoreOf: { fontSize: 26, color: 'var(--text-light)' },
  resultLabel: { textAlign: 'center', fontSize: 13.5, color: 'var(--text-light)', fontWeight: 600, marginBottom: 16 },
  xpBadge: {
    display: 'flex', width: 'fit-content', margin: '0 auto 16px', alignItems: 'center', gap: 5,
    padding: '6px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-soft)',
    color: 'var(--accent-dark)', fontSize: 14, fontWeight: 800,
  },
  warn: { fontSize: 12.5, color: 'var(--danger)', fontWeight: 700, textAlign: 'center', marginBottom: 12 },
};
