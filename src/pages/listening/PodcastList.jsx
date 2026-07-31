import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPodcasts } from '../../api/podcasts';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import { Loader, Star, Headphones } from 'lucide-react';

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
// Cover gradients drawn from the app palette so podcasts match the rest of the UI.
const CAT_GRADIENT = [
  'linear-gradient(135deg, var(--secondary-dark), var(--secondary-light))',
  'linear-gradient(135deg, var(--purple-dark), var(--purple))',
  'linear-gradient(135deg, var(--pink-dark), var(--pink))',
  'linear-gradient(135deg, var(--success-dark), var(--primary-light))',
  'linear-gradient(135deg, var(--warning-dark), var(--warning))',
  'linear-gradient(135deg, var(--accent-dark), var(--accent))',
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
    <div className="page stagger">
      <PageHeader
        icon={Headphones}
        title="Tinglash kutubxonasi"
        subtitle="Daraja bo'yicha tinglash mashqlari"
        accent="blue"
        right={<img src="/mascot/gramophone-removebg-preview.png" alt="" style={S.heroMascot} />}
      />

      <div style={S.filters} className="anim-fade-up">
        <div className="chip-row">
          <button className={`chip${level == null ? ' chip--active' : ''}`} onClick={() => setLevel(null)}>Barchasi</button>
          {LEVELS.map((lv, i) => (
            <button key={lv} className={`chip${level === i ? ' chip--active' : ''}`} onClick={() => setLevel(i)}>{lv}</button>
          ))}
        </div>
        <div className="chip-row">
          {CATEGORIES.map(c => (
            <button key={String(c.key)} className={`chip${category === c.key ? ' chip--active' : ''}`}
              onClick={() => setCategory(c.key)}>{c.label}</button>
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
  heroMascot: { width: 78, height: 78, objectFit: 'contain', flexShrink: 0 },
  filters: { display: 'flex', flexDirection: 'column', gap: 8 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 },
  card: { background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer' },
  cover: { height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 40 },
  cardBody: { padding: '12px 14px' },
  cardTitle: { fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: 'var(--text-light)', marginBottom: 10, lineHeight: 1.4 },
  cardFooter: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardLevel: { padding: '2px 8px', borderRadius: 6, background: 'var(--secondary-soft)', fontSize: 10, fontWeight: 800, color: 'var(--secondary-dark)' },
  epCount: { fontSize: 11, color: 'var(--text-light)', fontWeight: 700 },
  freeBadge: { padding: '2px 8px', borderRadius: 6, background: 'var(--success-soft)', fontSize: 10, fontWeight: 800, color: 'var(--success-dark)' },
  premBadge: { display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 6, background: 'var(--accent-soft)', fontSize: 10, fontWeight: 800, color: 'var(--accent-dark)' },
};
