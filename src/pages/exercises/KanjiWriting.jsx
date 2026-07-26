import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getKanjiById } from '../../api/dictionary';
import { submitKanjiWriting } from '../../api/lessons';
import ErrorState from '../../components/ErrorState';
import { ArrowLeft, RotateCcw, Eye, Loader } from 'lucide-react';

// KanjiVG SVG'dan har stroke'ning boshlanish/tugash nuqtasi va yo'nalishini oladi
// (0..1 ga normalizatsiya qilingan — KanjiVG koordinata maydoni 109×109).
async function parseReferenceStrokes(url) {
  const res = await fetch(url);
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const group = doc.querySelector('[id^="kvg:StrokePaths"]') || doc;
  const paths = [...group.querySelectorAll('path')];
  const NS = 'http://www.w3.org/2000/svg';
  return paths.map(p => {
    const el = document.createElementNS(NS, 'path');
    el.setAttribute('d', p.getAttribute('d') || '');
    let len = 0;
    try { len = el.getTotalLength(); } catch { /* ignore */ }
    const s = len ? el.getPointAtLength(0) : { x: 0, y: 0 };
    const e = len ? el.getPointAtLength(len) : { x: 0, y: 0 };
    const m = len ? el.getPointAtLength(len / 2) : { x: 0, y: 0 };
    return {
      sx: s.x / 109, sy: s.y / 109,
      mx: m.x / 109, my: m.y / 109,
      ex: e.x / 109, ey: e.y / 109,
    };
  });
}

// Ikki stroke'ni tartib + yo'nalish + joylashuv bo'yicha 0..1 ball bilan solishtiradi.
function scoreStroke(ref, drawn) {
  const rAng = Math.atan2(ref.ey - ref.sy, ref.ex - ref.sx);
  const dAng = Math.atan2(drawn.ey - drawn.sy, drawn.ex - drawn.sx);
  let diff = Math.abs(rAng - dAng);
  if (diff > Math.PI) diff = 2 * Math.PI - diff;
  const dirScore = Math.max(0, 1 - diff / (Math.PI / 2));           // 90°+ og'ish → 0
  const posDist = (Math.hypot(ref.sx - drawn.sx, ref.sy - drawn.sy) +
                   Math.hypot(ref.ex - drawn.ex, ref.ey - drawn.ey)) / 2;
  const posScore = Math.max(0, 1 - posDist / 0.6);                  // ~0.6 birlik dopusk
  return 0.6 * dirScore + 0.4 * posScore;
}

export default function KanjiWriting() {
  const navigate = useNavigate();
  const { id } = useParams(); // kanjiId
  const [kanji, setKanji] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [strokesDrawn, setStrokesDrawn] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [resultXp, setResultXp] = useState(null);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getKanjiById(id)
      .then(k => {
        setKanji({
          id: k.id,
          character: k.character,
          reading: [...(k.kunyomi || []), ...(k.onyomi || [])].join(' / '),
          meaning: (k.meaningsUz?.length ? k.meaningsUz : k.meanings || []).slice(0, 2).join(', '),
          strokeCount: k.strokeCount || 1,
          strokeOrderUrl: k.strokeOrderUrl,
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Canvas chizish (pointer events) ──
  const getPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e) => {
    if (completed) return;
    e.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
    canvasRef.current?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const p = getPoint(e);
    ctx.strokeStyle = '#2b2b3d';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPointRef.current = p;
  };

  const handlePointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    setStrokesDrawn(s => s + 1);
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setStrokesDrawn(0);
  }, []);

  const handleCheck = () => {
    if (strokesDrawn === 0) return;
    const total = kanji.strokeCount;
    // Chizilgan chiziqlar soni to'g'ri songa qanchalik yaqin — shuncha yuqori ball
    const correctStrokes = Math.min(strokesDrawn, total);
    const overshoot = Math.max(0, strokesDrawn - total);
    const score = Math.max(0, Math.round((correctStrokes / total) * 100) - overshoot * 10);
    setCompleted(true);

    if (kanji?.id) {
      // §11.5 — POST /exercises/kanji-writing { kanjiId, score, strokeCount, correctStrokes }
      submitKanjiWriting(kanji.id, score, total, correctStrokes)
        .then(res => setResultXp(res?.xpEarned ?? null))
        .catch(() => {});
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!kanji) return null;

  if (completed) {
    return (
      <div style={styles.page} className="stagger">
        <div style={styles.resultCard}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✍️</div>
          <h2 style={styles.resultTitle}>Yaxshi yozdingiz!</h2>
          <div style={styles.resultKanji} className="jp">{kanji.character}</div>
          {resultXp !== null && <div style={styles.xpBadge}>+{resultXp} XP</div>}
          <div style={styles.resultBtns}>
            <button style={styles.secBtn} onClick={() => { setCompleted(false); setResultXp(null); setTimeout(clearCanvas, 0); }}>
              <RotateCcw size={16} /> Qayta yozish
            </button>
            <button style={styles.btn} onClick={() => navigate(-1)}>Davom etish</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <span style={styles.headerTitle}>Kanji yozish</span>
        <button style={styles.hintBtn} onClick={() => setShowGuide(!showGuide)}>
          <Eye size={14} /> {showGuide ? "Yashirish" : "Ko'rsatish"}
        </button>
      </div>

      <div style={styles.refRow}>
        <div style={styles.refKanji} className="jp">{kanji.character}</div>
        <div>
          <div style={styles.refReading} className="jp">{kanji.reading}</div>
          <div style={styles.refMeaning}>{kanji.meaning}</div>
        </div>
      </div>

      <div style={styles.canvasWrap}>
        {showGuide && <div style={styles.guideChar} className="jp">{kanji.character}</div>}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          style={styles.canvas}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {strokesDrawn === 0 && <div style={styles.canvasLabel}>Shu yerga yozing</div>}
      </div>

      <div style={styles.strokeRow}>
        {Array.from({ length: kanji.strokeCount }, (_, i) => (
          <div key={i} style={{
            ...styles.strokeItem,
            ...(i < strokesDrawn ? styles.strokeDone : {}),
            ...(i === strokesDrawn ? styles.strokeCurrent : {}),
          }}>
            {i + 1}
          </div>
        ))}
      </div>
      <div style={styles.strokeInfo}>{strokesDrawn}/{kanji.strokeCount} chiziq chizildi</div>

      <div style={styles.actions}>
        <button style={styles.actionBtn} onClick={clearCanvas}>
          <RotateCcw size={16} /> Qayta boshlash
        </button>
      </div>

      <button style={{ ...styles.ctaBtn, opacity: strokesDrawn === 0 ? 0.5 : 1 }} onClick={handleCheck} disabled={strokesDrawn === 0}>
        Tekshirish ✓
      </button>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 500, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: 10 },
  backBtn: { background: 'none', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700, color: 'var(--text)' },
  hintBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, background: 'rgba(33,150,243,0.1)', border: '1px solid rgba(33,150,243,0.2)', color: '#1565C0', fontSize: 10, fontWeight: 700, cursor: 'pointer' },
  refRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '4px 0' },
  refKanji: { fontSize: 40, fontWeight: 900, color: 'var(--primary)' },
  refReading: { fontSize: 14, color: '#2196F3', fontWeight: 600 },
  refMeaning: { fontSize: 12, color: 'var(--text-light)', marginTop: 2 },
  canvasWrap: { height: 280, background: 'var(--bg-card)', border: '2px solid var(--border-light)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow)' },
  canvas: { width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair', position: 'relative', zIndex: 1 },
  guideChar: { fontSize: 180, fontWeight: 900, color: 'rgba(88,204,2,0.07)', userSelect: 'none', position: 'absolute', zIndex: 0, pointerEvents: 'none' },
  canvasLabel: { fontSize: 12, color: 'var(--text-light)', position: 'absolute', bottom: 12, pointerEvents: 'none' },
  strokeRow: { display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' },
  strokeItem: { width: 32, height: 32, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-light)' },
  strokeDone: { background: 'rgba(88,204,2,0.1)', borderColor: 'var(--primary)', color: 'var(--primary)' },
  strokeCurrent: { border: '2px solid var(--primary)', color: 'var(--primary)', boxShadow: '0 0 12px rgba(88,204,2,0.2)' },
  strokeInfo: { textAlign: 'center', fontSize: 12, color: 'var(--text-light)' },
  actions: { display: 'flex', gap: 8 },
  actionBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 10, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border-light)', color: 'var(--text-light)', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  ctaBtn: { padding: 14, borderRadius: 14, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', textAlign: 'center' },
  resultCard: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 20, padding: 40, boxShadow: 'var(--shadow-lg)' },
  resultTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 12 },
  resultKanji: { fontSize: 64, fontWeight: 900, color: 'var(--primary)', marginBottom: 12 },
  xpBadge: { display: 'inline-block', padding: '6px 16px', borderRadius: 12, background: 'rgba(167,139,250,0.12)', color: '#7C3AED', fontSize: 14, fontWeight: 700, marginBottom: 16 },
  resultBtns: { display: 'flex', gap: 8, justifyContent: 'center' },
  btn: { padding: '13px 24px', borderRadius: 12, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' },
  secBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '13px 18px', borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
};
