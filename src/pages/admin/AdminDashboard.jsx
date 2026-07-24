import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import ErrorState from '../../components/ErrorState';
import {
  Users, BookOpen, Languages, Layers, ShoppingBag,
  HelpCircle, Trophy, CreditCard, Shield, Loader,
  ChevronRight, BarChart3, Mic, ClipboardCheck, Swords
} from 'lucide-react';

const sections = [
  { key: 'totalUsers', label: 'Foydalanuvchilar', icon: Users, path: '/admin/users', color: '#4CAF50' },
  { key: 'totalVocabulary', label: "Lug'at so'zlari", icon: BookOpen, path: '/admin/vocabulary', color: '#2196F3' },
  { key: 'totalKanji', label: 'Kanji', icon: Languages, path: '/admin/kanji', color: '#FF6B35' },
  { key: 'totalGrammar', label: 'Grammatika', icon: Layers, path: '/admin/grammar', color: '#9C27B0' },
  { key: 'totalLessons', label: 'Darslar', icon: BarChart3, path: '/admin/lessons', color: '#00BCD4' },
  { key: 'totalShopItems', label: "Do'kon mahsulotlari", icon: ShoppingBag, path: '/admin/shop-items', color: '#FF9800' },
  { key: 'totalFaq', label: 'FAQ', icon: HelpCircle, path: '/admin/faq', color: '#607D8B' },
  { key: 'totalAchievements', label: 'Yutuqlar', icon: Trophy, path: '/admin/achievements', color: '#FFD700' },
  { key: 'totalSubscriptionPlans', label: 'Obuna rejalar', icon: CreditCard, path: '/admin/subscription-plans', color: '#E91E63' },
  { key: 'totalPodcasts', label: 'Podkastlar', icon: Mic, path: '/admin/podcasts', color: '#795548' },
  { key: 'totalMockTests', label: 'Mock Testlar', icon: ClipboardCheck, path: '/admin/mock-tests', color: '#3F51B5' },
  { key: 'totalDailyQuests', label: 'Kunlik vazifalar', icon: Swords, path: '/admin/daily-quests', color: '#F44336' },
  { key: 'totalStudyGroups', label: "O'quv guruhlari", icon: Users, path: '/admin/study-groups', color: '#009688', badgeKey: 'pendingStudyGroups' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi.dashboard()
      .then(data => setStats(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={styles.center}>
        <Loader size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--secondary)' }} />
        <p style={styles.loadingText}>Admin panel yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div>
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Shield size={22} color="white" />
        </div>
        <div>
          <h1 style={styles.title}>Admin Panel</h1>
          <p style={styles.subtitle}>Kontentni boshqarish va statistika</p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        {sections.map((sec, i) => {
          const Icon = sec.icon;
          const count = stats?.[sec.key] ?? 0;
          const pending = sec.badgeKey ? (stats?.[sec.badgeKey] ?? 0) : 0;
          return (
            <Link
              key={sec.key}
              to={sec.path}
              style={styles.card}
              className="card-interactive anim-fade-up"
            >
              <div style={styles.cardTop}>
                <div style={{ ...styles.iconWrap, background: `${sec.color}15` }}>
                  <Icon size={20} color={sec.color} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {pending > 0 && (
                    <span style={styles.pendingBadge}>{pending} kutilmoqda</span>
                  )}
                  <ChevronRight size={16} style={{ color: 'var(--text-light)' }} />
                </div>
              </div>
              <div style={styles.cardCount}>{count}</div>
              <div style={styles.cardLabel}>{sec.label}</div>
              <div style={styles.cardAction}>Boshqarish</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'linear-gradient(135deg, var(--secondary), #4A2D8A)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--text-light)',
    margin: 0,
    marginTop: 2,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 14,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
    borderRadius: 14,
    background: 'var(--bg-card, white)',
    border: '1px solid var(--border-light)',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCount: {
    fontSize: 26,
    fontWeight: 800,
    color: 'var(--text)',
    lineHeight: 1,
  },
  cardLabel: {
    fontSize: 13,
    color: 'var(--text-light)',
    marginTop: 4,
    fontWeight: 500,
  },
  cardAction: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--secondary)',
    marginTop: 10,
  },
  pendingBadge: {
    padding: '3px 8px',
    borderRadius: 999,
    background: 'rgba(245,181,10,0.15)',
    color: '#B45309',
    fontSize: 10,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 80,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: 'var(--text-light)',
  },
};
