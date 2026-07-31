import { useState, useEffect, useRef } from 'react';
import { getMockTests, startMockTest, submitMockTest } from '../../api/shop';
import { jlptName, sectionLabel } from '../../api/enums';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { BookOpen, Clock, Play, Volume2, Loader, ArrowLeft, ClipboardCheck } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function JlptMockTest() {
  const [level, setLevel] = useState('Barchasi');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sessiya holati
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const submittedRef = useRef(false);

  const levels = ['Barchasi', 'N5', 'N4', 'N3', 'N2', 'N1'];

  useEffect(() => {
    loadTests();
    return () => { clearInterval(timerRef.current); audioRef.current?.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTests = () => {
    setLoading(true);
    setError(null);
    // §13.1 — level javobda RAQAM keladi, jlptName bilan normalizatsiya qilamiz.
    getMockTests()
      .then(data => {
        const list = (data || []).map(t => ({
          id: t.id,
          title: t.title,
          level: jlptName(t.level),
          questionCount: t.questionCount,
          durationMinutes: t.durationMinutes,
          bestScore: t.bestScore,
          attemptCount: t.attemptCount,
        }));
        setTests(list);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  const beginTimer = (minutes) => {
    setSecondsLeft(minutes * 60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true); // vaqt tugadi — avtomatik topshirish
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStart = async (test) => {
    setError(null);
    submittedRef.current = false;
    try {
      // §13.2 — POST /mock-tests/{id}/start → { attemptId, title, durationMinutes, questions }
      const data = await startMockTest(test.id);
      setSession(data);
      setAnswers(Array(data.questions.length).fill(-1));
      setCurrentQ(0);
      setResult(null);
      beginTimer(data.durationMinutes || 30);
    } catch (err) {
      setError(err.message || 'Testni boshlashda xatolik');
    }
  };

  const handleSubmit = async (auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    setSubmitting(true);

    const finalAnswers = answers.map(a => (a === -1 ? 0 : a));

    try {
      // §13.3 — POST /mock-tests/{attemptId}/submit { answers: [int, ...] }
      const res = await submitMockTest(session.attemptId, finalAnswers);
      setResult({ ...res, auto });
      loadTests(); // ro'yxatdagi bestScore/attemptCount yangilansin
    } catch (err) {
      setError(err.message || 'Javoblarni yuborishda xatolik');
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  const playAudio = (url) => {
    if (!url) return;
    audioRef.current?.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => {});
  };

  const fmtTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ─── NATIJA EKRANI ───
  if (result) {
    return (
      <div style={styles.page} className="stagger">
        <div style={styles.resultCard}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{result.percentage >= 70 ? '🏆' : result.percentage >= 50 ? '📈' : '📚'}</div>
          <h2 style={styles.resultTitle}>{result.auto ? "Vaqt tugadi!" : "Test yakunlandi!"}</h2>
          <div style={styles.resultPct}>{result.percentage}%</div>
          <div style={styles.resultDetail}>{result.score}/{result.totalQuestions} to'g'ri javob</div>
          <div style={styles.xpBadge}>+{result.xpEarned} XP</div>
          <button style={styles.btn} onClick={() => { setSession(null); setResult(null); }}>Testlar ro'yxatiga</button>
        </div>
      </div>
    );
  }

  // ─── TEST SESSIYASI ───
  if (session) {
    const q = session.questions[currentQ];
    const answered = answers.filter(a => a !== -1).length;
    return (
      <div style={styles.page} className="stagger">
        <div style={styles.sessionHeader}>
          <button style={styles.backBtn} onClick={() => { clearInterval(timerRef.current); setSession(null); }}>
            <ArrowLeft size={18} />
          </button>
          <span style={styles.sessionTitle}>{session.title}</span>
          <span style={{ ...styles.timer, color: secondsLeft < 60 ? 'var(--danger)' : 'var(--text)' }}>
            <Clock size={14} /> {fmtTimer(secondsLeft)}
          </span>
        </div>

        <div style={styles.qNav}>
          {session.questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              style={{
                ...styles.qNavBtn,
                ...(i === currentQ ? styles.qNavCurrent : {}),
                ...(answers[i] !== -1 && i !== currentQ ? styles.qNavDone : {}),
              }}>
              {i + 1}
            </button>
          ))}
        </div>

        <div style={styles.questionCard}>
          <div style={styles.sectionBadge}>{sectionLabel(q.section)}</div>
          <div style={styles.prompt} className="jp">{q.prompt}</div>
          {q.promptUz && <div style={styles.promptUz}>{q.promptUz}</div>}
          {q.audioUrl && (
            <button style={styles.audioBtn} onClick={() => playAudio(q.audioUrl)}>
              <Volume2 size={18} color="var(--primary)" /> Tinglash
            </button>
          )}
        </div>

        <div style={styles.options}>
          {q.options.map((opt, i) => (
            <button key={i}
              onClick={() => setAnswers(prev => { const next = [...prev]; next[currentQ] = i; return next; })}
              style={{ ...styles.optionBtn, ...(answers[currentQ] === i ? styles.optionSelected : {}) }}>
              <span style={styles.optLetter}>{String.fromCharCode(65 + i)}</span>
              <span className="jp">{opt}</span>
            </button>
          ))}
        </div>

        <div style={styles.sessionFooter}>
          <span style={styles.answeredInfo}>{answered}/{session.questions.length} javob berildi</span>
          {currentQ < session.questions.length - 1 ? (
            <button style={styles.nextBtn} onClick={() => setCurrentQ(currentQ + 1)}>Keyingi</button>
          ) : (
            <button style={{ ...styles.submitBtn, opacity: submitting ? 0.6 : 1 }} onClick={() => handleSubmit(false)} disabled={submitting}>
              {submitting ? 'Yuborilmoqda…' : 'Topshirish'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── TESTLAR RO'YXATI ───
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error && tests.length === 0) return <ErrorState message={error} onRetry={loadTests} />;
  if (tests.length === 0) return <EmptyState title="Mock testlar yo'q" subtitle="Hozircha mock testlar qo'shilmagan" />;

  const filtered = level === 'Barchasi' ? tests : tests.filter(t => t.level === level);

  return (
    <div style={styles.page} className="stagger">
      <PageHeader icon={ClipboardCheck} title="JLPT Mock Imtihon" subtitle="Haqiqiy imtihonga tayyorlaning" accent="blue" />

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.filters}>
        {levels.map(l => (
          <button key={l} onClick={() => setLevel(l)}
            className={`chip${level === l ? ' chip--active' : ''}`}>{l}</button>
        ))}
      </div>

      <div style={styles.list}>
        {filtered.length === 0 && (
          <div style={styles.emptyBox}>Bu daraja uchun test topilmadi</div>
        )}
        {filtered.map(test => (
          <div key={test.id} style={styles.card}>
            <div style={styles.cardLeft}>
              <div style={styles.testTitle}>{test.title}</div>
              <div style={styles.testMeta}>
                <span><BookOpen size={12} /> {test.questionCount} savol</span>
                <span><Clock size={12} /> {test.durationMinutes} daq</span>
                <span style={styles.levelBadge}>{test.level}</span>
              </div>
              {test.bestScore != null && <div style={styles.bestScore}>Eng yaxshi: {test.bestScore} ball · {test.attemptCount} urinish</div>}
            </div>
            <div style={styles.cardRight}>
              <button style={styles.playBtn} onClick={() => handleStart(test)}>
                <Play size={18} fill="white" color="white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 },
  sub: { fontSize: 14, color: 'var(--text-light)', marginTop: -8 },
  filters: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  filterBtn: { padding: '6px 14px', borderRadius: 16, background: 'var(--bg)', border: '2px solid var(--border)', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' },
  filterActive: { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', background: 'var(--bg-card)', borderRadius: 14, border: '2px solid var(--border)' },
  cardLeft: {},
  testTitle: { fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 },
  testMeta: { display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-light)', alignItems: 'center' },
  levelBadge: { padding: '2px 8px', borderRadius: 8, background: 'rgba(33,150,243,0.1)', color: 'var(--secondary-dark)', fontSize: 11, fontWeight: 600 },
  bestScore: { marginTop: 6, fontSize: 12, fontWeight: 600, color: 'var(--success)' },
  cardRight: {},
  playBtn: { width: 40, height: 40, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' },
  emptyBox: { textAlign: 'center', padding: 32, color: 'var(--text-light)', fontSize: 14 },
  errorBox: { padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 13 },

  // Sessiya
  sessionHeader: { display: 'flex', alignItems: 'center', gap: 10 },
  backBtn: { background: 'none', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' },
  sessionTitle: { flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--text)' },
  timer: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 700 },
  qNav: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  qNavBtn: { width: 32, height: 32, borderRadius: 8, background: 'var(--bg)', border: '2px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-light)', cursor: 'pointer' },
  qNavCurrent: { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },
  qNavDone: { background: 'rgba(76,175,80,0.12)', borderColor: 'var(--success)', color: 'var(--success)' },
  questionCard: { background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '2px solid var(--border)', textAlign: 'center' },
  sectionBadge: { display: 'inline-block', padding: '3px 12px', borderRadius: 10, background: 'rgba(167,139,250,0.12)', color: 'var(--purple-dark)', fontSize: 11, fontWeight: 700, marginBottom: 12 },
  prompt: { fontSize: 20, fontWeight: 600, color: 'var(--text)', lineHeight: 1.6 },
  promptUz: { fontSize: 13, color: 'var(--text-light)', marginTop: 8 },
  audioBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '8px 16px', borderRadius: 10, background: 'rgba(88,204,2,0.06)', border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  options: { display: 'flex', flexDirection: 'column', gap: 8 },
  optionBtn: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'var(--bg-card)', border: '1.5px solid var(--border)', fontSize: 15, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' },
  optionSelected: { borderColor: 'var(--primary)', background: 'rgba(88,204,2,0.05)' },
  optLetter: { width: 26, height: 26, borderRadius: 8, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-light)', flexShrink: 0 },
  sessionFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  answeredInfo: { fontSize: 12, color: 'var(--text-light)' },
  nextBtn: { padding: '12px 28px', borderRadius: 12, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' },
  submitBtn: { padding: '12px 28px', borderRadius: 12, background: 'var(--success)', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' },

  // Natija
  resultCard: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 20, padding: 40, boxShadow: 'var(--shadow-lg)', maxWidth: 440, margin: '20px auto', width: '100%' },
  resultTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 },
  resultPct: { fontSize: 48, fontWeight: 800, color: 'var(--primary)' },
  resultDetail: { fontSize: 14, color: 'var(--text-light)', marginBottom: 12 },
  xpBadge: { display: 'inline-block', padding: '6px 16px', borderRadius: 12, background: 'rgba(167,139,250,0.12)', color: 'var(--purple-dark)', fontSize: 14, fontWeight: 700, marginBottom: 20 },
  btn: { width: '100%', padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' },
};
