import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyQuests, claimQuestReward } from '../../api/gamification';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Target, Gift, Clock, Loader, ChevronRight } from 'lucide-react';

const QUEST_ICONS = {
  LearnWords: '📖', LearnKanji: '🈷️', LearnGrammar: '📝', CompleteReviews: '🔁',
  WriteKanji: '✍️', CompleteLessons: '📚', EarnXp: '⚡', StudyMinutes: '⏱️',
};

// Har vazifa turi — uni bajarish uchun ochiladigan sahifa.
// EarnXp/StudyMinutes umumiy vazifalar (XP/vaqt istalgan faoliyatdan) →
// "o'qishni davom ettir" joyi bo'lgan yo'l xaritasiga olib boradi.
const QUEST_ROUTES = {
  LearnWords: '/dictionary',
  LearnKanji: '/kanji',
  LearnGrammar: '/lessons',
  CompleteReviews: '/review',
  WriteKanji: '/kanji',
  CompleteLessons: '/lessons',
  EarnXp: '/roadmap',
  StudyMinutes: '/roadmap',
};

export default function DailyQuests() {
  const navigate = useNavigate();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // §15.3 — javob { date, quests: [...] }
    getDailyQuests()
      .then(data => {
        const list = (data?.quests || []).map(q => ({
          id: q.questId,
          type: q.type,
          title: q.descriptionUz || q.description,
          description: '',
          icon: QUEST_ICONS[q.type] || '⭐',
          route: QUEST_ROUTES[q.type] || '/lessons',
          current: q.currentProgress,
          target: q.targetValue,
          reward: q.coinReward,
          claimed: q.isClaimed,
        }));
        setQuests(list);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleClaim = async (id) => {
    try {
      await claimQuestReward(id);
      setQuests(qs => qs.map(q => q.id === id ? { ...q, claimed: true } : q));
    } catch { /* bajarilmagan/olingan — o'zgarish yo'q */ }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (quests.length === 0) return <EmptyState title="Vazifalar yo'q" subtitle="Bugungi vazifalar hali tayinlanmagan" />;

  const completed = quests.filter(q => q.current >= q.target).length;

  return (
    <div style={styles.page} className="stagger">
      <h1 style={styles.title} className="anim-fade-up"><Target size={22} /> Kunlik vazifalar</h1>

      <div style={styles.summaryCard} className="card-interactive">
        <div style={styles.summaryIcon} className="anim-pulse"><Gift size={24} color="var(--primary)" /></div>
        <div>
          <div style={styles.summaryText}>{completed}/{quests.length} vazifa bajarildi</div>
          <div style={styles.summaryProgress}>
            <div className="progress-shine" style={{ ...styles.summaryFill, width: `${(completed / Math.max(quests.length, 1)) * 100}%` }} />
          </div>
        </div>
        <div style={styles.summaryReward}>
          <Clock size={14} color="var(--text-light)" />
          <span style={{ fontSize: 11, color: 'var(--text-light)' }}>Yangilanish: 00:00</span>
        </div>
      </div>

      <div style={styles.list} className="stagger">
        {quests.map(quest => {
          const done = quest.current >= quest.target;
          return (
            <div
              key={quest.id}
              style={{ ...styles.card, ...(done ? styles.cardDone : {}), cursor: 'pointer' }}
              className="hover-scale"
              onClick={() => navigate(quest.route)}
              title="Vazifani bajarishga o'tish"
            >
              <div style={styles.questIcon}>{quest.icon || '⭐'}</div>
              <div style={styles.questInfo}>
                <div style={styles.questTitle}>{quest.title}</div>
                <div style={styles.questDesc}>{quest.description || `${quest.current}/${quest.target}`}</div>
                <div style={styles.questProgressBg}>
                  <div style={{ ...styles.questProgressFill, width: `${Math.min((quest.current / quest.target) * 100, 100)}%` }} />
                </div>
              </div>
              <div style={styles.questRight}>
                <div style={styles.questReward}>+{quest.reward || 10} 💰</div>
                {done && !quest.claimed ? (
                  <button
                    style={styles.claimBtn}
                    className="press anim-glow-pulse"
                    onClick={(e) => { e.stopPropagation(); handleClaim(quest.id); }}
                  >Olish</button>
                ) : done && quest.claimed ? (
                  <span style={styles.claimedBadge}>Olingan ✓</span>
                ) : null}
              </div>
              <ChevronRight size={18} color="var(--text-light)" style={{ flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 14 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 },
  summaryCard: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)' },
  summaryIcon: { width: 44, height: 44, borderRadius: 12, background: 'rgba(88,204,2,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  summaryText: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  summaryProgress: { height: 4, background: 'var(--border-light)', borderRadius: 2, marginTop: 4, width: 120 },
  summaryFill: { height: '100%', background: 'var(--success)', borderRadius: 2 },
  summaryReward: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  card: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' },
  cardDone: { background: 'rgba(76,175,80,0.04)', borderColor: 'var(--success)' },
  questIcon: { fontSize: 24 },
  questInfo: { flex: 1 },
  questTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  questDesc: { fontSize: 12, color: 'var(--text-light)', marginTop: 2 },
  questProgressBg: { height: 4, background: 'var(--border-light)', borderRadius: 2, marginTop: 6 },
  questProgressFill: { height: '100%', background: 'var(--primary)', borderRadius: 2, transition: 'width 0.3s' },
  questRight: { textAlign: 'right' },
  questReward: { fontSize: 13, fontWeight: 700, color: 'var(--text)' },
  claimBtn: { marginTop: 4, padding: '4px 12px', borderRadius: 8, background: 'var(--success)', color: 'white', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' },
  claimedBadge: { fontSize: 11, color: 'var(--success)', fontWeight: 600 },
};
