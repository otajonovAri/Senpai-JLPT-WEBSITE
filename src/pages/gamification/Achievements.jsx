import { useState, useEffect, useCallback } from 'react';
import { getAchievements } from '../../api/gamification';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import { Lock, Loader, Award } from 'lucide-react';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getAchievements()
      .then(data => {
        const list = (data?.achievements || []).map(a => ({
          id: a.id,
          icon: a.iconEmoji || '🏆',
          title: a.nameUz || a.name,
          description: a.descriptionUz || a.description || '',
          unlocked: a.isUnlocked,
          progress: a.currentValue,
          target: a.targetValue,
        }));
        setAchievements(list);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tab === 'all' ? achievements : tab === 'unlocked' ? achievements.filter(a => a.unlocked) : achievements.filter(a => !a.unlocked);
  const unlocked = achievements.filter(a => a.unlocked).length;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (achievements.length === 0) return <EmptyState title="Yutuqlar yo'q" subtitle="Backend'da yutuqlar sozlanmagan" />;

  return (
    <div style={styles.page} className="stagger">
      <PageHeader
        icon={Award}
        title="Yutuqlar"
        subtitle={`${unlocked}/${achievements.length} yutuq ochilgan`}
        accent="gold"
        right={<img src="/mascot/badges.png" alt="" style={styles.heroMascot} />}
      />

      <div className="chip-row">
        {[['all', 'Barchasi'], ['unlocked', 'Ochilgan'], ['locked', 'Yopiq']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`chip${tab === key ? ' chip--active' : ''}`}>{label}</button>
        ))}
      </div>

      <div style={styles.grid} className="stagger-grid">
        {filtered.map(a => (
          <div key={a.id} style={{ ...styles.card, opacity: a.unlocked ? 1 : 0.5 }} className={a.unlocked ? 'card-interactive' : ''}>
            <div style={styles.cardIcon} className={a.unlocked ? 'anim-bounce' : ''}>{a.icon || '🏆'}</div>
            <div style={styles.cardTitle}>{a.title}</div>
            <div style={styles.cardDesc}>{a.description}</div>
            {!a.unlocked && a.progress !== undefined && (
              <div style={styles.progressBg}>
                <div className="progress-shine" style={{ ...styles.progressFill, width: `${Math.min((a.progress / (a.target || 1)) * 100, 100)}%` }} />
              </div>
            )}
            {a.unlocked ? (
              <div style={styles.unlockedBadge}>Ochilgan ✓</div>
            ) : (
              <div style={styles.lockedBadge}><Lock size={10} /> Yopiq</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 14 },
  heroMascot: { width: 72, height: 72, objectFit: 'contain', flexShrink: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 },
  card: { background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 16, textAlign: 'center', border: '2px solid var(--border)' },
  cardIcon: { fontSize: 36, marginBottom: 6 },
  cardTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 },
  cardDesc: { fontSize: 11, color: 'var(--text-light)', marginBottom: 8, lineHeight: 1.3 },
  progressBg: { height: 4, background: 'var(--border-light)', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: '100%', background: 'var(--primary)', borderRadius: 2 },
  unlockedBadge: { fontSize: 11, fontWeight: 600, color: 'var(--success)' },
  lockedBadge: { fontSize: 11, fontWeight: 600, color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 },
};
