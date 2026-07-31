import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchVocabulary } from '../../api/dictionary';
import { submitExerciseResult } from '../../api/lessons';
import ErrorState from '../../components/ErrorState';
import { ArrowLeft, Loader, Eye, EyeOff, RefreshCw, Zap } from 'lucide-react';

// So'z terish mashqi (washi uslubi) — yaponcha so'z ko'rsatiladi, romaji'sini yozasiz.
// Oltin kalit keyingi harfni ko'rsatadi. Furigana/Romaji/Ma'no'ni yashirib "haqiqiy" o'qishga o'ting.
// Hisob/XP backendda: session oxirida /exercises/result (itemType Vocabulary).
const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const ROUND = 10;
const WORD_SECONDS = 15;

// Midori dizayn tokenlariga bog'langan palitra — och/tungi rejim avtomatik ishlaydi.
const C = {
  cream: 'var(--bg-alt)', card: 'var(--bg-card)', ink: 'var(--text)', coral: 'var(--primary)',
  tan: 'var(--primary-soft)', gold: 'var(--accent)', goldDark: 'var(--accent-dark)', teal: 'var(--secondary)',
  muted: 'var(--text-light)', border: 'var(--border)', line: 'var(--border)',
  danger: 'var(--danger)',
};
const SERIF = 'var(--font-jp)';
const norm = (s) => (s || '').toLowerCase().replace(/[^a-z-]/g, '');

export default function KanaNinja() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('menu');   // menu | empty | playing | over
  const [level, setLevel] = useState('N5');
  const [words, setWords] = useState([]);
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(WORD_SECONDS);
  const [show, setShow] = useState({ jp: true, furigana: false, romaji: true, meaning: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState(null);

  const answersRef = useRef([]);
  const correctRef = useRef(0);
  const lockRef = useRef(false);
  const startRef = useRef(0);
  const inputRef = useRef(null);

  const current = words[idx];
  const target = norm(current?.romaji);

  const start = useCallback((lvl) => {
    setLoading(true);
    setError(null);
    searchVocabulary({ level: lvl, pageSize: 200 })
      .then(data => {
        const list = (data?.items || data || [])
          .filter(v => v.word && norm(v.romaji));
        if (list.length === 0) { setPhase('empty'); return; }
        const chosen = [...list].sort(() => Math.random() - 0.5).slice(0, ROUND);
        answersRef.current = []; correctRef.current = 0;
        startRef.current = Date.now();
        setWords(chosen); setIdx(0); setTyped(''); setCorrectCount(0); setResult(null);
        setLevel(lvl); setPhase('playing');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const finishWord = useCallback((isCorrect) => {
    if (lockRef.current) return;
    lockRef.current = true;
    const w = words[idx];
    if (w) {
      answersRef.current.push({ itemId: w.id, itemType: 'Vocabulary', isCorrect });
      if (isCorrect) correctRef.current += 1;
    }
    setTimeout(() => {
      if (idx + 1 >= words.length) {
        setCorrectCount(correctRef.current);
        const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
        submitExerciseResult({ lessonId: EMPTY_GUID, exerciseType: 'TypingDrill', answers: answersRef.current, timeSpentSeconds })
          .then(res => setResult(res || null))
          .catch(() => setResult({ localOnly: true }));
        setPhase('over');
      } else {
        setIdx(i => i + 1);
      }
    }, 320);
  }, [idx, words]);

  // Har so'z uchun taymer + reset
  useEffect(() => {
    if (phase !== 'playing') return;
    lockRef.current = false;
    setTyped('');
    setTimeLeft(WORD_SECONDS);
    const f = setTimeout(() => inputRef.current?.focus(), 30);
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) { clearInterval(t); finishWord(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { clearInterval(t); clearTimeout(f); };
  }, [idx, phase, finishWord]);

  const onType = (e) => {
    if (lockRef.current) return;
    const v = norm(e.target.value);
    if (target.startsWith(v)) {
      setTyped(v);
      if (v === target) finishWord(true);
    }
  };

  const toggle = (key) => setShow(s => ({ ...s, [key]: !s[key] }));

  const mmss = `00:${String(timeLeft).padStart(2, '0')}`;

  // ── Decorative sakura petals ──
  const Petals = () => (
    <>
      <div style={{ ...styles.petal, top: 18, left: 26, transform: 'rotate(20deg)' }} />
      <div style={{ ...styles.petal, top: 44, left: 60, width: 10, height: 10, opacity: 0.5 }} />
      <div style={{ ...styles.blossom, top: 12, left: 8 }}>🌸</div>
      <div style={{ ...styles.blossom, top: 40, right: 24, fontSize: 16, opacity: 0.35 }}>🌸</div>
      <div style={{ ...styles.petal, bottom: 40, right: 40, transform: 'rotate(-15deg)' }} />
    </>
  );

  // ── Menu ──
  if (phase === 'menu' || phase === 'empty') {
    return (
      <div style={styles.stage}>
        <Petals />
        <div style={styles.card}>
          <button style={styles.backTop} className="press" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
          <div style={{ fontSize: 46, textAlign: 'center' }}>⌨️</div>
          <h2 style={styles.menuTitle}>So'z Terish</h2>
          <p style={styles.menuSub}>Yaponcha so'z ko'rsatiladi — romaji'sini yozing. Oltin kalit keyingi harfni ko'rsatadi. Tayyor bo'lsangiz romaji'ni yashiring va haqiqiy o'qing.</p>
          <div style={styles.levelRow}>
            {LEVELS.map(lv => (
              <button key={lv} className="press" style={{ ...styles.lvl, ...(level === lv ? styles.lvlActive : {}) }} onClick={() => setLevel(lv)}>{lv}</button>
            ))}
          </div>
          {phase === 'empty' && <div style={styles.empty}>Bu daraja uchun so'z topilmadi — boshqa darajani tanlang.</div>}
          <button style={styles.startBtn} className="press" onClick={() => start(level)} disabled={loading}>
            {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Boshlash'}
          </button>
          {error && <div style={styles.err}>{error}</div>}
        </div>
      </div>
    );
  }

  // ── Over ──
  if (phase === 'over') {
    const pct = words.length ? Math.round((correctCount / words.length) * 100) : 0;
    return (
      <div style={styles.stage}>
        <Petals />
        <div style={styles.card}>
          <div style={{ fontSize: 50, textAlign: 'center' }}>{pct >= 80 ? '🎉' : '🌸'}</div>
          <h2 style={styles.menuTitle}>Mashq tugadi!</h2>
          <div style={styles.bigScore}>{correctCount}<span style={styles.scoreOf}>/{words.length}</span></div>
          <div style={styles.scoreLabel}>to'g'ri terildi · {pct}%</div>
          {result?.xpEarned > 0 && <div style={styles.xpBadge}><Zap size={14} /> +{result.xpEarned} XP</div>}
          {result?.localOnly && <div style={styles.err}>Natija saqlanmadi (server bilan aloqa yo'q)</div>}
          <div style={styles.overBtns}>
            <button style={styles.secBtn} className="press" onClick={() => setPhase('menu')}>Menyu</button>
            <button style={styles.startBtn} className="press" onClick={() => start(level)}><RefreshCw size={15} /> Yana</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div style={styles.stage}><Loader size={26} color={C.coral} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <div style={styles.stage}><ErrorState message={error} onRetry={() => start(level)} /></div>;
  if (!current) return null;

  // Romaji + oltin kalit ko'rinishi
  const renderRomaji = () => {
    if (!show.romaji) {
      return (
        <span style={styles.romajiHidden}>
          {typed.split('').map((ch, i) => <span key={i} style={styles.rmDone}>{ch}</span>)}
          <span style={styles.caret} />
        </span>
      );
    }
    return target.split('').map((ch, i) => {
      if (i < typed.length) return <span key={i} style={styles.rmDone}>{ch}</span>;
      if (i === typed.length) return <span key={i} style={styles.goldKey}>{ch}</span>;
      return <span key={i} style={styles.rmFuture}>{ch}</span>;
    });
  };

  const meaning = (current.meaningsUz?.length ? current.meaningsUz : current.meanings || []).slice(0, 2).join(' / ');
  const toggles = [
    { key: 'jp', badge: 'あ', name: 'Yaponcha' },
    { key: 'furigana', badge: 'ふり', name: 'Furigana' },
    { key: 'romaji', badge: 'A→あ', name: 'Romaji' },
    { key: 'meaning', badge: 'EN', name: "Ma'no" },
  ];

  // ── Playing ──
  return (
    <div style={styles.stage}>
      <Petals />
      <div style={styles.card} onClick={() => inputRef.current?.focus()}>
        <div style={styles.hud}>
          <button style={styles.backTop} className="press" onClick={(e) => { e.stopPropagation(); navigate(-1); }}><ArrowLeft size={18} /></button>
          <span style={styles.wordCount}>So'z <b style={{ color: C.coral }}>{idx + 1}</b> / {words.length}</span>
          <span style={{ ...styles.timer, ...(timeLeft <= 5 ? { color: C.danger } : {}) }}>{mmss}</span>
        </div>
        <div style={styles.progressBg}><div style={{ ...styles.progressFill, width: `${((idx) / words.length) * 100}%` }} /></div>

        <div style={styles.toggleWrap}>
          {toggles.map(t => {
            const on = show[t.key];
            return (
              <button key={t.key} className="press"
                style={{ ...styles.toggle, ...(on ? {} : styles.toggleOff) }}
                onClick={(e) => { e.stopPropagation(); toggle(t.key); }}>
                <span style={{ ...styles.toggleBadge, ...(on ? {} : styles.toggleBadgeOff) }}>{t.badge}</span>
                {t.name}
                {on ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            );
          })}
        </div>

        <div style={styles.wordArea}>
          {show.furigana && current.reading && (
            <div style={styles.furigana} className="jp">{current.reading}</div>
          )}
          <div style={styles.wordBox}>
            {show.jp
              ? <span style={styles.word}>{current.word}</span>
              : <span style={styles.wordMasked}>■■■</span>}
          </div>
        </div>

        {show.meaning && meaning && <div style={styles.meaning}>{meaning}</div>}

        <div style={styles.inputBox}>
          <input
            ref={inputRef}
            value={typed}
            onChange={onType}
            autoFocus
            inputMode="latin"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            style={styles.hiddenInput}
          />
          <div style={styles.romajiDisplay}>{renderRomaji()}</div>
        </div>
      </div>
      <p style={styles.footHint}>Romaji'ni yozing · <b style={{ color: C.goldDark }}>oltin kalit</b> keyingi harfni ko'rsatadi · tayyor bo'lsangiz Romaji'ni yashiring</p>
    </div>
  );
}

const styles = {
  stage: {
    position: 'relative', minHeight: '82vh', background: C.cream, borderRadius: 'var(--radius-xl)',
    border: '2px solid var(--border)',
    padding: '28px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 14, overflow: 'hidden',
  },
  petal: { position: 'absolute', width: 14, height: 14, background: 'var(--pink-soft)', borderRadius: '50% 0 50% 50%', opacity: 0.6, pointerEvents: 'none' },
  blossom: { position: 'absolute', fontSize: 22, opacity: 0.4, pointerEvents: 'none', filter: 'saturate(0.8)' },
  card: {
    position: 'relative', zIndex: 1, width: '100%', maxWidth: 620, background: C.card,
    borderRadius: 'var(--radius-xl)', padding: '26px 26px 30px', boxShadow: 'var(--shadow-lg)',
    border: '2px solid var(--border)',
  },
  backTop: { position: 'absolute', left: 18, top: 20, background: 'none', border: 'none', color: C.muted, cursor: 'pointer', zIndex: 2 },
  menuTitle: { fontSize: 24, fontWeight: 800, color: C.ink, textAlign: 'center', margin: '6px 0', fontFamily: SERIF },
  menuSub: { fontSize: 13.5, color: C.muted, fontWeight: 500, textAlign: 'center', lineHeight: 1.6, marginBottom: 20, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' },
  levelRow: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 22, flexWrap: 'wrap' },
  lvl: { padding: '8px 16px', borderRadius: 'var(--radius-full)', border: `2px solid ${C.line}`, background: 'transparent', color: C.muted, fontSize: 14, fontWeight: 800, cursor: 'pointer' },
  lvlActive: { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary-dark)' },
  empty: { textAlign: 'center', fontSize: 13, color: C.danger, fontWeight: 700, marginBottom: 14 },
  startBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '13px 24px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#fff', fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 0 var(--primary-dark)' },
  secBtn: { flex: 1, padding: '13px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-alt)', color: C.ink, fontSize: 14, fontWeight: 800, border: `2px solid ${C.line}`, cursor: 'pointer' },
  err: { marginTop: 14, fontSize: 13, color: C.danger, fontWeight: 700, textAlign: 'center' },
  hud: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 30, marginBottom: 10 },
  wordCount: { fontSize: 14, color: C.muted, fontWeight: 600 },
  timer: { fontSize: 14, color: C.muted, fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
  progressBg: { height: 6, background: C.border, borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 20 },
  progressFill: { height: '100%', background: 'var(--primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.35s' },
  toggleWrap: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 26 },
  toggle: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 'var(--radius-full)', border: `2px solid ${C.line}`, background: 'transparent', color: C.ink, fontSize: 12.5, fontWeight: 800, cursor: 'pointer' },
  toggleOff: { background: 'var(--bg-alt)', color: C.muted, borderColor: C.line },
  toggleBadge: { fontSize: 11, fontWeight: 800, color: 'var(--primary-dark)' },
  toggleBadgeOff: { color: C.muted },
  wordArea: { textAlign: 'center', marginBottom: 14 },
  furigana: { fontSize: 16, color: C.muted, fontWeight: 500, marginBottom: 4, letterSpacing: 3 },
  wordBox: { display: 'inline-block', background: C.tan, borderRadius: 14, padding: '14px 30px' },
  word: { fontSize: 50, fontWeight: 700, color: C.ink, fontFamily: SERIF, letterSpacing: 4 },
  wordMasked: { fontSize: 44, fontWeight: 700, color: C.line, letterSpacing: 6 },
  meaning: { textAlign: 'center', fontSize: 16, color: C.teal, fontWeight: 600, marginBottom: 22 },
  inputBox: { position: 'relative', border: `2px dashed ${C.line}`, borderRadius: 16, padding: '18px 20px', minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'text' },
  hiddenInput: { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 'none', background: 'transparent', cursor: 'text' },
  romajiDisplay: { display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 26, fontWeight: 700, letterSpacing: 1, minHeight: 34 },
  rmDone: { color: C.ink },
  rmFuture: { color: C.muted },
  goldKey: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 30, height: 34, padding: '0 6px', margin: '0 2px', background: C.gold, color: '#fff', borderRadius: 8, boxShadow: `0 3px 0 ${C.goldDark}`, fontWeight: 800 },
  romajiHidden: { display: 'inline-flex', alignItems: 'center', fontSize: 26, fontWeight: 700, color: C.ink },
  caret: { display: 'inline-block', width: 2, height: 26, background: C.coral, marginLeft: 2, animation: 'pulse 1s steps(2) infinite' },
  footHint: { position: 'relative', zIndex: 1, fontSize: 12.5, color: C.muted, fontWeight: 500, textAlign: 'center', maxWidth: 560, lineHeight: 1.5 },
  bigScore: { fontSize: 60, fontWeight: 800, color: C.coral, textAlign: 'center', lineHeight: 1, fontFamily: SERIF },
  scoreOf: { fontSize: 30, color: C.muted },
  scoreLabel: { textAlign: 'center', fontSize: 14, color: C.muted, fontWeight: 600, marginBottom: 16 },
  xpBadge: { display: 'flex', width: 'fit-content', margin: '0 auto 18px', alignItems: 'center', gap: 5, padding: '6px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-soft)', color: C.goldDark, fontSize: 14, fontWeight: 800 },
  overBtns: { display: 'flex', gap: 10 },
};
