import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPodcastDetail } from '../../api/podcasts';
import ErrorState from '../../components/ErrorState';
import { ChevronLeft, Play, Clock, Loader } from 'lucide-react';

const CAT_GRADIENT = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
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
      <button style={S.backBtn} onClick={() => navigate('/podcasts')} className="anim-fade-up">
        <ChevronLeft size={18} /> Podkastlar
      </button>

      <div style={{ ...S.cover, background: CAT_GRADIENT[podcast.category || 0] }} className="anim-fade-up">
        <span style={S.coverEmoji}>{CAT_EMOJI[podcast.category || 0]}</span>
      </div>

      <div className="anim-fade-up">
        <h1 style={S.title}>{podcast.titleUz || podcast.title}</h1>
        <p style={S.desc}>{podcast.description}</p>
        <div style={S.meta}>
          <span style={S.badge}>N{5 - (podcast.level || 0)}</span>
          <span style={S.metaText}>{episodes.length} epizod</span>
        </div>
      </div>

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
  backBtn: { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, alignSelf: 'flex-start' },
  cover: { height: 140, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 56 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text)' },
  desc: { fontSize: 14, color: 'var(--text-light)', lineHeight: 1.5, marginTop: 6 },
  meta: { display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' },
  badge: { padding: '4px 12px', borderRadius: 8, background: 'rgba(33,150,243,0.1)', fontSize: 12, fontWeight: 700, color: '#1565C0' },
  metaText: { fontSize: 13, color: 'var(--text-light)' },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10 },
  emptyText: { fontSize: 13, color: 'var(--text-light)' },
  episodeList: { display: 'flex', flexDirection: 'column', gap: 8 },
  epCard: { display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 14, padding: '12px 16px', cursor: 'pointer' },
  epNum: { width: 28, height: 28, borderRadius: 8, background: 'rgba(88,204,2,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'var(--primary)' },
  epInfo: { flex: 1 },
  epTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  epDuration: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-light)', marginTop: 2 },
};
