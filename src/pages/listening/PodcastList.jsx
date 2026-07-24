import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPodcasts } from '../../api/podcasts';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Loader, Star } from 'lucide-react';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const CATEGORIES = [
  { key: null, label: 'Barchasi' },
  { key: 0, label: 'Suhbat' },
  { key: 1, label: 'Yangiliklar' },
  { key: 2, label: 'Hikoya' },
  { key: 3, label: 'Grammatika' },
  { key: 4, label: 'Madaniyat' },
  { key: 5, label: 'Biznes' },
];
const CAT_EMOJI = ['💬', '📰', '📖', '📝', '🎌', '💼'];
const CAT_GRADIENT = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
];

export default function PodcastList() {
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(null);
  const [category, setCategory] = useState(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    getPodcasts(level, category)
      .then(data => setPodcasts(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [level, category]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={S.page} className="stagger">
      <div style={S.heroBanner} className="anim-scale-in">
        <div style={S.heroContent}>
          <h1 style={S.heroTitle}>Tinglash kutubxonasi</h1>
          <p style={S.heroSub}>Daraja bo'yicha tinglash mashqlari</p>
        </div>
        <img src="/mascot/gramophone-removebg-preview.png" alt="Listening Dragon" style={S.heroMascot} />
      </div>

      <div style={S.filters} className="anim-fade-up">
        <div style={S.levels}>
          <button style={{ ...S.levelBtn, ...(level == null ? S.levelActive : {}) }} onClick={() => setLevel(null)} className="press">Barchasi</button>
          {LEVELS.map((lv, i) => (
            <button key={lv} style={{ ...S.levelBtn, ...(level === i ? S.levelActive : {}) }} onClick={() => setLevel(i)} className="press">{lv}</button>
          ))}
        </div>
        <div style={S.cats}>
          {CATEGORIES.map(c => (
            <button key={String(c.key)} style={{ ...S.catBtn, ...(category === c.key ? S.catActive : {}) }}
              onClick={() => setCategory(c.key)} className="press">{c.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : podcasts.length === 0 ? (
        <EmptyState title="Podcast topilmadi" subtitle="Boshqa filtrlarga qarang" />
      ) : (
        <div style={S.grid} className="stagger">
          {podcasts.map(p => (
            <div key={p.id} style={S.card} className="card-interactive" onClick={() => navigate('/podcasts/' + p.id)}>
              <div style={{ ...S.cover, background: CAT_GRADIENT[p.category || 0] }}>
                <span style={S.coverEmoji}>{CAT_EMOJI[p.category || 0]}</span>
              </div>
              <div style={S.cardBody}>
                <h3 style={S.cardTitle}>{p.titleUz || p.title}</h3>
                <p style={S.cardDesc}>{p.description?.slice(0, 60) || ''}</p>
                <div style={S.cardFooter}>
                  <span style={S.cardLevel}>N{5 - (p.level || 0)}</span>
                  <span style={S.epCount}>{p.episodeCount || 0} epizod</span>
                  {p.isFree ? <span style={S.freeBadge}>Bepul</span> : <span style={S.premBadge}><Star size={10} /> Premium</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const S = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  heroBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '24px 28px', borderRadius: 20,
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', overflow: 'hidden', position: 'relative',
  },
  heroContent: { flex: 1, zIndex: 1 },
  heroTitle: { fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 },
  heroSub: { fontSize: 14, opacity: 0.85, fontWeight: 600 },
  heroMascot: { width: 90, height: 90, objectFit: 'contain', flexShrink: 0 },
  filters: { display: 'flex', flexDirection: 'column', gap: 8 },
  levels: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  levelBtn: { padding: '6px 14px', borderRadius: 14, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' },
  levelActive: { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },
  cats: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  catBtn: { padding: '6px 12px', borderRadius: 14, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' },
  catActive: { background: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer' },
  cover: { height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 40 },
  cardBody: { padding: '12px 14px' },
  cardTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: 'var(--text-light)', marginBottom: 10, lineHeight: 1.4 },
  cardFooter: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardLevel: { padding: '2px 8px', borderRadius: 6, background: 'rgba(33,150,243,0.1)', fontSize: 10, fontWeight: 700, color: '#1565C0' },
  epCount: { fontSize: 11, color: 'var(--text-light)' },
  freeBadge: { padding: '2px 8px', borderRadius: 6, background: 'rgba(76,175,80,0.1)', fontSize: 10, fontWeight: 700, color: '#4CAF50' },
  premBadge: { display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,152,0,0.1)', fontSize: 10, fontWeight: 700, color: '#FF9800' },
};
