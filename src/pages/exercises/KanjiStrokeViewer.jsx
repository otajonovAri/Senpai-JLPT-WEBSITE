import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getKanjiById, searchKanji } from '../../api/dictionary';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import KanjiStrokeAnimation from '../../components/KanjiStrokeAnimation';
import ErrorState from '../../components/ErrorState';
import { ChevronLeft, ChevronRight, RotateCcw, Loader, Eye, EyeOff } from 'lucide-react';

export default function KanjiStrokeViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Mashq rejimida animatsiya va chizish maydoni yonma-yon turadi —
  // foydalanuvchi namunaga qarab turib yoza olishi uchun. Tor ekranda ustma-ust.
  const isNarrow = useMediaQuery('(max-width: 700px)');
  const [kanji, setKanji] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [siblings, setSiblings] = useState([]);   // shu darajadagi kanji ID'lari (tartibda)
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getKanjiById(id)
      .then(k => {
        if (!k) { setError('Kanji topilmadi'); return; }
        setKanji({
          id: k.id,
          character: k.character,
          meaningUz: (k.meaningsUz || []).join(', '),
          meaning: (k.meanings || []).slice(0, 3).join(', '),
          onyomi: (k.onyomi || []).join(', ') || '—',
          kunyomi: (k.kunyomi || []).join(', ') || '—',
          strokeCount: k.strokeCount || 1,
          strokeOrderUrl: k.strokeOrderUrl,
          jlptLevel: k.level,
        });
        // Oldingi/keyingi navigatsiya uchun shu darajadagi kanjilar ro'yxati (ID = UUID)
        searchKanji({ level: k.level, pageSize: 500 })
          .then(list => setSiblings((list?.items || []).map(x => x.id)))
          .catch(() => setSiblings([]));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // --- Canvas Practice ---
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (practiceMode) initCanvas();
  }, [practiceMode, initCanvas]);

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e) => {
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
    // Canvas can't resolve CSS custom properties — read the live token value.
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#2A2A3C';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPointRef.current = p;
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Kanji ID'lari UUID — tartibli ro'yxatdagi qo'shni kanjiga o'tamiz (raqam qo'shish emas)
  const curIdx = siblings.indexOf(id);
  const goTo = (offset) => {
    if (curIdx === -1) return;
    const target = siblings[curIdx + offset];
    if (target) navigate(`/kanji-stroke/${target}`);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <Loader size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
    </div>
  );
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!kanji) return null;

  const sideBySide = practiceMode && !isNarrow;

  return (
    <div
      style={{ ...styles.page, maxWidth: sideBySide ? 720 : 500 }}
      className="stagger"
    >
      {/* Header */}
      <div style={styles.header} className="anim-fade-up">
        <button style={styles.navBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <span style={styles.title}>Chiziq animatsiyasi</span>
        <span style={styles.levelBadge}>{kanji.jlptLevel}</span>
      </div>

      {/* Kanji Info */}
      <div style={styles.infoCard} className="card-interactive anim-fade-up">
        <div style={styles.infoRow}>
          <span style={styles.bigChar} className="jp">{kanji.character}</span>
          <div style={styles.infoText}>
            <div style={styles.meaning}>{kanji.meaningUz || kanji.meaning}</div>
            <div style={styles.readingRow}>
              <span style={styles.readLabel}>ON:</span>
              <span className="jp">{kanji.onyomi}</span>
            </div>
            <div style={styles.readingRow}>
              <span style={{ ...styles.readLabel, color: 'var(--primary)' }}>KUN:</span>
              <span className="jp">{kanji.kunyomi}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Mode Toggle */}
      <button
        style={{ ...styles.practiceToggle, background: practiceMode ? 'var(--primary)' : 'var(--bg-card, #fff)' }}
        onClick={() => setPracticeMode(!practiceMode)}
      >
        <span style={{ color: practiceMode ? '#fff' : 'var(--text)' }}>
          {practiceMode ? 'Mashqni yopish' : 'Mashq rejimi'}
        </span>
      </button>

      {/* Ish maydoni: chapda namuna animatsiyasi, o'ngda chizish */}
      <div style={{ ...styles.workArea, flexDirection: sideBySide ? 'row' : 'column' }}>
        <div style={styles.panel} className="anim-fade-up">
          {practiceMode && <div style={styles.panelLabel}>Namuna</div>}
          <KanjiStrokeAnimation
            character={kanji.character}
            strokeCount={kanji.strokeCount}
            strokeOrderUrl={kanji.strokeOrderUrl}
            size={180}
            autoPlay={false}
          />
        </div>

        {practiceMode && (
          <div style={styles.panel} className="anim-fade-up">
            <div style={styles.panelLabel}>Siz yozing</div>
            <div style={styles.canvasWrap}>
              {showOverlay && (
                <div style={styles.ghostOverlay} className="jp">
                  {kanji.character}
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={240}
                height={240}
                style={styles.canvas}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
              {/* Canvas grid */}
              <svg style={styles.canvasGrid} viewBox="0 0 240 240" width={240} height={240}>
                <line x1="120" y1="0" x2="120" y2="240" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="240" y2="120" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="4 4" />
              </svg>
            </div>
            <div style={styles.practiceControls}>
              <button style={styles.smallBtn} onClick={clearCanvas} title="Tozalash">
                <RotateCcw size={16} /> Tozalash
              </button>
              <button style={styles.smallBtn} onClick={() => setShowOverlay(!showOverlay)} title="Namuna">
                {showOverlay ? <EyeOff size={16} /> : <Eye size={16} />}
                {showOverlay ? 'Yashirish' : "Ko'rsatish"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={styles.navRow} className="anim-fade-up">
        <button
          style={{ ...styles.navButton, ...(curIdx > 0 ? {} : styles.navDisabled) }}
          onClick={() => goTo(-1)}
          disabled={curIdx <= 0}
        >
          <ChevronLeft size={16} /> Oldingi
        </button>
        <button
          style={{ ...styles.navButton, ...(curIdx >= 0 && curIdx < siblings.length - 1 ? {} : styles.navDisabled) }}
          onClick={() => goTo(1)}
          disabled={curIdx < 0 || curIdx >= siblings.length - 1}
        >
          Keyingi <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, margin: '0 auto', padding: '0 0 20px', transition: 'max-width 0.25s ease' },
  header: { display: 'flex', alignItems: 'center', gap: 10 },
  navBtn: { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 },
  title: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700, color: 'var(--text)' },
  levelBadge: { padding: '4px 10px', borderRadius: 12, background: 'rgba(76,175,80,0.1)', color: 'var(--success)', fontSize: 11, fontWeight: 800, letterSpacing: 0.5 },

  infoCard: { background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #eee)', borderRadius: 16, padding: 16 },
  infoRow: { display: 'flex', alignItems: 'center', gap: 16 },
  bigChar: { fontSize: 56, fontWeight: 900, color: 'var(--text)', lineHeight: 1 },
  infoText: { display: 'flex', flexDirection: 'column', gap: 4 },
  meaning: { fontSize: 16, fontWeight: 700, color: 'var(--text)' },
  readingRow: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-light)' },
  readLabel: { fontSize: 9, fontWeight: 800, letterSpacing: 0.8, color: 'var(--secondary)' },

  workArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 20,
    padding: '4px 0',
    flexWrap: 'wrap',
  },
  panel: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  panelLabel: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'var(--text-light)',
  },

  practiceToggle: {
    alignSelf: 'center',
    padding: '10px 24px',
    borderRadius: 12,
    border: '1.5px solid var(--primary)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    transition: 'all 0.2s',
  },

  canvasWrap: {
    position: 'relative',
    width: 240,
    height: 240,
    borderRadius: 16,
    border: '2px solid var(--border, #eee)',
    background: 'var(--bg-card, #fff)',
    overflow: 'hidden',
  },
  ghostOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 160,
    color: 'var(--border-light, var(--border-light))',
    pointerEvents: 'none',
    userSelect: 'none',
    lineHeight: 1,
    paddingTop: 20,
  },
  canvas: {
    position: 'relative',
    zIndex: 2,
    display: 'block',
    width: 240,
    height: 240,
    cursor: 'crosshair',
    touchAction: 'none',
  },
  canvasGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
  practiceControls: { display: 'flex', gap: 8 },
  smallBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid var(--border, #eee)',
    background: 'var(--bg-card, #fff)',
    color: 'var(--text)',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },

  navRow: { display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '10px 18px',
    borderRadius: 12,
    border: '1px solid var(--border, #eee)',
    background: 'var(--bg-card, #fff)',
    color: 'var(--text)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  navDisabled: { opacity: 0.4, cursor: 'not-allowed' },
};
