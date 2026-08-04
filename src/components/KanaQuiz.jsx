import { useState, useMemo, useCallback, useRef } from 'react';
import { Check, X, RefreshCw, Zap, ArrowLeft } from 'lucide-react';
import { submitExerciseResult } from '../api/lessons';
import { GAME_LESSON_ID, shuffle, buildChoices, accuracyPercent } from '../utils/practice';

// Hiragana/Katakana ko'p variantli testi.
// Belgilar HiraganaTable'da allaqachon yuklangan — qayta so'rov yubormaymiz.
// Hisob/XP backendda: session oxirida /exercises/result (itemType Kana).

const QUESTION_COUNT = 10;
const OPTION_COUNT = 4;
const REVEAL_MS = 650;

/**
 * @param {{ id, character, romaji }[]} characters  Tekislangan kana ro'yxati
 * @param {'hiragana'|'katakana'} type
 * @param {() => void} onExit  Jadval ko'rinishiga qaytish
 */
export default function KanaQuiz({ characters = [], type = 'hiragana', onExit }) {
  const [direction, setDirection] = useState('toRomaji'); // toRomaji | toKana
  const [phase, setPhase] = useState('intro');            // intro | playing | done
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [wrong, setWrong] = useState([]);
  const [result, setResult] = useState(null);

  const correctRef = useRef(0);
  const answersRef = useRef([]);
  const startRef = useRef(0);
  const lockRef = useRef(false);

  const typeLabel = type === 'hiragana' ? 'Hiragana' : 'Katakana';

  // Testga yaroqli belgilar: ham yozuvi, ham romaji'si bo'lganlari.
  const pool = useMemo(
    () => characters.filter(k => k?.character && k?.romaji),
    [characters]
  );

  const build = useCallback((dir) => {
    const picks = shuffle(pool).slice(0, Math.min(QUESTION_COUNT, pool.length));
    return picks.map(kana => {
      const isToRomaji = dir === 'toRomaji';
      const answer = isToRomaji ? kana.romaji : kana.character;
      const distractorPool = pool
        .filter(k => k.id !== kana.id)
        .map(k => (isToRomaji ? k.romaji : k.character));
      return {
        kana,
        prompt: isToRomaji ? kana.character : kana.romaji,
        answer,
        options: buildChoices(answer, distractorPool, OPTION_COUNT),
      };
    });
  }, [pool]);

  const start = useCallback((dir) => {
    correctRef.current = 0;
    answersRef.current = [];
    startRef.current = Date.now();
    lockRef.current = false;
    setDirection(dir);
    setQuestions(build(dir));
    setIdx(0);
    setPicked(null);
    setWrong([]);
    setResult(null);
    setPhase('playing');
  }, [build]);

  const current = questions[idx];

  const choose = (option) => {
    if (lockRef.current || !current) return;
    lockRef.current = true;
    const isCorrect = option === current.answer;
    setPicked(option);

    answersRef.current.push({ itemId: current.kana.id, itemType: 'Kana', isCorrect });
    if (isCorrect) correctRef.current += 1;
    else setWrong(w => [...w, { ...current, picked: option }]);

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
          .catch(() => setResult({ localOnly: true }));  // natija saqlanmadi — UI baribir ko'rsatiladi
        setPhase('done');
      } else {
        setIdx(i => i + 1);
      }
    }, REVEAL_MS);
  };

  // Belgilar yetarli emas — testni taklif qilmaymiz.
  if (pool.length < 2) return null;

  // ── Boshlash ──
  if (phase === 'intro') {
    return (
      <div style={styles.card}>
        <div style={styles.introIcon} className="jp">{type === 'hiragana' ? 'あ' : 'ア'}</div>
        <h2 style={styles.title}>{typeLabel} testi</h2>
        <p style={styles.sub}>
          {Math.min(QUESTION_COUNT, pool.length)} ta savol · {OPTION_COUNT} variantdan bittasini tanlang
        </p>
        <div style={styles.dirRow}>
          <button
            className={`chip${direction === 'toRomaji' ? ' chip--active' : ''}`}
            onClick={() => setDirection('toRomaji')}
          >
            <span className="jp">{type === 'hiragana' ? 'あ' : 'ア'}</span> → romaji
          </button>
          <button
            className={`chip${direction === 'toKana' ? ' chip--active' : ''}`}
            onClick={() => setDirection('toKana')}
          >
            romaji → <span className="jp">{type === 'hiragana' ? 'あ' : 'ア'}</span>
          </button>
        </div>
        <button style={styles.primaryBtn} className="press" onClick={() => start(direction)}>
          Boshlash
        </button>
        {onExit && (
          <button style={styles.textBtn} className="press" onClick={onExit}>
            Jadvalga qaytish
          </button>
        )}
      </div>
    );
  }

  // ── Natija ──
  if (phase === 'done') {
    const total = questions.length;
    const correct = correctRef.current;
    const pct = accuracyPercent(correct, total);
    return (
      <div style={styles.card}>
        <div style={styles.resultEmoji}>{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '🌱'}</div>
        <h2 style={styles.title}>Test tugadi!</h2>
        <div style={styles.bigScore}>{correct}<span style={styles.scoreOf}>/{total}</span></div>
        <div style={styles.sub}>To'g'ri javoblar · {pct}%</div>

        {result?.xpEarned > 0 && (
          <div style={styles.xpBadge}><Zap size={14} /> +{result.xpEarned} XP</div>
        )}
        {result?.localOnly && (
          <div style={styles.warn}>Natija saqlanmadi (server bilan aloqa yo'q)</div>
        )}

        {wrong.length > 0 && (
          <div style={styles.reviewBox}>
            <div style={styles.reviewTitle}>Xatolar ustida ishlash</div>
            {wrong.map((w, i) => (
              <div key={i} style={styles.reviewRow}>
                <span style={styles.reviewPrompt} className="jp">{w.prompt}</span>
                <span style={styles.reviewWrong}>{w.picked}</span>
                <span style={styles.reviewArrow}>→</span>
                <span style={styles.reviewRight} className={direction === 'toKana' ? 'jp' : undefined}>
                  {w.answer}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={styles.btnRow}>
          {onExit && (
            <button style={styles.secondaryBtn} className="press" onClick={onExit}>Jadval</button>
          )}
          <button style={styles.primaryBtn} className="press" onClick={() => start(direction)}>
            <RefreshCw size={15} /> Yana
          </button>
        </div>
      </div>
    );
  }

  // ── Savol ──
  if (!current) return null;
  const isToKana = direction === 'toKana';

  return (
    <div style={styles.card}>
      <div style={styles.hud}>
        {onExit && (
          <button style={styles.backBtn} className="press" onClick={onExit} aria-label="Chiqish">
            <ArrowLeft size={18} />
          </button>
        )}
        <span style={styles.counter}>Savol <b style={{ color: 'var(--primary)' }}>{idx + 1}</b> / {questions.length}</span>
      </div>
      <div style={styles.progressBg}>
        <div style={{ ...styles.progressFill, width: `${(idx / questions.length) * 100}%` }} />
      </div>

      <div style={styles.promptBox}>
        <div style={isToKana ? styles.promptRomaji : styles.promptKana} className={isToKana ? undefined : 'jp'}>
          {current.prompt}
        </div>
        <div style={styles.promptHint}>
          {isToKana ? `Qaysi ${typeLabel.toLowerCase()} belgisi?` : 'Qanday o‘qiladi?'}
        </div>
      </div>

      <div style={styles.options}>
        {current.options.map(option => {
          const isAnswer = option === current.answer;
          const isPicked = picked === option;
          const revealed = picked !== null;
          const style = {
            ...styles.option,
            ...(revealed && isAnswer ? styles.optionCorrect : {}),
            ...(revealed && isPicked && !isAnswer ? styles.optionWrong : {}),
          };
          return (
            <button
              key={option}
              style={style}
              className="press"
              onClick={() => choose(option)}
              disabled={revealed}
            >
              <span className={isToKana ? 'jp' : undefined} style={isToKana ? styles.optionKana : undefined}>
                {option}
              </span>
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
  card: {
    background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '24px 22px 28px',
    border: '2px solid var(--border)', display: 'flex', flexDirection: 'column',
    maxWidth: 560, width: '100%', margin: '0 auto',
  },
  introIcon: { fontSize: 52, fontWeight: 700, color: 'var(--primary)', textAlign: 'center', lineHeight: 1 },
  title: { fontSize: 22, fontWeight: 800, color: 'var(--text)', textAlign: 'center', margin: '10px 0 4px' },
  sub: { fontSize: 13, color: 'var(--text-light)', fontWeight: 600, textAlign: 'center' },
  dirRow: { display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '18px 0 20px' },
  primaryBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, flex: 1,
    padding: '13px 24px', borderRadius: 'var(--radius-md)', background: 'var(--primary)',
    color: '#fff', fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 0 var(--primary-dark)',
  },
  secondaryBtn: {
    flex: 1, padding: '13px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-alt)',
    color: 'var(--text)', fontSize: 14, fontWeight: 800,
    borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--border)', cursor: 'pointer',
  },
  textBtn: {
    marginTop: 10, padding: '8px', background: 'none', border: 'none',
    color: 'var(--text-light)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  hud: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  backBtn: {
    background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', padding: 0,
  },
  counter: { fontSize: 13.5, color: 'var(--text-light)', fontWeight: 700 },
  progressBg: { height: 6, background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 22 },
  progressFill: { height: '100%', background: 'var(--primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.35s' },
  promptBox: { textAlign: 'center', marginBottom: 22 },
  promptKana: { fontSize: 76, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 },
  promptRomaji: { fontSize: 52, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 },
  promptHint: { fontSize: 12.5, color: 'var(--text-light)', fontWeight: 600, marginTop: 8 },
  options: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  option: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '16px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-alt)',
    borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--border)',
    color: 'var(--text)', fontSize: 17, fontWeight: 800, cursor: 'pointer', minHeight: 56,
  },
  optionKana: { fontSize: 30, lineHeight: 1.1 },
  optionCorrect: { borderColor: 'var(--primary)', background: 'var(--primary-soft)' },
  optionWrong: { borderColor: 'var(--danger)', background: 'rgba(255,75,75,0.08)' },
  resultEmoji: { fontSize: 50, textAlign: 'center' },
  bigScore: { fontSize: 58, fontWeight: 800, color: 'var(--primary)', textAlign: 'center', lineHeight: 1 },
  scoreOf: { fontSize: 28, color: 'var(--text-light)' },
  xpBadge: {
    display: 'flex', width: 'fit-content', margin: '14px auto 0', alignItems: 'center', gap: 5,
    padding: '6px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-soft)',
    color: 'var(--accent-dark)', fontSize: 14, fontWeight: 800,
  },
  warn: { marginTop: 12, fontSize: 12.5, color: 'var(--danger)', fontWeight: 700, textAlign: 'center' },
  reviewBox: {
    marginTop: 18, padding: '14px 16px', background: 'var(--bg-alt)',
    borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 8,
  },
  reviewTitle: { fontSize: 12, fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 0.6 },
  reviewRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, flexWrap: 'wrap' },
  reviewPrompt: { fontSize: 22, color: 'var(--text)', minWidth: 34 },
  reviewWrong: { color: 'var(--danger)', textDecoration: 'line-through' },
  reviewArrow: { color: 'var(--text-light)' },
  reviewRight: { color: 'var(--primary)', fontSize: 18 },
  btnRow: { display: 'flex', gap: 10, marginTop: 20 },
};
