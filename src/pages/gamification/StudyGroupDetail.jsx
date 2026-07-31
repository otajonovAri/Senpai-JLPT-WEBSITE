import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroupDetail, leaveGroup } from '../../api/studyGroups';
import ErrorState from '../../components/ErrorState';
import { Users, Crown, Shield, Copy, Check, LogOut, Loader } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function StudyGroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    getGroupDetail(id)
      .then(setGroup)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleCopy = () => {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Guruhdan chiqmoqchimisiz?")) return;
    try { await leaveGroup(id); navigate('/study-groups'); }
    catch (e) { setError(e.message); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!group) return null;

  const roleIcon = (role) => {
    if (role === 'Owner' || role === 2) return <Crown size={14} color="var(--warning)" />;
    if (role === 'Admin' || role === 1) return <Shield size={14} color="var(--secondary)" />;
    return null;
  };

  return (
    <div style={S.page} className="stagger">
      <PageHeader
        icon={Users}
        title={group.name}
        subtitle={group.description || "Tavsif yo'q"}
        accent="blue"
        back="/study-groups"
      />

      <div style={S.infoCard} className="card-interactive anim-fade-up">
        <div style={S.meta}>
          <span style={S.badge}>N{5 - (group.level || 0)}</span>
          <span style={S.metaText}><Users size={14} /> {group.members?.length || 0}/{group.maxMembers}</span>
          <span style={S.metaText}>{group.isPublic ? 'Ochiq' : 'Yopiq'}</span>
        </div>
      </div>

      {group.inviteCode && (
        <div style={S.inviteCard} className="anim-fade-up">
          <span style={S.inviteLabel}>Taklif kodi:</span>
          <code style={S.inviteCode}>{group.inviteCode}</code>
          <button style={S.copyBtn} onClick={handleCopy} className="press">
            {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
          </button>
        </div>
      )}

      <div className="anim-fade-up">
        <h2 style={S.sectionTitle}>A'zolar ({group.members?.length || 0})</h2>
        <div style={S.memberList}>
          {(group.members || []).map(m => (
            <div key={m.id || m.userId} style={S.memberCard}>
              <div style={S.memberAvatar}>{(m.username || m.fullName || '?').charAt(0).toUpperCase()}</div>
              <div style={S.memberInfo}>
                <div style={S.memberName}>{m.username || m.fullName || 'Noma\'lum'} {roleIcon(m.role)}</div>
                <div style={S.memberDate}>{m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button style={S.leaveBtn} onClick={handleLeave} className="press anim-fade-up">
        <LogOut size={16} /> Guruhdan chiqish
      </button>
    </div>
  );
}

const S = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600, margin: '0 auto' },
  backBtn: { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, alignSelf: 'flex-start' },
  infoCard: { background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 16, padding: 20 },
  name: { fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 6 },
  desc: { fontSize: 14, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 12 },
  meta: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  badge: { padding: '4px 12px', borderRadius: 8, background: 'rgba(33,150,243,0.1)', fontSize: 12, fontWeight: 700, color: 'var(--secondary-dark)' },
  metaText: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-light)' },
  inviteCard: { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 12, padding: '12px 16px' },
  inviteLabel: { fontSize: 12, color: 'var(--text-light)', fontWeight: 600 },
  inviteCode: { fontSize: 18, fontWeight: 800, letterSpacing: 2, color: 'var(--primary)', background: 'rgba(88,204,2,0.06)', padding: '4px 12px', borderRadius: 8 },
  copyBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-light)' },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 },
  memberList: { display: 'flex', flexDirection: 'column', gap: 6 },
  memberCard: { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 12, padding: '10px 14px' },
  memberAvatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), var(--secondary-light))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 },
  memberDate: { fontSize: 11, color: 'var(--text-light)' },
  leaveBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, border: '1.5px solid var(--danger)', background: 'transparent', color: 'var(--danger)', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
};
