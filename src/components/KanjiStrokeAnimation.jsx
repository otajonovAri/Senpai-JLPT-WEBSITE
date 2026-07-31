import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Loader } from 'lucide-react';

const SPEEDS = { slow: 1200, normal: 700, fast: 350 };
const GAP = 250;
const FRAME = 16;

function parseSvgStrokes(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const strokeGroup = doc.querySelector('[id^="kvg:StrokePaths"]');
  const paths = strokeGroup ? [...strokeGroup.querySelectorAll('path')] : [];
  const numGroup = doc.querySelector('[id^="kvg:StrokeNumbers"]');
  const texts = numGroup ? [...numGroup.querySelectorAll('text')] : [];

  return paths.map((p, i) => {
    const d = p.getAttribute('d');
    let nx = 0, ny = 0;
    if (texts[i]) {
      const t = texts[i].getAttribute('transform') || '';
      const m = t.match(/matrix\([^)]*\s+([\d.]+)\s+([\d.]+)\)/);
      if (m) { nx = parseFloat(m[1]); ny = parseFloat(m[2]); }
    }
    return { d, nx, ny, num: i + 1 };
  });
}

export default function KanjiStrokeAnimation({
  character,
  strokeCount = 1,
  strokeOrderUrl,
  size = 200,
  speed = 'normal',
  autoPlay = false,
}) {
  const [strokes, setStrokes] = useState([]);
  const [lengths, setLengths] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [curSpeed, setCurSpeed] = useState(speed);

  const [phase, setPhase] = useState('idle');
  const [strokeIdx, setStrokeIdx] = useState(-1);
  const [progress, setProgress] = useState(0);

  const pathRefs = useRef([]);
  const timerRef = useRef(null);
  const animState = useRef({ startTime: 0, pausedAt: 0, count: 0, dur: SPEEDS[speed] });

  useEffect(() => { animState.current.dur = SPEEDS[curSpeed] || SPEEDS.normal; }, [curSpeed]);

  useEffect(() => {
    if (!strokeOrderUrl) { setFallback(true); return; }
    setFetching(true);
    setFallback(false);
    setStrokes([]);
    setLengths([]);
    pathRefs.current = [];
    stopTimer();
    setPhase('idle');
    setStrokeIdx(-1);
    setProgress(0);

    fetch(strokeOrderUrl)
      .then(r => { if (!r.ok) throw new Error(); return r.text(); })
      .then(txt => {
        const parsed = parseSvgStrokes(txt);
        if (parsed.length === 0) { setFallback(true); return; }
        setStrokes(parsed);
        animState.current.count = parsed.length;
        pathRefs.current = new Array(parsed.length).fill(null);
      })
      .catch(() => setFallback(true))
      .finally(() => setFetching(false));
  }, [strokeOrderUrl, character]);

  useEffect(() => {
    if (strokes.length === 0) return;
    const t = setTimeout(() => {
      const lens = pathRefs.current.map(el => (el ? el.getTotalLength() : 100));
      setLengths(lens);
      if (autoPlay) startPlaying();
    }, 50);
    return () => clearTimeout(t);
  }, [strokes]);

  useEffect(() => {
    stopTimer();
    setPhase('idle');
    setStrokeIdx(-1);
    setProgress(0);
  }, [character]);

  useEffect(() => () => stopTimer(), []);

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function startPlaying() {
    stopTimer();
    const a = animState.current;
    a.startTime = performance.now();
    a.pausedAt = 0;
    setStrokeIdx(0);
    setProgress(0);
    setPhase('playing');

    timerRef.current = setInterval(() => {
      const now = performance.now();
      const elapsed = (now - a.startTime);
      const cycle = a.dur + GAP;
      const total = a.count * cycle - GAP;

      if (elapsed >= total) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setStrokeIdx(a.count - 1);
        setProgress(1);
        setPhase('done');
        return;
      }

      const idx = Math.min(Math.floor(elapsed / cycle), a.count - 1);
      const within = elapsed - idx * cycle;
      const p = Math.min(within / a.dur, 1);
      setStrokeIdx(idx);
      setProgress(p);
    }, FRAME);
  }

  function pausePlaying() {
    const a = animState.current;
    a.pausedAt = performance.now() - a.startTime;
    stopTimer();
    setPhase('paused');
  }

  function resumePlaying() {
    const a = animState.current;
    a.startTime = performance.now() - a.pausedAt;
    setPhase('playing');

    timerRef.current = setInterval(() => {
      const now = performance.now();
      const elapsed = now - a.startTime;
      const cycle = a.dur + GAP;
      const total = a.count * cycle - GAP;

      if (elapsed >= total) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setStrokeIdx(a.count - 1);
        setProgress(1);
        setPhase('done');
        return;
      }

      const idx = Math.min(Math.floor(elapsed / cycle), a.count - 1);
      const within = elapsed - idx * cycle;
      const p = Math.min(within / a.dur, 1);
      setStrokeIdx(idx);
      setProgress(p);
    }, FRAME);
  }

  function togglePlay() {
    if (phase === 'playing') pausePlaying();
    else if (phase === 'paused') resumePlaying();
    else startPlaying();
  }

  function resetAnim() {
    stopTimer();
    setPhase('idle');
    setStrokeIdx(-1);
    setProgress(0);
  }

  function skipNext() {
    const a = animState.current;
    const nextIdx = (strokeIdx < 0 ? 0 : strokeIdx) + 1;
    if (nextIdx >= a.count) {
      stopTimer();
      setStrokeIdx(a.count - 1);
      setProgress(1);
      setPhase('done');
      return;
    }
    const cycle = a.dur + GAP;
    a.startTime = performance.now() - nextIdx * cycle;
    a.pausedAt = nextIdx * cycle;
    setStrokeIdx(nextIdx);
    setProgress(0);
  }

  if (fallback) {
    return <FallbackAnim character={character} strokeCount={strokeCount} size={size}
      speed={curSpeed} onSpeedChange={setCurSpeed} />;
  }

  if (fetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
        <Loader size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
      </div>
    );
  }

  if (strokes.length === 0) return null;

  return (
    <div style={st.wrapper}>
      <div style={{ ...st.box, width: size, height: size }}>
        <svg viewBox="0 0 109 109" width={size} height={size} style={{ display: 'block' }}>
          <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1="0" x2="109" y2="109" stroke="var(--border-light)" strokeWidth="0.3" strokeDasharray="3 3" opacity="0.4" />
          <line x1="109" y1="0" x2="0" y2="109" stroke="var(--border-light)" strokeWidth="0.3" strokeDasharray="3 3" opacity="0.4" />

          {strokes.map((stroke, i) => {
            const len = lengths[i] || 100;
            const done = i < strokeIdx || (i === strokeIdx && progress >= 1);
            const active = i === strokeIdx && progress < 1;
            const visible = done || active;

            return (
              <path
                key={i}
                ref={el => { pathRefs.current[i] = el; }}
                d={stroke.d}
                fill="none"
                stroke={visible ? (active ? 'var(--primary)' : 'var(--text)') : 'transparent'}
                strokeWidth={active ? 3.5 : 3}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={len}
                strokeDashoffset={active ? len * (1 - progress) : (done ? 0 : len)}
              />
            );
          })}

          {strokes.map((stroke, i) => {
            const done = i < strokeIdx || (i === strokeIdx && progress >= 1);
            const active = i === strokeIdx && progress < 1;
            if (!done && !active) return null;
            return (
              <g key={`n${i}`}>
                <circle cx={stroke.nx + 4} cy={stroke.ny - 3} r={5.5}
                  fill={active ? 'var(--primary)' : 'rgba(0,0,0,0.55)'} />
                <text x={stroke.nx + 4} y={stroke.ny + 0.5}
                  textAnchor="middle" fontSize="7" fontWeight="800"
                  fill="white" style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {stroke.num}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={st.badge}>{strokeCount} chiziq</div>
      </div>

      <div style={st.controls}>
        <button style={st.btn} onClick={togglePlay} title={phase === 'playing' ? 'Pauza' : 'Boshlash'}>
          {phase === 'playing' ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button style={st.btn} onClick={resetAnim} title="Qayta"><RotateCcw size={18} /></button>
        <button style={st.btn} onClick={skipNext} title="Keyingi chiziq" disabled={phase === 'done'}>
          <SkipForward size={18} />
        </button>
        <select value={curSpeed} onChange={e => { setCurSpeed(e.target.value); resetAnim(); }} style={st.sel}>
          <option value="slow">Sekin</option>
          <option value="normal">Normal</option>
          <option value="fast">Tez</option>
        </select>
      </div>

      <div style={st.phase}>
        {phase === 'idle' && 'Boshlash uchun ▶ bosing'}
        {phase === 'playing' && `Chiziq ${strokeIdx + 1} / ${strokes.length}`}
        {phase === 'paused' && `Pauza — ${strokeIdx + 1} / ${strokes.length}`}
        {phase === 'done' && `Tayyor! ${strokes.length} ta chiziq`}
      </div>
    </div>
  );
}

function FallbackAnim({ character, strokeCount, size, speed, onSpeedChange }) {
  const [phase, setPhase] = useState('idle');
  const [dashOff, setDashOff] = useState(1);
  const [fill, setFill] = useState(0);
  const timerRef = useRef(null);
  const startRef = useRef(0);
  const dur = SPEEDS[speed] || SPEEDS.normal;

  function resetFb() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPhase('idle'); setDashOff(1); setFill(0);
  }

  function playFb() {
    if (phase === 'done') { setDashOff(1); setFill(0); }
    startRef.current = performance.now();
    setPhase('stroke');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = performance.now() - startRef.current;
      if (phase === 'fill' || elapsed > dur) {
        const fillElapsed = elapsed - dur;
        const fp = Math.min(fillElapsed / 600, 1);
        setDashOff(0);
        setFill(fp);
        if (fp >= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setPhase('done');
        } else {
          setPhase('fill');
        }
        return;
      }
      setDashOff(1 - Math.min(elapsed / dur, 1));
    }, FRAME);
  }

  useEffect(() => { resetFb(); }, [character]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <div style={st.wrapper}>
      <div style={{ ...st.box, width: size, height: size }}>
        <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block' }}>
          <line x1="100" y1="0" x2="100" y2="200" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="0" y1="100" x2="200" y2="100" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="4 4" />
          <text x="100" y="155" textAnchor="middle" fontSize="140"
            fontFamily="'Noto Sans JP','Yu Mincho',serif" fill="var(--text)"
            style={{ opacity: fill }}>{character}</text>
          <text x="100" y="155" textAnchor="middle" fontSize="140"
            fontFamily="'Noto Sans JP','Yu Mincho',serif" fill="none"
            stroke="var(--primary)" strokeWidth="1.5"
            style={{ strokeDasharray: 800, strokeDashoffset: 800 * dashOff }}>{character}</text>
        </svg>
        <div style={st.badge}>{strokeCount} chiziq</div>
      </div>
      <div style={st.controls}>
        <button style={st.btn} onClick={() => phase === 'stroke' || phase === 'fill' ? resetFb() : playFb()}>
          {phase === 'stroke' || phase === 'fill' ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button style={st.btn} onClick={resetFb}><RotateCcw size={18} /></button>
        <select value={speed} onChange={e => { onSpeedChange?.(e.target.value); resetFb(); }} style={st.sel}>
          <option value="slow">Sekin</option>
          <option value="normal">Normal</option>
          <option value="fast">Tez</option>
        </select>
      </div>
      <div style={st.phase}>
        {phase === 'idle' && 'Boshlash uchun ▶ bosing'}
        {phase === 'stroke' && 'Chizilmoqda...'}
        {phase === 'fill' && "To'ldirilmoqda..."}
        {phase === 'done' && 'Tayyor!'}
      </div>
    </div>
  );
}

const st = {
  wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  box: {
    position: 'relative', background: 'var(--bg-card)',
    border: '2px solid var(--border)', borderRadius: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  badge: {
    position: 'absolute', bottom: 8, right: 10,
    background: 'rgba(88,204,2,0.1)', borderRadius: 8,
    padding: '3px 8px', fontSize: 10, color: 'var(--primary)', fontWeight: 700,
  },
  controls: { display: 'flex', alignItems: 'center', gap: 8 },
  btn: {
    width: 36, height: 36, borderRadius: 10,
    border: '2px solid var(--border)',
    background: 'var(--bg-card)', color: 'var(--text)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  sel: {
    padding: '6px 10px', borderRadius: 8,
    border: '2px solid var(--border)',
    background: 'var(--bg-card)', color: 'var(--text)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none',
  },
  phase: { fontSize: 11, color: 'var(--text-light)', fontWeight: 600 },
};
