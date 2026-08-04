import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchKanji } from '../../api/dictionary';
import { submitExerciseResult } from '../../api/lessons';
import { GAME_LESSON_ID } from '../../utils/practice';
import { kanaToRomaji } from '../../utils/kana';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { ArrowLeft, Loader, Check, X, Zap } from 'lucide-react';

// WaniKani uslubidagi review — kanji ko'rsatiladi, foydalanuvchi o'qilishini (yoki ma'nosini) yozadi.
// O'qish rejimida bir nechta o'qish (kun'yomi + on'yomi) qabul qilinadi, romaji orqali solishtiriladi.
// Hisob/XP backendda: session oxirida /exercises/result.
// O'yin darsga bog'liq emas. Server LessonId/ExerciseType'ni ishlatmaydi, validator faqat
// LessonId NotEmpty va ExerciseType whitelist talab qiladi.
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const ROUND = 12;

const clean = (s) => (s || '').replace(/[.．・〜～\-\s]/g, '');
// Qabul qilinadigan romaji o'qishlar: kana'dan o'girilgan + backend'ning rasmiy romajiKun/romajiOn.
const readingsRomaji = (k) => [
  ...[...(k.kunyomi || []), ...(k.onyomi || [])].map(r => kanaToRomaji(clean(r)).toLowerCase()),
  ...(k.romajiKun || []).map(r => clean(r).toLowerCase()),
  ...(k.romajiOn || []).map(r => clean(r).toLowerCase()),
].filter(Boolean);
const meaningList = (k) => (k.meaningsUz?.length ? k.meaningsUz : k.meanings || [])
  .flatMap(m => m.split(/[;,、]/)).map(s => s.toLowerCase().trim()).filter(Boolean);

export default function ReadingReview() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('menu');   // menu | playing | over
  const [mode, setMode] = useState('reading');  // reading | meaning
  const [level, setLevel] = useState('N5');
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(null); // {correct, answer}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);

  const start = useCallback((lvl, md) => {
    setLoading(true);
    setError(null);
    searchKanji({ level: lvl, pageSize: 200 })
      .then(data => {
        const list = (data?.items || data || []);
        const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, ROUND);
        if (shuffled.length === 0) { setItems([]); setPhase('empty'); return; }
        setItems(shuffled);
        setIdx(0); setInput(''); setChecked(null); setCorrectCount(0); setResult(null); setAnswers([]);
        setMode(md); setLevel(lvl);
        setPhase('playing');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const current = items[idx];

  const check = () => {
    if (!current || checked) return;
    const val = input.toLowerCase().trim();
    if (!val) return;
    let correct;
    let answerText;
    if (mode === 'reading') {
      const romaji = readingsRomaji(current);
      const rawKana = [...(current.kunyomi || []), ...(current.onyomi || [])].map(clean);
      correct = romaji.includes(clean(val)) || rawKana.includes(clean(val));
      answerText = [...(current.kunyomi || []), ...(current.onyomi || [])].join('、');
    } else {
      correct = meaningList(current).includes(val);
      answerText = (current.meaningsUz?.length ? current.meaningsUz : current.meanings || []).join(', ');
    }
    setChecked({ correct, answer: answerText });
    if (correct) setCorrectCount(c => c + 1);
    setAnswers(a => [...a, { itemId: current.id, itemType: 'Kanji', isCorrect: correct }]);
  };

  const next = () => {
    if (idx + 1 >= items.length) {
      // session tugadi — backendga yuboramiz
      const timeSpentSeconds = Math.max(1, items.length * 4);
      submitExerciseResult({ lessonId: GAME_LESSON_ID, exerciseType: 'Reading', answers, timeSpentSeconds })
        .then(res => setResult(res || null))
        .catch(() => setResult({ localOnly: true }));
      setPhase('over');
      return;
    }
    setIdx(i => i + 1);
    setInput('');
    setChecked(null);
  };

  const onKey = (e) => {
    if (e.key !== 'Enter') return;
    if (checked) next(); else check();
  };

  // ── Menu ──
  if (phase === 'menu' || phase === 'empty') {
    return (
      <div style={styles.page} className="stagger">
        <div style={styles.header}>
          <button style={styles.backBtn} className="press" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <span style={styles.headerTitle}>O'qish Review</span>
          <span style={{ width: 20 }} />
        </div>
        <div style={styles.menuCard} className="anim-scale-in">
          <div style={{ fontSize: 50 }}>📖</div>
          <h2 style={styles.menuTitle}>Kanji O'qish Review</h2>
          <p style={styles.menuSub}>Kanji ko'rsatiladi — o'qilishini (romaji) yoki ma'nosini yozing. Bir nechta o'qish qabul qilinadi.</p>

          <div style={styles.segRow}>
            <button className="press" style={{ ...styles.seg, ...(mode === 'reading' ? styles.segActive : {}) }} onClick={() => setMode('reading')}>O'qilishi</button>
            <button className="press" style={{ ...styles.seg, ...(mode === 'meaning' ? styles.segActive : {}) }} onClick={() => setMode('meaning')}>Ma'nosi</button>
          </div>
          <div style={styles.levelRow}>
            {LEVELS.map(lv => (
              <button key={lv} className="press" style={{ ...styles.lvl, ...(level === lv ? styles.lvlActive : {}) }} onClick={() => setLevel(lv)}>{lv}</button>
            ))}
          </div>
          {phase === 'empty' && <EmptyState emoji="🗂️" title="Bu daraja uchun kanji topilmadi" subtitle="Boshqa darajani tanlang" />}
          <button style={styles.playBtn} className="press" onClick={() => start(level, mode)} disabled={loading}>
            {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Boshlash'}
          </button>
          {error && <div style={styles.err}>{error}</div>}
        </div>
      </div>
    );
  }

  // ── Over ──
  if (phase === 'over') {
    const pct = items.length ? Math.round((correctCount / items.length) * 100) : 0;
    return (
      <div style={styles.page} className="stagger">
        <div style={styles.resultCard} className="anim-scale-in">
          <div style={{ fontSize: 52 }} className="anim-bounce">{pct >= 80 ? '🎉' : '📚'}</div>
          <h2 style={styles.menuTitle}>Review tugadi!</h2>
          <div style={styles.bigScore}>{correctCount}/{items.length}</div>
          <div style={styles.scoreLabel}>to'g'ri javob · {pct}%</div>
          {result?.xpEarned > 0 && <div style={styles.xpBadge}><Zap size={14} /> +{result.xpEarned} XP</div>}
          {result?.localOnly && <div style={styles.err}>Natija saqlanmadi (server bilan aloqa yo'q)</div>}
          <div style={styles.resultBtns}>
            <button style={styles.secBtn} className="press" onClick={() => setPhase('menu')}>Menyu</button>
            <button style={styles.playBtn} className="press" onClick={() => start(level, mode)}>Yana</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div style={styles.center}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={() => start(level, mode)} />;
  if (!current) return null;

  // ── Playing ──
  return (
    <div style={styles.page} className="stagger">
      <div style={styles.hud}>
        <button style={styles.backBtn} className="press" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <div style={styles.progressBg}><div style={{ ...styles.progressFill, width: `${((idx + (checked ? 1 : 0)) / items.length) * 100}%` }} /></div>
        <span style={styles.counter}>{idx + 1}/{items.length}</span>
      </div>

      <div style={{ ...styles.card, ...(checked ? (checked.correct ? styles.cardOk : styles.cardBad) : {}) }}>
        <div style={styles.prompt}>{mode === 'reading' ? 'O\'qilishini yozing' : 'Ma\'nosini yozing'}</div>
        <div style={styles.kanjiChar} className="jp">{current.character}</div>
        {mode === 'reading' && (
          <div style={styles.hint}>{(current.meaningsUz?.length ? current.meaningsUz : current.meanings || []).slice(0, 2).join(', ')}</div>
        )}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        placeholder={mode === 'reading' ? 'romaji: masalan "yama"' : "ma'no"}
        autoFocus
        inputMode="latin"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        disabled={!!checked}
        style={{ ...styles.input, ...(checked ? (checked.correct ? styles.inputOk : styles.inputBad) : {}) }}
      />

      {checked && (
        <div style={{ ...styles.feedback, color: checked.correct ? 'var(--success-dark)' : 'var(--danger)' }}>
          {checked.correct ? <Check size={18} /> : <X size={18} />}
          <span className="jp">{checked.answer}</span>
        </div>
      )}

      <button style={styles.playBtn} className="press" onClick={checked ? next : check}>
        {checked ? (idx + 1 >= items.length ? 'Yakunlash' : 'Keyingi →') : 'Tekshirish'}
      </button>
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
  segRow: { display: 'flex', gap: 6, padding: 4, background: 'var(--bg-alt)', borderRadius: 'var(--radius-full)', marginBottom: 14 },
  seg: { flex: 1, padding: '9px 12px', borderRadius: 'var(--radius-full)', border: 'none', background: 'transparent', color: 'var(--text-light)', fontSize: 13.5, fontWeight: 800, cursor: 'pointer' },
  segActive: { background: 'var(--primary)', color: '#fff' },
  levelRow: { display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' },
  lvl: { padding: '7px 14px', borderRadius: 'var(--radius-full)', border: '2px solid var(--border)', background: 'var(--bg-alt)', color: 'var(--text-light)', fontSize: 13, fontWeight: 800, cursor: 'pointer' },
  lvlActive: { background: 'var(--secondary-soft)', color: 'var(--secondary-dark)', borderColor: 'var(--secondary)' },
  playBtn: { width: '100%', padding: '14px 24px', borderRadius: 16, background: 'var(--primary)', color: '#fff', fontSize: 15, fontWeight: 800, border: 'none', boxShadow: '0 4px 0 var(--primary-dark)', cursor: 'pointer' },
  secBtn: { flex: 1, padding: '14px 24px', borderRadius: 16, background: 'var(--bg-alt)', color: 'var(--text)', fontSize: 15, fontWeight: 700, border: '2px solid var(--border)', cursor: 'pointer' },
  err: { marginTop: 14, fontSize: 13, color: 'var(--danger)', fontWeight: 600 },
  hud: { display: 'flex', alignItems: 'center', gap: 12 },
  progressBg: { flex: 1, height: 8, background: 'var(--border-light)', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--primary)', borderRadius: 999, transition: 'width 0.3s' },
  counter: { fontSize: 13, fontWeight: 700, color: 'var(--text-light)' },
  card: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 22, padding: '32px 20px', boxShadow: 'var(--shadow)', border: '2px solid var(--border-light)' },
  cardOk: { borderColor: 'var(--success)', background: 'var(--success-soft)' },
  cardBad: { borderColor: 'var(--danger)', background: 'color-mix(in srgb, var(--danger) 8%, transparent)' },
  prompt: { fontSize: 12, fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  kanjiChar: { fontSize: 84, fontWeight: 900, color: 'var(--text)', lineHeight: 1 },
  hint: { fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 10 },
  input: { padding: 15, borderRadius: 14, border: '2px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 17, fontWeight: 700, textAlign: 'center', outline: 'none' },
  inputOk: { borderColor: 'var(--success)' },
  inputBad: { borderColor: 'var(--danger)' },
  feedback: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 18, fontWeight: 800 },
  resultCard: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 24, padding: 36, boxShadow: 'var(--shadow-lg)', border: '2px solid var(--border)' },
  bigScore: { fontSize: 52, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 },
  scoreLabel: { fontSize: 14, color: 'var(--text-light)', fontWeight: 700, marginBottom: 16 },
  xpBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 16px', borderRadius: 12, background: 'color-mix(in srgb, var(--purple) 14%, transparent)', color: 'var(--purple-dark)', fontSize: 14, fontWeight: 800, marginBottom: 18 },
  resultBtns: { display: 'flex', gap: 10, marginTop: 8 },
};
