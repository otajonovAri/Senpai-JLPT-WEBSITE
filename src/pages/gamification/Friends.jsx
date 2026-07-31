import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFriends, sendFriendRequest, respondFriendRequest, getChallenges, respondChallenge, searchUsers } from '../../api/gamification';
import { useToast } from '../../context/ToastContext';
import ErrorState from '../../components/ErrorState';
import { Users, UserPlus, Search, Check, X, Swords, Loader } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function Friends() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [sending, setSending] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!addName.trim() || addName.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      setSearching(true);
      searchUsers(addName.trim())
        .then(res => setSearchResults(res || []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [addName]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      // §17.1 — { friends: [...], pendingRequests: [...] }
      getFriends(),
      // §17.5 — bellashuvlar ro'yxati
      getChallenges().catch(() => []),
    ])
      .then(([data, ch]) => {
        setFriends((data?.friends || []).map(f => ({
          id: f.userId,
          name: f.username,
          avatarUrl: f.avatarUrl,
          xp: f.xpPoints || 0,
          streak: f.streakDays || 0,
        })));
        setPending((data?.pendingRequests || []).map(r => ({
          friendshipId: r.friendshipId,
          name: r.username,
          avatarUrl: r.avatarUrl,
          sentAt: r.sentAt,
        })));
        setChallenges(ch || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!addName.trim()) return;
    setSending(true);
    try {
      // §17.2 — muvaffaqiyat/xato ikkalasi ham {success, message} qaytaradi
      const res = await sendFriendRequest(addName.trim());
      toast.success(res?.message || "So'rov yuborildi");
      setShowAdd(false);
      setAddName('');
    } catch (err) {
      toast.error(err.message || "So'rov yuborilmadi");
    } finally {
      setSending(false);
    }
  };

  const handleRespond = async (friendshipId, accept) => {
    try {
      // §17.3 — POST /friends/{friendshipId}/respond { accept }
      await respondFriendRequest(friendshipId, accept);
      toast.success(accept ? "Do'stlik qabul qilindi" : "So'rov rad etildi");
      load(); // ro'yxatni yangilash
    } catch (err) {
      toast.error(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleChallengeRespond = async (challengeId, accept) => {
    try {
      // §17.7 — POST /challenges/{challengeId}/respond { accept }
      await respondChallenge(challengeId, accept);
      toast.success(accept ? 'Bellashuv qabul qilindi!' : 'Bellashuv rad etildi');
      load();
    } catch (err) {
      toast.error(err.message || 'Xatolik yuz berdi');
    }
  };

  // Menga yuborilgan, javob kutayotgan bellashuvlar
  const incomingChallenges = challenges.filter(c =>
    c.status === 'Pending' && c.opponentUsername === user?.username);
  const activeChallenges = challenges.filter(c => c.status === 'Active');

  const filtered = friends.filter(f => !search || f.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div style={styles.page} className="stagger">
      <PageHeader
        icon={Users}
        title="Do'stlar"
        subtitle="Birga o'rganing va bellashing"
        accent="blue"
        right={
          <button className="page-head__back" onClick={() => setShowAdd(!showAdd)} aria-label="Do'st qo'shish">
            <UserPlus size={18} />
          </button>
        }
      />

      {showAdd && (
        <div style={styles.addCard}>
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <input style={styles.addInput} placeholder="Username yoki ism kiriting..." value={addName}
              onChange={e => setAddName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <button style={{ ...styles.sendBtn, opacity: sending ? 0.6 : 1 }} onClick={handleAdd} disabled={sending}>
              {sending ? '...' : 'Yuborish'}
            </button>
          </div>
          {searching && <div style={{ fontSize: 12, color: 'var(--text-light)', padding: '6px 0' }}>Qidirilmoqda...</div>}
          {searchResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, maxHeight: 200, overflowY: 'auto' }}>
              {searchResults.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--bg)', cursor: 'pointer' }}
                  onClick={() => { setAddName(u.username); }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                    {u.avatarUrl ? <img src={u.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : u.username?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{u.username}</div>
                    {u.fullName && <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{u.fullName}</div>}
                  </div>
                  {u.isFriend && <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 600 }}>Do'st</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {incomingChallenges.length > 0 && (
        <div style={{ ...styles.pendingSection, background: 'rgba(88,204,2,0.05)', borderColor: 'rgba(88,204,2,0.3)' }}>
          <div style={styles.pendingTitle}><Swords size={13} style={{ verticalAlign: -2 }} /> Bellashuv takliflari ({incomingChallenges.length})</div>
          {incomingChallenges.map(c => (
            <div key={c.id} style={styles.pendingCard}>
              <div style={styles.avatar}>{c.challengerUsername?.charAt(0)?.toUpperCase()}</div>
              <div style={styles.info}>
                <div style={styles.friendName}>{c.challengerUsername}</div>
                <div style={styles.friendMeta}>sizni haftalik bellashuvga chaqirdi</div>
              </div>
              <button style={styles.acceptBtn} onClick={() => handleChallengeRespond(c.id, true)}><Check size={16} /></button>
              <button style={styles.declineBtn} onClick={() => handleChallengeRespond(c.id, false)}><X size={16} /></button>
            </div>
          ))}
        </div>
      )}

      {activeChallenges.length > 0 && (
        <div style={styles.pendingSection}>
          <div style={styles.pendingTitle}>Faol bellashuvlar</div>
          {activeChallenges.map(c => (
            <div key={c.id} style={styles.pendingCard}>
              <Swords size={18} color="var(--primary)" />
              <div style={styles.info}>
                <div style={styles.friendName}>{c.challengerUsername} vs {c.opponentUsername}</div>
                <div style={styles.friendMeta}>{c.challengerXp} : {c.opponentXp} XP</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div style={styles.pendingSection}>
          <div style={styles.pendingTitle}>Kutilayotgan so'rovlar ({pending.length})</div>
          {pending.map(req => (
            <div key={req.friendshipId} style={styles.pendingCard}>
              <div style={styles.avatar}>
                {req.avatarUrl ? <img src={req.avatarUrl} alt="" style={styles.avatarImg} /> : req.name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={styles.info}>
                <div style={styles.friendName}>{req.name}</div>
                <div style={styles.friendMeta}>do'stlik so'rovi yubordi</div>
              </div>
              <button style={styles.acceptBtn} onClick={() => handleRespond(req.friendshipId, true)}><Check size={16} /></button>
              <button style={styles.declineBtn} onClick={() => handleRespond(req.friendshipId, false)}><X size={16} /></button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.searchBox}>
        <Search size={16} color="var(--text-light)" />
        <input style={styles.searchInput} placeholder="Do'stlarni qidirish..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>
            <img src="/mascot/Empty_Bench-removebg-preview.png" alt="No Friends" style={styles.emptyImg} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Hozircha do'stlar yo'q</div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>Username orqali do'st qo'shing</div>
        </div>
      ) : (
        <div style={styles.list} className="stagger">
          {filtered.map(friend => (
            <div key={friend.id} style={styles.card} className="card-interactive" onClick={() => navigate(`/friends/${friend.id}`)}>
              <div style={styles.avatarWrap}>
                <div style={styles.avatar}>
                  {friend.avatarUrl ? <img src={friend.avatarUrl} alt="" style={styles.avatarImg} /> : friend.name?.charAt(0)?.toUpperCase()}
                </div>
              </div>
              <div style={styles.info}>
                <div style={styles.friendName}>{friend.name}</div>
                <div style={styles.friendMeta}>{friend.xp.toLocaleString()} XP</div>
              </div>
              <div style={styles.streak}>🔥 {friend.streak}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 14 },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 },
  addBtn: { width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' },
  addCard: { display: 'flex', gap: 8, padding: 12, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', flexWrap: 'wrap' },
  addInput: { flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, outline: 'none' },
  sendBtn: { padding: '8px 16px', borderRadius: 8, background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' },
  pendingSection: { background: 'rgba(255,193,7,0.06)', border: '1px solid rgba(255,193,7,0.3)', borderRadius: 12, padding: 12 },
  pendingTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 },
  pendingCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' },
  acceptBtn: { width: 32, height: 32, borderRadius: 8, background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' },
  declineBtn: { width: 32, height: 32, borderRadius: 8, background: 'none', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--danger)', cursor: 'pointer' },
  searchBox: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-light)' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--text)' },
  list: { display: 'flex', flexDirection: 'column', gap: 6 },
  card: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', cursor: 'pointer' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 40, height: 40, borderRadius: '50%', background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' },
  info: { flex: 1 },
  friendName: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  friendMeta: { fontSize: 12, color: 'var(--text-light)' },
  streak: { fontSize: 14, fontWeight: 600 },
  empty: { textAlign: 'center', padding: 32, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' },
  emptyImg: { width: 80, height: 80, objectFit: 'contain', marginBottom: 8 },
};
