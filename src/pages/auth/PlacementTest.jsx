import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startPlacementTest, answerPlacementTest } from '../../api/shop';
import { JlptLevelToInt, jlptName } from '../../api/enums';
import { Button, ProgressBar } from '../../components/ui';
import { X, Loader } from 'lucide-react';

// §5 — Placement test: daraja tanlash → tasdiqlash testi (confirm) yoki
// zinapoya (auto). Baholash serverda — correctIndex clientga kelmaydi.
const LEVEL_CHOICES = [
  { key: 'beginner', icon: '🌱', title: "Boshlang'ich", desc: "Noldan boshlayman — test shart emas", level: 'N5' },
  { key: 'N4', icon: '📗', title: 'N4 bilaman', desc: "Asosiy grammatika, ~600 so'z", level: 'N4' },
  { key: 'N3', icon: '📘', title: 'N3 bilaman', desc: "O'rta daraja, kundalik matnlar", level: 'N3' },
  { key: 'N2', icon: '📙', title: 'N2 bilaman', desc: "Yuqori daraja, erkin o'qish", level: 'N2' },
  { key: 'N1', icon: '📕', title: 'N1 bilaman', desc: 'Professional daraja', level: 'N1' },
  { key: 'auto', icon: '🤖', title: 'Bilmayman', desc: "Darajamni avtomatik aniqlang", level: null },
];

export default function PlacementTest() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('pick');   // pick | test | result
  const [mode, setMode] = useState(null);
  const [stage, setStage] = useState('N5');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const beginTest = async (choice) => {
    setError(null);
    setBusy(true);
    try {
      if (choice.key === 'beginner') {
        // N5 — test yo'q, natija serverda darhol yoziladi
        await startPlacementTest('confirm', JlptLevelToInt.N5);
        navigate('/goal-setup');
        return;
      }
      const m = choice.key === 'auto' ? 'auto' : 'confirm';
      const res = await startPlacementTest(m, choice.level ? JlptLevelToInt[choice.level] : null);
      if (res.finished) {
        setResult(res.result);
        setPhase('result');
      } else {
        setMode(m);
        setStage(res.stage);
        setQuestions(res.questions || []);
        setAnswers([]);
        setCurrent(0);
        setPhase('test');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitStage = async (allAnswers) => {
    setBusy(true);
    try {
      const res = await answerPlacementTest(allAnswers);
      if (res.finished) {
        setResult(res.result);
        setPhase('result');
      } else {
        // Auto rejim: keyingi bosqich savollari keldi
        setStage(res.stage);
        setQuestions(res.questions || []);
        setAnswers([]);
        setCurrent(0);
      }
    } catch (err) {
      setError(err.message);
      setPhase('pick');
    } finally {
      setBusy(false);
    }
  };

  const handlePick = (idx) => {
    if (picked !== null || busy) return;
    setPicked(idx);
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);

    setTimeout(() => {
      setPicked(null);
      if (current + 1 >= questions.length) {
        submitStage(newAnswers);
      } else {
        setCurrent(c => c + 1);
      }
    }, 300);
  };

  // ── Daraja tanlash ekrani ──
  if (phase === 'pick') {
    return (
      <div style={styles.page}>
        <div style={styles.card} className="anim-scale-in">
          <h1 style={styles.pickTitle}>Yapon tilini qay darajada bilasiz?</h1>
          <p style={styles.pickSub}>Roadmap darajangizga mos boshlanadi</p>
          {error && <div style={styles.errorBox}>{error}</div>}
          <div style={styles.choices}>
            {LEVEL_CHOICES.map(choice => (
              <button
                key={choice.key}
                style={styles.choiceBtn}
                className="press card-interactive"
                disabled={busy}
                onClick={() => beginTest(choice)}
              >
                <span style={styles.choiceIcon}>{choice.icon}</span>
                <span style={{ textAlign: 'left', minWidth: 0 }}>
                  <span style={styles.choiceTitle}>{choice.title}</span>
                  <span style={styles.choiceDesc}>{choice.desc}</span>
                </span>
                {busy && <Loader size={16} style={{ marginLeft: 'auto', animation: 'spin 1s linear infinite' }} />}
              </button>
            ))}
          </div>
          <div style={styles.skip} onClick={() => navigate('/dashboard')}>
            Keyinroq hal qilaman
          </div>
        </div>
      </div>
    );
  }

  // ── Natija ekrani ──
  if (phase === 'result') {
    const lv = jlptName(result?.estimatedLevel);
    return (
      <div style={styles.page}>
        <div style={styles.resultCard} className="anim-pop">
          <img src="/mascot/detective.png" alt="" style={styles.mascotImg} />
          <h1 style={styles.resultTitle}>Darajangiz aniqlandi!</h1>
          <div style={styles.levelBadge}>{lv}</div>
          {result?.answeredCount > 0 && (
            <p style={styles.resultSub}>{result.correctCount}/{result.answeredCount} ta to'g'ri javob</p>
          )}
          <p style={styles.resultHint}>Roadmap'da {lv} gacha barcha darajalar ochildi</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <Button variant="primary" size="lg" full onClick={() => navigate('/goal-setup')}>Davom etish</Button>
            <Button variant="ghost" full onClick={() => navigate('/dashboard')}>Bosh sahifaga</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Test ekrani ──
  if (busy && questions.length === 0) {
    return <div style={styles.page}><Loader size={28} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} /></div>;
  }

  const q = questions[current];
  if (!q) {
    return <div style={styles.page}><Loader size={28} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} /></div>;
  }
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div style={styles.page}>
      <div style={styles.card} className="anim-scale-in">
        <div style={styles.header}>
          <button style={styles.closeBtn} className="press" onClick={() => navigate('/dashboard')}><X size={20} /></button>
          <ProgressBar percent={progress} />
          <span style={styles.pill}>{mode === 'auto' ? `Bosqich: ${stage}` : q.level}</span>
        </div>
        <div style={styles.count}>
          {current + 1} / {questions.length} savol
          {busy && <Loader size={13} style={{ marginLeft: 8, animation: 'spin 1s linear infinite', verticalAlign: 'middle' }} />}
        </div>

        <div style={styles.wordCard}>
          <div style={styles.wordJp} className="jp">{q.prompt}</div>
        </div>

        <div style={styles.options}>
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              className="press"
              style={{
                ...styles.optionBtn,
                ...(picked === idx ? styles.optionPicked : {}),
              }}
              onClick={() => handlePick(idx)}
              disabled={picked !== null || busy}
            >
              {opt}
            </button>
          ))}
        </div>

        <div style={styles.skip} onClick={() => handlePick(-1)}>
          Bu savolni <span style={{ color: 'var(--primary)', fontWeight: 800 }}>tashlab ketish</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-alt)', padding: 20 },
  card: { background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 24, padding: 24, maxWidth: 460, width: '100%', boxShadow: 'var(--shadow-lg)' },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  closeBtn: { background: 'var(--bg-alt)', border: '2px solid var(--border)', borderRadius: 12, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0, cursor: 'pointer' },
  pill: { fontSize: 13, fontWeight: 900, color: 'var(--primary-dark)', background: 'var(--primary-soft)', borderRadius: 999, padding: '6px 12px', flexShrink: 0, whiteSpace: 'nowrap' },
  count: { fontSize: 13, color: 'var(--text-light)', fontWeight: 700, marginBottom: 20, textAlign: 'right' },
  wordCard: { textAlign: 'center', padding: '32px 20px', background: 'var(--bg-alt)', borderRadius: 20, border: '2px solid var(--border)', marginBottom: 16 },
  wordJp: { fontSize: 24, fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 },
  options: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
  optionBtn: {
    padding: '14px 16px', borderRadius: 14, border: '2px solid var(--border)',
    background: 'var(--bg-card)', color: 'var(--text)', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease',
  },
  optionPicked: { background: 'var(--primary-soft)', border: '2px solid var(--primary)', color: 'var(--primary-dark)' },
  skip: { textAlign: 'center', fontSize: 13, color: 'var(--text-light)', cursor: 'pointer', fontWeight: 600 },

  pickTitle: { fontSize: 22, fontWeight: 900, color: 'var(--text)', textAlign: 'center', marginBottom: 6 },
  pickSub: { fontSize: 14, color: 'var(--text-light)', fontWeight: 600, textAlign: 'center', marginBottom: 18 },
  choices: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 },
  choiceBtn: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
    borderRadius: 16, border: '2px solid var(--border)', background: 'var(--bg-card)',
    cursor: 'pointer', width: '100%',
  },
  choiceIcon: { fontSize: 26, flexShrink: 0 },
  choiceTitle: { display: 'block', fontSize: 15, fontWeight: 800, color: 'var(--text)' },
  choiceDesc: { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-light)', marginTop: 2 },
  errorBox: {
    background: 'rgba(244,67,54,0.08)', border: '1.5px solid var(--danger)', color: 'var(--danger)',
    borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: 12, textAlign: 'center',
  },

  resultCard: { background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 24, padding: '40px 32px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-lg)' },
  resultTitle: { fontSize: 24, fontWeight: 900, color: 'var(--text)', marginBottom: 16 },
  levelBadge: { fontSize: 52, fontWeight: 900, color: 'var(--primary)', background: 'var(--primary-soft)', borderRadius: 20, padding: '10px 36px', display: 'inline-block', marginBottom: 12, minWidth: 120 },
  resultSub: { fontSize: 15, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 4 },
  resultHint: { fontSize: 13, color: 'var(--text-light)', fontWeight: 600, marginBottom: 8 },
  mascotImg: { width: 100, height: 100, objectFit: 'contain', marginBottom: 16 },
};
