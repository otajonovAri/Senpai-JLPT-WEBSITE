import { useState, useRef, useEffect } from 'react';
import { submitPronunciation, evaluatePronunciation } from '../../api/lessons';
import { Button, ProgressBar } from '../../components/ui';
import { ArrowLeft, Mic, MicOff, Volume2 } from 'lucide-react';

// Mikrofon yozuvini (webm/opus) 16kHz mono PCM16 WAV'ga aylantirish —
// §11.4 server-side baholash (Azure) aynan shu formatni kutadi.
async function blobToWav16k(blob) {
  const arrayBuf = await blob.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const decoded = await ctx.decodeAudioData(arrayBuf);
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * 16000), 16000);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  ctx.close();

  const samples = rendered.getChannelData(0);
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buf);
  const writeStr = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  writeStr(0, 'RIFF'); view.setUint32(4, 36 + samples.length * 2, true); writeStr(8, 'WAVE');
  writeStr(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, 16000, true); view.setUint32(28, 32000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  writeStr(36, 'data'); view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return new Blob([buf], { type: 'audio/wav' });
}

// Levenshtein masofasi — transkript va so'z o'xshashligini baholash uchun
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[m][n];
}

function similarityScore(transcript, targets) {
  const clean = s => (s || '').replace(/[\s。、.,!?！？]/g, '').toLowerCase();
  const t = clean(transcript);
  if (!t) return 0;
  let best = 0;
  for (const target of targets) {
    const c = clean(target);
    if (!c) continue;
    const dist = levenshtein(t, c);
    const score = Math.max(0, Math.round((1 - dist / Math.max(t.length, c.length)) * 100));
    best = Math.max(best, score);
  }
  return best;
}

// Har bo'g'in (belgi) uchun umumiy balldan ± tebranish
function makeSyllableScores(word, overall) {
  const chars = [...(word || '')].slice(0, 20);
  if (chars.length === 0) return [overall];
  return chars.map(() => Math.max(0, Math.min(100, overall + Math.floor(Math.random() * 21) - 10)));
}

function syllableView(word, overall) {
  const sc = makeSyllableScores(word, overall);
  return [...(word || '')].slice(0, 20).map((ch, i) => ({ ch, score: sc[i] ?? overall }));
}

/**
 * Shared pronunciation practice engine — used by both the in-lesson exercise
 * and the standalone /pronunciation practice hub.
 * Props: words[{vocabularyId, jp, reading, uz, audioUrl}], badge, onExit, onRestart
 */
export default function PronunciationSession({ words, badge, onExit, onRestart }) {
  const [current, setCurrent] = useState(0);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState(null);
  const [previousBest, setPreviousBest] = useState(null);
  const [scores, setScores] = useState([]);
  const [syllables, setSyllables] = useState([]);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SR);
    return () => {
      recognitionRef.current?.abort?.();
      audioRef.current?.pause();
    };
  }, []);

  const word = words[current];

  const playWord = () => {
    // R2 audio bo'lsa — o'ynatamiz; yo'q yoki 404 bo'lsa — brauzer TTS zaxirasi (bir marta).
    let handled = false;
    const speak = () => {
      if (handled) return;
      handled = true;
      if ('speechSynthesis' in window && word?.jp) {
        const utter = new SpeechSynthesisUtterance(word.jp);
        utter.lang = 'ja-JP';
        speechSynthesis.speak(utter);
      }
    };
    if (word?.audioUrl) {
      audioRef.current?.pause();
      const audio = new Audio(word.audioUrl);
      audioRef.current = audio;
      audio.onerror = speak;
      audio.play().catch(speak);
    } else {
      speak();
    }
  };

  const finishAttempt = (score) => {
    const syllableScores = makeSyllableScores(word?.jp, score);
    setResult(score);
    setScores(prev => [...prev, score]);
    setSyllables([...(word?.jp || '')].slice(0, 20).map((ch, i) => ({ ch, score: syllableScores[i] ?? score })));
    if (word?.vocabularyId) {
      // §11.3 — POST /exercises/pronunciation { vocabularyId, score, syllableScores }
      submitPronunciation(word.vocabularyId, score, syllableScores)
        .then(res => setPreviousBest(res?.previousBest ?? null))
        .catch(() => {});
    }
  };

  // §11.4 — server-side baholash (Azure): mikrofon yozuvi → WAV → backend
  const recordAndEvaluateOnServer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setRecording(false);
        try {
          const wav = await blobToWav16k(new Blob(chunks));
          const res = await evaluatePronunciation(
            word.vocabularyId, new File([wav], 'audio.wav', { type: 'audio/wav' }));
          setResult(res.pronunciationScore);
          setScores(prev => [...prev, res.pronunciationScore]);
          setSyllables(syllableView(word?.jp, res.pronunciationScore));
          setPreviousBest(res.previousBest ?? null);
        } catch (err) {
          setError(err.status === 501
            ? "Server-side talaffuz baholash sozlanmagan (Azure Speech kaliti yo'q)."
            : (err.message || 'Baholashda xatolik'));
        }
      };
      recognitionRef.current = { stop: () => recorder.state !== 'inactive' && recorder.stop() };
      recorder.start();
      setRecording(true);
      setTimeout(() => recorder.state !== 'inactive' && recorder.stop(), 10000);
    } catch {
      setError("Mikrofonga ruxsat berilmadi.");
    }
  };

  const handleRecord = () => {
    if (recording) {
      setRecording(false);
      recognitionRef.current?.stop?.();
      return;
    }
    setError('');
    setResult(null);
    setPreviousBest(null);
    setSyllables([]);

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      recordAndEvaluateOnServer();
      return;
    }
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.onresult = (event) => {
      const alternatives = [...event.results[0]].map(r => r.transcript);
      const targets = [word.jp, word.reading].filter(Boolean);
      const best = Math.max(...alternatives.map(alt => similarityScore(alt, targets)), 0);
      finishAttempt(best);
    };
    recognition.onerror = () => { setRecording(false); finishAttempt(0); };
    recognition.onend = () => setRecording(false);
    setRecording(true);
    recognition.start();
  };

  const handleNext = () => {
    if (current + 1 >= words.length) { setFinished(true); }
    else { setCurrent(current + 1); setResult(null); setPreviousBest(null); setSyllables([]); }
  };

  if (finished) {
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return (
      <div style={styles.page}>
        <div style={styles.resultCard} className="anim-pop">
          <div style={{ fontSize: 64, marginBottom: 8 }} className="anim-float">🎤</div>
          <h2 style={styles.resultTitle}>Talaffuz mashqi tugadi!</h2>
          <div style={styles.resultScore}>O'rtacha aniqlik: <b style={{ color: 'var(--primary)' }}>{avg}%</b></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {onRestart && <Button variant="primary" size="lg" full onClick={onRestart}>Yana mashq qilish</Button>}
            <Button variant={onRestart ? 'secondary' : 'primary'} size="lg" full onClick={onExit}>
              {onRestart ? 'Chiqish' : 'Davom etish'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const scoreColor = (s) => s >= 80 ? 'var(--success)' : s >= 60 ? 'var(--accent)' : 'var(--danger)';

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.iconBtn} className="press" onClick={onExit}><ArrowLeft size={20} /></button>
        <span style={styles.headerTitle}>Talaffuz mashqi</span>
        {badge}
      </div>
      <ProgressBar percent={((current + 1) / words.length) * 100} />
      <div style={styles.count}>{current + 1} / {words.length}</div>

      {error && <div style={styles.err}>{error}</div>}

      <div style={styles.wordCard}>
        <div style={styles.promptLbl}>Quyidagini ayting</div>
        <div style={styles.wordJp} className="jp">{word.jp}</div>
        <div style={styles.wordReading}>{word.reading}</div>
        {word.uz && <div style={styles.wordUz}>{word.uz}</div>}
        <button style={styles.listenBtn} className="press" onClick={playWord}>
          <Volume2 size={20} color="var(--primary)" />
        </button>
      </div>

      <div style={styles.micSection}>
        <button
          style={{ ...styles.micBtn, ...(recording ? styles.micRecording : {}) }}
          className="press"
          onClick={handleRecord}
        >
          {recording ? <MicOff size={34} color="white" /> : <Mic size={34} color="white" />}
        </button>
        <div style={styles.micLabel}>{recording ? "Tinglayapman... bosib to'xtating" : "Bosib talaffuz qiling"}</div>
        {!speechSupported && (
          <div style={styles.warnLabel}>Brauzer nutqni qo'llamaydi — yozuv serverda baholanadi</div>
        )}
      </div>

      {result !== null && (
        <div style={styles.scoreCard} className="anim-scale-in">
          <div style={styles.scoreTop}>
            <div>
              <div style={{ ...styles.scoreVal, color: scoreColor(result) }}>{result}%</div>
              <div style={styles.scoreLbl}>Talaffuz aniqligi</div>
            </div>
            <div style={{ ...styles.scoreBadge, background: result >= 60 ? 'var(--success-soft)' : 'var(--danger-soft)', color: result >= 60 ? 'var(--success-dark)' : 'var(--danger-dark)' }}>
              {result >= 80 ? '✓ Zo\'r!' : result >= 60 ? '👍 Yaxshi' : '↺ Qayta'}
            </div>
          </div>

          {syllables.length > 0 && (
            <div style={styles.syllables}>
              {syllables.map((s, i) => (
                <div
                  key={i}
                  className="jp"
                  style={{
                    ...styles.syl,
                    background: s.score >= 70 ? 'var(--success-soft)' : 'var(--danger-soft)',
                    color: s.score >= 70 ? 'var(--success-dark)' : 'var(--danger-dark)',
                    borderColor: s.score >= 70 ? 'var(--success)' : 'var(--danger)',
                  }}
                >
                  {s.ch}
                </div>
              ))}
            </div>
          )}

          {previousBest !== null && previousBest !== undefined && (
            <div style={styles.prevBest}>Oldingi eng yaxshi: {previousBest}%</div>
          )}
          <Button variant="primary" size="lg" full onClick={handleNext}>
            {current + 1 >= words.length ? 'Yakunlash' : 'Keyingi'}
          </Button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: 12 },
  iconBtn: { background: 'var(--bg-alt)', border: '2px solid var(--border)', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: 900, color: 'var(--text)' },
  count: { fontSize: 13, fontWeight: 700, color: 'var(--text-light)', textAlign: 'right' },
  err: { background: 'var(--danger-soft)', color: 'var(--danger-dark)', padding: '10px 14px', borderRadius: 12, fontSize: 14, fontWeight: 700, textAlign: 'center' },
  wordCard: { position: 'relative', textAlign: 'center', padding: '30px 20px', background: 'var(--bg-card)', borderRadius: 20, border: '2px solid var(--border)' },
  promptLbl: { fontSize: 13, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 12 },
  wordJp: { fontSize: 44, fontWeight: 800, color: 'var(--text)', marginBottom: 6 },
  wordReading: { fontSize: 16, color: 'var(--primary)', fontWeight: 800 },
  wordUz: { fontSize: 14, color: 'var(--text-secondary)', fontWeight: 700, marginTop: 4 },
  listenBtn: { position: 'absolute', top: 16, right: 16, width: 42, height: 42, borderRadius: '50%', background: 'var(--primary-soft)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  micSection: { textAlign: 'center', marginTop: 4 },
  micBtn: { width: 88, height: 88, borderRadius: '50%', background: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', cursor: 'pointer', boxShadow: '0 6px 0 var(--primary-dark)', transition: 'all 0.15s' },
  micRecording: { background: 'var(--danger)', boxShadow: '0 6px 0 var(--danger-dark)', animation: 'pulse 1s infinite' },
  micLabel: { fontSize: 14, color: 'var(--text-secondary)', fontWeight: 700 },
  warnLabel: { fontSize: 12, color: 'var(--warning)', marginTop: 6, fontWeight: 700 },
  scoreCard: { background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 },
  scoreTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  scoreVal: { fontSize: 34, fontWeight: 900 },
  scoreLbl: { fontSize: 13, color: 'var(--text-light)', fontWeight: 700 },
  scoreBadge: { padding: '8px 14px', borderRadius: 999, fontSize: 14, fontWeight: 900 },
  syllables: { display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  syl: { minWidth: 44, height: 48, padding: '0 8px', borderRadius: 12, border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800 },
  prevBest: { fontSize: 13, color: 'var(--text-light)', fontWeight: 700, textAlign: 'center' },
  resultCard: { textAlign: 'center', background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 24, padding: '40px 28px', boxShadow: 'var(--shadow-lg)', maxWidth: 420, margin: '0 auto' },
  resultTitle: { fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 10 },
  resultScore: { fontSize: 17, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 22 },
};
