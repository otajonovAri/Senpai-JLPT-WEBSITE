import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPodcastDetail } from '../../api/podcasts';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import { Play, Clock, Loader, Headphones } from 'lucide-react';

// Same category gradients as the podcast list — built from the app palette.
const CAT_GRADIENT = [
  'linear-gradient(135deg, var(--secondary-dark), var(--secondary-light))',
  'linear-gradient(135deg, var(--purple-dark), var(--purple))',
  'linear-gradient(135deg, var(--pink-dark), var(--pink))',
  'linear-gradient(135deg, var(--success-dark), var(--primary-light))',
  'linear-gradient(135deg, var(--warning-dark), var(--warning))',
  'linear-gradient(135deg, var(--accent-dark), var(--accent))',
];
const CAT_EMOJI = ['💬', '📰', '📖', '📝', '🎌', '💼'];

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + String(s).padStart(2, '0');
}

export default function PodcastDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    getPodcastDetail(id)
      .then(setPodcast)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!podcast) return null;

  const episodes = podcast.episodes || [];

  return (
    <div style={S.page} className="stagger">
      <PageHeader
        icon={Headphones}
        title={podcast.titleUz || podcast.title}
        subtitle={`N${5 - (podcast.level || 0)} · ${episodes.length} epizod`}
        accent="blue"
        back="/podcasts"
      />

      <div style={{ ...S.cover, background: CAT_GRADIENT[podcast.category || 0] }} className="anim-fade-up">
        <span style={S.coverEmoji}>{CAT_EMOJI[podcast.category || 0]}</span>
      </div>

      {podcast.description && <p style={S.desc} className="anim-fade-up">{podcast.description}</p>}

      <div className="anim-fade-up">
        <h2 style={S.sectionTitle}>Epizodlar</h2>
        {episodes.length === 0 ? (
          <p style={S.emptyText}>Hali epizod yo'q</p>
        ) : (
          <div style={S.episodeList}>
            {episodes.sort((a, b) => a.orderIndex - b.orderIndex).map((ep, i) => (
              <div key={ep.id} style={S.epCard} className="card-interactive"
                onClick={() => navigate('/podcasts/episodes/' + ep.id)}>
                <div style={S.epNum}>{i + 1}</div>
                <div style={S.epInfo}>
                  <div style={S.epTitle}>{ep.titleUz || ep.title}</div>
                  <div style={S.epDuration}><Clock size={12} /> {fmtTime(ep.durationSeconds || 0)}</div>
                </div>
                <Play size={18} color="var(--primary)" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600, margin: '0 auto' },
  cover: { height: 140, borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 56 },
  desc: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 600 },
  sectionTitle: { fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 10 },
  emptyText: { fontSize: 13, color: 'var(--text-light)' },
  episodeList: { display: 'flex', flexDirection: 'column', gap: 8 },
  epCard: { display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', cursor: 'pointer' },
  epNum: { width: 28, height: 28, borderRadius: 8, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'var(--primary-dark)' },
  epInfo: { flex: 1 },
  epTitle: { fontSize: 14, fontWeight: 800, color: 'var(--text)' },
  epDuration: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-light)', marginTop: 2 },
};
