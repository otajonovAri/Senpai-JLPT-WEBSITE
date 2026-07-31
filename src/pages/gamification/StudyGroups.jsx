import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyGroups, getPublicGroups, createGroup, joinGroup, joinByCode } from '../../api/studyGroups';
import { useToast } from '../../context/ToastContext';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Users, Plus, Search, Lock, Globe, Loader, X, Clock } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

// Guruh holati badge'lari (student o'z guruhida ko'radi)
const STATUS_BADGE = {
  Pending: { label: 'Tasdiq kutilmoqda', bg: 'rgba(245,181,10,0.12)', color: 'var(--accent-dark)' },
  Rejected: { label: 'Rad etilgan', bg: 'rgba(239,68,68,0.1)', color: 'var(--danger)' },
};

export default function StudyGroups() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState('my');
  const [myGroups, setMyGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [joinCodeVal, setJoinCodeVal] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', level: 0, maxMembers: 10, isPublic: true });

  const loadMy = useCallback(() => {
    setLoading(true); setError(null);
    getMyGroups()
      .then(data => setMyGroups(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const loadPublic = useCallback(() => {
    setLoading(true); setError(null);
    // filterLevel — LEVELS massiv indeksi (0=N5 … 4=N1); JlptLevel qiymati = 5 - indeks
    getPublicGroups(search || undefined, filterLevel != null ? 5 - filterLevel : undefined)
      .then(data => setPublicGroups(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, filterLevel]);

  useEffect(() => { if (tab === 'my') loadMy(); else loadPublic(); }, [tab, loadMy, loadPublic]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      // form.level — indeks (0=N5…4=N1) → JlptLevel enum qiymatiga (5…1) aylantiramiz
      await createGroup({ ...form, level: 5 - form.level });
      setShowCreate(false);
      setForm({ name: '', description: '', level: 0, maxMembers: 10, isPublic: true });
      // Yangi guruh admin tasdig'ini kutadi — "Mening guruhlarim"da Pending badge bilan ko'rinadi
      toast.success("Guruh yaratildi! Admin tasdiqlagach faollashadi");
      setTab('my');
      loadMy();
    } catch (e) { setError(e.message); }
    finally { setCreating(false); }
  };

  const handleJoin = async (id) => {
    try { await joinGroup(id); loadPublic(); } catch (e) { setError(e.message); }
  };

  const handleJoinByCode = async () => {
    if (!joinCodeVal.trim()) return;
    try {
      await joinByCode(joinCodeVal.trim());
      setShowJoinCode(false); setJoinCodeVal(''); setTab('my');
    } catch (e) { setError(e.message); }
  };

  const groups = tab === 'my' ? myGroups : publicGroups;

  return (
    <div style={S.page} className="stagger">
      <PageHeader
        icon={Users}
        title="O'qish guruhlari"
        subtitle="Do'stlar bilan birgalikda o'rganing"
        accent="blue"
        right={
          <>
            <button style={S.codeBtn} className="press" onClick={() => setShowJoinCode(true)}>Kod bilan</button>
            <button style={S.createBtn} className="press" onClick={() => setShowCreate(true)}><Plus size={16} /> Yangi guruh</button>
          </>
        }
      />

      <div style={S.tabs} className="anim-fade-up">
        <button className={`chip${tab === 'my' ? ' chip--active' : ''}`} onClick={() => setTab('my')}>Mening guruhlarim</button>
        <button className={`chip${tab === 'public' ? ' chip--active' : ''}`} onClick={() => setTab('public')}>Ochiq guruhlar</button>
      </div>

      {tab === 'public' && (
        <>
          <div style={S.searchBar}>
            <Search size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-light)' }} />
            <input placeholder="Guruh qidirish..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
          </div>
          <div style={S.levels}>
            <button className={`chip${filterLevel == null ? ' chip--active' : ''}`} onClick={() => setFilterLevel(null)}>Barchasi</button>
            {LEVELS.map((lv, i) => (
              <button key={lv} className={`chip${filterLevel === i ? ' chip--active' : ''}`} onClick={() => setFilterLevel(i)}>{lv}</button>
            ))}
          </div>
        </>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={tab === 'my' ? loadMy : loadPublic} />
      ) : groups.length === 0 ? (
        <EmptyState title={tab === 'my' ? "Hali guruhga qo'shilmagansiz" : "Guruh topilmadi"} subtitle={tab === 'my' ? "Yangi guruh yarating yoki ochiq guruhlarga qo'shiling" : "Boshqa filtrlarga qarang"} />
      ) : (
        <div style={S.grid} className="stagger">
          {groups.map(g => (
            <div key={g.id} style={S.card} className="card-interactive" onClick={() => navigate('/study-groups/' + g.id)}>
              <div style={S.cardHeader}>
                <div style={{ ...S.cardIcon, background: g.isPublic ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)' }}>
                  {g.isPublic ? <Globe size={20} color="var(--success)" /> : <Lock size={20} color="var(--warning)" />}
                </div>
                <span style={S.levelBadge}>{/^N[1-5]$/.test(g.level) ? g.level : 'N5'}</span>
              </div>
              <h3 style={S.cardTitle}>{g.name}</h3>
              <p style={S.cardDesc}>{g.description || "Tavsif yo'q"}</p>
              {STATUS_BADGE[g.status] && (
                <div style={{ ...S.statusBadge, background: STATUS_BADGE[g.status].bg, color: STATUS_BADGE[g.status].color }}>
                  <Clock size={12} /> {STATUS_BADGE[g.status].label}
                </div>
              )}
              <div style={S.cardFooter}>
                <div style={S.memberInfo}><Users size={14} /><span>{g.memberCount || 0}/{g.maxMembers || 10}</span></div>
                {tab === 'public' && <button style={S.joinBtn} className="press" onClick={e => { e.stopPropagation(); handleJoin(g.id); }}>Qo'shilish</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div style={S.overlay} onClick={() => setShowCreate(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}><h2 style={S.modalTitle}>Yangi guruh yaratish</h2><button style={S.closeBtn} onClick={() => setShowCreate(false)}><X size={20} /></button></div>
            <div style={S.modalBody}>
              <label style={S.label}>Nomi *</label>
              <input style={S.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Guruh nomi" />
              <label style={S.label}>Tavsifi</label>
              <textarea style={{ ...S.input, minHeight: 60 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Qisqa tavsif" />
              <label style={S.label}>Daraja</label>
              <div style={S.levels}>{LEVELS.map((lv, i) => (<button key={lv} className={`chip${form.level === i ? ' chip--active' : ''}`} onClick={() => setForm({ ...form, level: i })}>{lv}</button>))}</div>
              <label style={S.label}>Maksimum a'zolar: {form.maxMembers}</label>
              <input type="range" min={2} max={50} value={form.maxMembers} onChange={e => setForm({ ...form, maxMembers: +e.target.value })} style={{ width: '100%' }} />
              <label style={S.checkLabel}><input type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} />Ochiq guruh</label>
            </div>
            <button style={S.submitBtn} onClick={handleCreate} disabled={creating}>{creating ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Yaratish'}</button>
          </div>
        </div>
      )}

      {showJoinCode && (
        <div style={S.overlay} onClick={() => setShowJoinCode(false)}>
          <div style={{ ...S.modal, maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}><h2 style={S.modalTitle}>Kod bilan qo'shilish</h2><button style={S.closeBtn} onClick={() => setShowJoinCode(false)}><X size={20} /></button></div>
            <div style={S.modalBody}><input style={S.input} value={joinCodeVal} onChange={e => setJoinCodeVal(e.target.value.toUpperCase())} placeholder="Taklif kodi" maxLength={8} /></div>
            <button style={S.submitBtn} onClick={handleJoinByCode}>Qo'shilish</button>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 28, fontWeight: 700, color: 'var(--text)' },
  sub: { fontSize: 14, color: 'var(--text-light)', marginTop: 4 },
  headerActions: { display: 'flex', gap: 8 },
  codeBtn: { padding: '8px 16px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer' },
  createBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' },
  tabs: { display: 'flex', gap: 4, background: 'var(--bg)', borderRadius: 12, padding: 4 },
  tab: { flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--text-light)', cursor: 'pointer', transition: 'all 0.2s' },
  tabActive: { background: 'var(--bg-card)', color: 'var(--primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  searchBar: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchInput: { width: '100%', padding: '10px 14px 10px 38px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--bg-card)', outline: 'none', color: 'var(--text)' },
  levels: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  levelBtn: { padding: '6px 14px', borderRadius: 14, background: 'var(--bg)', border: '2px solid var(--border)', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' },
  levelActive: { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 },
  card: { background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 16, padding: 16, cursor: 'pointer' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardIcon: { width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  levelBadge: { padding: '3px 10px', borderRadius: 8, background: 'rgba(33,150,243,0.1)', fontSize: 11, fontWeight: 700, color: 'var(--secondary-dark)' },
  cardTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: 'var(--text-light)', marginBottom: 12, lineHeight: 1.4 },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, marginBottom: 10 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  memberInfo: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-light)' },
  joinBtn: { padding: '6px 14px', borderRadius: 8, background: 'var(--primary)', color: 'white', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16 },
  modal: { background: 'var(--bg-card)', borderRadius: 20, width: '100%', maxWidth: 420, maxHeight: '90vh', overflow: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-light)' },
  modalTitle: { fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: 4 },
  modalBody: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' },
  input: { padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text)' },
  submitBtn: { margin: '0 20px 16px', padding: '12px', borderRadius: 12, background: 'var(--primary)', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
};
