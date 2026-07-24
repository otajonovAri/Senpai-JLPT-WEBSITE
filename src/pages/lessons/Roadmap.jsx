import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoadmap, getLevels } from '../../api/lessons';
import { useLanguage } from '../../context/LanguageContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Lock, Check, Star, Loader, Navigation, ChevronUp, ChevronDown } from 'lucide-react';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const GAP = 128;
const PAD_TOP = 90;    // space above the top (last) node
const PAD_BOT = 150;   // space below the bottom (first) node

// Smooth curve through the node points (Catmull-Rom → cubic bezier).
function smoothPath(pts) {
  if (pts.length < 2) return '';
  const p = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return d;
}


export default function Roadmap() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [level, setLevel] = useState('N5');
  const [nodes, setNodes] = useState([]);
  const [unlocked, setUnlocked] = useState(true);   // joriy daraja ochiqmi
  const [levels, setLevels] = useState([]);         // barcha darajalar holati
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sceneW, setSceneW] = useState(820);
  const [locHint, setLocHint] = useState(null); // null | 'up' | 'down'

  // Daraja bosqichma-bosqich: barcha darajalar ochiq/yopiq holatini bir marta olamiz
  useEffect(() => {
    getLevels().then(data => setLevels(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const levelInfo = (lv) => levels.find(x => x.level === lv);

  // Yopiq darajaga o'tsa ham bo'ladi — lekin roadmap o'rniga "nega yopiq"
  // ekrani ko'rsatiladi (server ham unlocked=false qaytaradi, dars ko'rinmaydi).
  const selectLevel = (lv) => setLevel(lv);
  const sceneRef = useRef(null);
  const trailRef = useRef(null);
  const currentRef = useRef(null);

  const scrollToCurrent = () => {
    currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getRoadmap(level)
      .then(data => {
        setNodes(data?.nodes || []);
        setUnlocked(data?.unlocked !== false);   // eski javob (undefined) = ochiq
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [level]);

  useEffect(() => { load(); }, [load]);

  // Measure the scene width so the path fills the full web width (responsive).
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w) setSceneW(Math.round(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [nodes.length]);

  // Trail draw-in: measure real length. Auto-scroll to the current lesson.
  useEffect(() => {
    if (trailRef.current) {
      const len = trailRef.current.getTotalLength?.() || 3000;
      trailRef.current.style.setProperty('--trail-len', len);
    }
    if (currentRef.current) {
      const t = setTimeout(() => currentRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' }), 60);
      return () => clearTimeout(t);
    }
  }, [nodes, sceneW]);

  // "My location" hint: show a jump-back pill when the current node leaves
  // the viewport. A scroll listener (not IntersectionObserver) so instant
  // scrollbar jumps — off-screen below → off-screen above — are caught too.
  useEffect(() => {
    if (!currentRef.current) { setLocHint(null); return; }
    // Header height to hide behind (sticky) + a small bottom margin.
    const topInset = isMobile ? 220 : 188;
    const botInset = 56;
    let ticking = false;
    const check = () => {
      ticking = false;
      const node = currentRef.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      if (r.bottom < topInset) setLocHint('up');            // hidden above / behind header
      else if (r.top > window.innerHeight - botInset) setLocHint('down'); // hidden below
      else setLocHint(null);                                // on screen
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(check); }
    };
    // Defer the first check so the auto-scroll-to-current has settled (no flash).
    const t0 = setTimeout(check, 160);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      clearTimeout(t0);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [nodes, sceneW, isMobile]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={26} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const n = nodes.length;
  const currentIndex = nodes.findIndex(x => x.status !== 'done' && x.status !== 'locked');
  const doneCount = nodes.filter(x => x.status === 'done').length;
  const pct = n ? Math.round((doneCount / n) * 100) : 0;

  // Bottom-to-top: index 0 (first lesson) sits at the BOTTOM, last lesson at the top.
  const AMP = Math.min(sceneW * 0.26, 230);
  const cx = (i) => Math.round(sceneW / 2 + Math.sin(i * 0.8) * AMP);
  const sceneH = n ? PAD_TOP + (n - 1) * GAP + PAD_BOT : 300;
  const cy = (i) => PAD_TOP + (n - 1 - i) * GAP;

  const points = nodes.map((_, i) => ({ x: cx(i), y: cy(i) }));
  const pathD = smoothPath(points);
  const R = 20, C = 2 * Math.PI * R;

  return (
    <div style={styles.page}>
      {/* Header — sticks to the top while the roadmap scrolls under it */}
      <div style={{ ...styles.header, top: isMobile ? 'var(--nav-height)' : 0 }} className="anim-fade-up">
        <div style={styles.crumbs}>SenpaiJLPT · <span style={{ color: 'var(--primary)' }}>{t('roadmap.breadcrumb')}</span></div>
        <div style={styles.headCard}>
          <div style={styles.headIcon} className="jp">世</div>
          <div style={{ flex: 1 }}>
            <div style={styles.headTitle}>{level} {t('roadmap.levelLabel')}</div>
            <div style={styles.headSub}>{doneCount}/{n} {t('roadmap.lessonsWord')} · {t('roadmap.worlds')}</div>
          </div>
          <div style={styles.ringWrap}>
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r={R} fill="none" stroke="var(--border)" strokeWidth="5" />
              <circle cx="26" cy="26" r={R} fill="none" stroke="var(--primary)" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 26 26)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
            </svg>
            <span style={styles.ringPct}>{pct}%</span>
          </div>
        </div>
        <div style={styles.tabs}>
          {LEVELS.map(lv => {
            const info = levelInfo(lv);
            const isLocked = info && !info.unlocked;
            const isDone = info && info.completed;
            return (
              <button key={lv} onClick={() => selectLevel(lv)} className="press"
                style={{
                  ...styles.tab,
                  ...(level === lv ? styles.tabActive : {}),
                  ...(isLocked ? styles.tabLocked : {}),
                }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {isLocked && <Lock size={11} />}
                  {isDone && !isLocked && <Check size={12} />}
                  {lv}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {!unlocked ? (
        <div style={styles.lockedWrap} className="anim-scale-in">
          <img src="/mascot/Empty_Box-removebg-preview.png" alt="" style={styles.lockedMascot} />
          {/* <br />
          <div style={styles.lockedIconBadge}><Lock size={20} /></div> */}
          <h2 style={styles.lockedTitle}>{level} darajasi hali yopiq</h2>
          <p style={styles.lockedSub}>
            Bu darajani ochish uchun avval oldingi darajani to'liq yakunlang.
            Har bir bosqich ketma-ket ochiladi.
          </p>
          <button style={styles.lockedBtn} className="press"
            onClick={() => {
              const cur = levels.find(x => x.isCurrent);
              if (cur) setLevel(cur.level);
            }}>
            Joriy darajaga qaytish
          </button>
        </div>
      ) : n === 0 ? (
        <EmptyState title={t('roadmap.empty')} subtitle={`${level} ${t('roadmap.emptySub')}`} />
      ) : (
        <div ref={sceneRef} className="rm-scene" style={{ height: sceneH, width: '100%' }}>

          {/* Winding trail */}
          <svg className="rm-svg" width={sceneW} height={sceneH} viewBox={`0 0 ${sceneW} ${sceneH}`} style={{ zIndex: 1 }}>
            <path className="rm-trail-bg" d={pathD} />
            <path ref={trailRef} className="rm-trail-fill" d={pathD} />
            <path className="rm-trail-dots" d={pathD} />
          </svg>

          {/* Nodes */}
          {nodes.map((node, i) => {
            const state = node.status === 'done' ? 'done'
              : node.status === 'locked' ? 'locked'
                : (i === currentIndex ? 'current' : 'available');
            const locked = state === 'locked';
            const title = node.titleUz || node.title || `${node.order}-dars`;
            return (
              <div key={node.lessonId || i} className="rm-node"
                ref={state === 'current' ? currentRef : null}
                style={{ left: cx(i), top: cy(i), zIndex: 2, animationDelay: `${0.04 * Math.min(i, 12)}s, ${(-0.4 * i).toFixed(2)}s` }}>
                <div className="rm-island" />
                {state === 'current' && (
                  <div className="rm-start-wrap"><span className="rm-start">{t('roadmap.start')}</span></div>
                )}
                <button
                  className={`rm-node-btn rm-node-${state}`}
                  onClick={() => !locked && node.lessonId && navigate(`/lessons/${node.lessonId}`)}
                  aria-label={title}
                >
                  {state === 'done' ? <Check size={26} strokeWidth={3.5} />
                    : state === 'locked' ? <Lock size={22} />
                      : state === 'current' ? <Star size={26} fill="currentColor" />
                        : (node.iconChar
                          ? <span className="jp" style={{ fontSize: 24, fontWeight: 800 }}>{node.iconChar}</span>
                          : <span style={{ fontSize: 20, fontWeight: 900 }}>{node.order || i + 1}</span>)}
                </button>
                <div className="rm-node-title">{title}</div>
              </div>
            );
          })}

        </div>
      )}

      {/* "My location" — jump back to the current lesson when it's off-screen */}
      {locHint && (
        <button
          type="button"
          onClick={scrollToCurrent}
          className={`rm-loc rm-loc-${locHint}`}
          style={{ left: isMobile ? '50%' : 'calc(50% + var(--sidebar-width) / 2)' }}
        >
          {locHint === 'up' ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
          <Navigation size={14} fill="currentColor" />
          <span>{t('roadmap.myLocation')}</span>
        </button>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 920, margin: '0 auto', width: '100%' },
  header: {
    display: 'flex', flexDirection: 'column', gap: 12,
    position: 'sticky', zIndex: 20,
    background: 'var(--bg)',
    paddingBottom: 12, marginBottom: -4,
  },
  crumbs: { fontSize: 12, fontWeight: 800, color: 'var(--text-light)', letterSpacing: 0.5 },
  headCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 18 },
  headIcon: { width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(150deg, var(--primary-light), var(--primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, flexShrink: 0 },
  headTitle: { fontSize: 19, fontWeight: 900, color: 'var(--text)' },
  headSub: { fontSize: 13, fontWeight: 700, color: 'var(--text-light)' },
  ringWrap: { position: 'relative', width: 52, height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  ringPct: { position: 'absolute', fontSize: 12, fontWeight: 900, color: 'var(--primary)' },
  tabs: { display: 'flex', gap: 8 },
  tab: { flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 14, fontWeight: 800, background: 'var(--bg-alt)', color: 'var(--text-light)', borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--border)', cursor: 'pointer' },
  tabActive: { background: 'var(--primary-soft)', color: 'var(--primary-dark)', borderColor: 'var(--primary)' },
  tabLocked: { opacity: 0.5, cursor: 'not-allowed', background: 'var(--bg-alt)', color: 'var(--text-light)' },

  lockedWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    padding: '40px 24px', maxWidth: 420, margin: '20px auto',
    background: 'var(--bg-card)', borderRadius: 24, border: '2px solid var(--border)',
  },
  lockedMascot: { width: 120, height: 120, objectFit: 'contain', marginBottom: 8, filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.14))' },
  lockedIconBadge: {
    width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-alt)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-light)', marginBottom: 12, marginTop: -28,
    border: '2px solid var(--border)',
  },
  lockedTitle: { fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 8 },
  lockedSub: { fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.6, marginBottom: 20 },
  lockedBtn: {
    padding: '12px 28px', borderRadius: 14, background: 'var(--primary)', color: '#fff',
    fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 0 var(--primary-dark)',
  },
};
