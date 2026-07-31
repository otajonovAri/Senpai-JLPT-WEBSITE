import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationRead } from '../../api/shop';
import ErrorState from '../../components/ErrorState';
import { Bell, Check, Loader } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

// §19.1 — NotificationType nomlari bo'yicha ikonkalar
const TYPE_ICONS = {
  DailyReminder: '⏰', SrsReady: '🔄', Leaderboard: '🏅',
  FriendRequest: '👤', Challenge: '⚔️', Achievement: '🏆', System: '📢',
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.floor(hours / 24)} kun oldin`;
}

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // §19.1 — { unreadCount, items: [{ id, type, title, body, sentAt, isRead }] }
    getNotifications()
      .then(data => {
        setNotifs((data?.items || []).map(n => ({
          id: n.id,
          title: n.title,
          body: n.body,
          time: timeAgo(n.sentAt),
          read: n.isRead,
          type: n.type,
        })));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = () => {
    notifs.filter(n => !n.read).forEach(n => handleMarkRead(n.id));
  };

  const unread = notifs.filter(n => !n.read).length;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div style={styles.page} className="stagger">
      <PageHeader
        icon={Bell}
        title="Bildirishnomalar"
        subtitle={unread > 0 ? `${unread} ta o'qilmagan` : "Hammasi o'qilgan"}
        accent="orange"
        right={unread > 0 ? (
          <button className="page-head__back" style={{ width: 'auto', padding: '0 14px', gap: 6, fontSize: 13, fontWeight: 800 }} onClick={handleMarkAllRead}>
            <Check size={14} /> Barchasini o'qish
          </button>
        ) : null}
      />

      <div style={styles.list}>
        {notifs.map(n => (
          <div key={n.id} style={{ ...styles.card, ...(n.read ? {} : styles.cardUnread) }} onClick={() => handleMarkRead(n.id)}>
            <div style={styles.iconWrap}>{TYPE_ICONS[n.type] || '🔔'}</div>
            <div style={styles.content}>
              <div style={styles.notifTitle}>{n.title}</div>
              <div style={styles.notifBody}>{n.body}</div>
              <div style={styles.notifTime}>{n.time}</div>
            </div>
            {!n.read && <div style={styles.dot} />}
          </div>
        ))}
      </div>

      {notifs.length === 0 && (
        <div style={styles.empty}>
          <Bell size={40} color="var(--text-light)" />
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600 }}>Bildirishnoma yo'q</div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 14 },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 },
  markAllBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: 'var(--bg)', border: '2px solid var(--border)', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' },
  unreadBadge: { padding: '6px 12px', borderRadius: 8, background: 'rgba(88,204,2,0.08)', color: 'var(--primary)', fontSize: 12, fontWeight: 600, alignSelf: 'flex-start' },
  list: { display: 'flex', flexDirection: 'column', gap: 6 },
  card: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 12, border: '2px solid var(--border)', cursor: 'pointer' },
  cardUnread: { background: 'rgba(88,204,2,0.03)', borderColor: 'var(--primary)', borderLeft: '3px solid var(--primary)' },
  iconWrap: { fontSize: 22, flexShrink: 0, marginTop: 2 },
  content: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  notifBody: { fontSize: 12, color: 'var(--text-light)', marginTop: 2 },
  notifTime: { fontSize: 11, color: 'var(--text-light)', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 },
  empty: { textAlign: 'center', padding: 40, color: 'var(--text-light)' },
};
