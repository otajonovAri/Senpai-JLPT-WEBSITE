import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile, createChallenge, getChallenges, removeFriend } from '../../api/gamification';
import { useToast } from '../../context/ToastContext';
import ErrorState from '../../components/ErrorState';
import { Trophy, Flame, Swords, Loader, UserMinus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function FriendProfile() {
  const { id } = useParams(); // do'stning userId'si
  const navigate = useNavigate();
  const toast = useToast();
  const [friend, setFriend] = useState(null);
  const [challenge, setChallenge] = useState(null); // shu do'st bilan faol musobaqa
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [challenging, setChallenging] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getUserProfile(id),
      getChallenges().catch(() => []),
    ])
      .then(([profile, challenges]) => {
        setFriend({
          id: profile.id,
          name: profile.username,
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
          xp: profile.xpPoints || 0,
          streak: profile.streakDays || 0,
          level: profile.level,
          joinedAt: profile.joinedAt,
          isFriend: profile.isFriend,
        });
        const active = (challenges || []).find(c =>
          (c.status === 'Active' || c.status === 'Pending') &&
          (c.challengerUsername === profile.username || c.opponentUsername === profile.username));
        setChallenge(active || null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleChallenge = async () => {
    setChallenging(true);
    try {
      // §17.6 — POST /challenges { opponentId }
      const res = await createChallenge(id);
      toast.success("Bellashuv taklifi yuborildi!");
      setChallenge({ status: res?.status || 'Pending' });
    } catch (err) {
      toast.error(err.message || "Bellashuv yaratilmadi");
    } finally {
      setChallenging(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!friend) return null;

  return (
    <div style={styles.page} className="stagger">
      <PageHeader icon={Trophy} title={friend.name} subtitle={`${friend.xp.toLocaleString()} XP`} accent="purple" back />

      <div style={styles.profileCard}>
        <div style={styles.avatar}>
          {friend.avatarUrl
            ? <img src={friend.avatarUrl} alt="" style={styles.avatarImg} />
            : friend.name?.charAt(0)?.toUpperCase()}
        </div>
        <h2 style={styles.name}>{friend.name}</h2>
        <div style={styles.xp}>{friend.xp.toLocaleString()} XP</div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <Flame size={20} color="var(--primary)" />
          <div style={styles.statNum}>{friend.streak}</div>
          <div style={styles.statLabel}>Streak</div>
        </div>
        <div style={styles.statCard}>
          <Trophy size={20} color="var(--accent)" />
          <div style={styles.statNum}>{friend.xp.toLocaleString()}</div>
          <div style={styles.statLabel}>Jami XP</div>
        </div>
      </div>

      {challenge ? (
        <div style={styles.activeChallenge}>
          <Swords size={18} color="var(--primary)" />
          <span>
            {challenge.status === 'Pending' ? 'Bellashuv taklifi kutilmoqda' : 'Faol bellashuv davom etmoqda'}
            {challenge.challengerXp !== undefined && ` · ${challenge.challengerXp} : ${challenge.opponentXp}`}
          </span>
        </div>
      ) : (
        <button style={{ ...styles.challengeBtn, opacity: challenging ? 0.6 : 1 }} onClick={handleChallenge} disabled={challenging}>
          <Swords size={16} /> {challenging ? 'Yuborilmoqda…' : 'Bellashuvga chaqirish'}
        </button>
      )}

      {friend.isFriend && (
        <button style={styles.removeBtn} onClick={async () => {
          try {
            await removeFriend(id);
            toast.success("Do'st o'chirildi");
            navigate('/friends');
          } catch (err) {
            toast.error(err.message || "Xatolik yuz berdi");
          }
        }}>
          <UserMinus size={16} /> Do'stlikdan chiqarish
        </button>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480, margin: '0 auto' },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', color: 'var(--text-secondary)', fontSize: 14, border: 'none', cursor: 'pointer', padding: 0 },
  profileCard: { textAlign: 'center', padding: '24px 20px', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-light)' },
  avatar: { width: 64, height: 64, borderRadius: '50%', background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, margin: '0 auto 12px', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' },
  name: { fontSize: 20, fontWeight: 700, color: 'var(--text)' },
  xp: { fontSize: 13, color: 'var(--text-light)', marginTop: 6 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  statCard: { textAlign: 'center', padding: 14, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' },
  statNum: { fontSize: 22, fontWeight: 700, color: 'var(--text)', marginTop: 4 },
  statLabel: { fontSize: 11, color: 'var(--text-light)' },
  activeChallenge: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, background: 'rgba(88,204,2,0.06)', border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: 13, fontWeight: 600 },
  challengeBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' },
  removeBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, background: 'none', color: 'var(--danger)', fontSize: 13, fontWeight: 500, border: '1px solid var(--danger)', cursor: 'pointer', width: '100%' },
};
