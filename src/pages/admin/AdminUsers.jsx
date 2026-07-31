import { useEffect, useState, useCallback, useRef } from 'react';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import ErrorState from '../../components/ErrorState';
import AdminModal, { FormField, inputStyle, selectStyle } from './AdminModal';
import { Search, Loader, Users, ShieldBan, ShieldCheck, UserCog } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const ROLES = [
  { value: 0, label: 'Student' },
  { value: 1, label: 'Teacher' },
  { value: 2, label: 'Receptionist' },
  { value: 3, label: 'Admin' },
  { value: 4, label: 'SuperAdmin' },
];

export default function AdminUsers() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const debounceRef = useRef(null);

  // Block modal
  const [blockModal, setBlockModal] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [saving, setSaving] = useState(false);

  // Role modal
  const [roleModal, setRoleModal] = useState(null);
  const [newRole, setNewRole] = useState(0);

  const load = useCallback((q) => {
    setLoading(true);
    setError(null);
    adminApi.listUsers(q || undefined)
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(val), 400);
  };

  const handleBlock = async () => {
    if (!blockModal) return;
    setSaving(true);
    try {
      await adminApi.blockUser(blockModal.id, blockReason || 'Admin tomonidan bloklangan');
      toast.success(`${blockModal.username} bloklandi`);
      setBlockModal(null);
      setBlockReason('');
      load(search);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleUnblock = async (user) => {
    try {
      await adminApi.unblockUser(user.id);
      toast.success(`${user.username} blokdan chiqarildi`);
      load(search);
    } catch (err) { toast.error(err.message); }
  };

  const handleChangeRole = async () => {
    if (!roleModal) return;
    setSaving(true);
    try {
      await adminApi.changeUserRole(roleModal.id, newRole);
      toast.success(`${roleModal.username} roli o'zgartirildi`);
      setRoleModal(null);
      load(search);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    {
      key: 'role', label: 'Roli',
      render: (val) => (
        <span style={{
          ...badgeStyle,
          background: val === 'Admin' || val === 'SuperAdmin' ? 'var(--secondary-soft)' : 'var(--bg)',
          color: val === 'Admin' || val === 'SuperAdmin' ? 'var(--secondary)' : 'var(--text-secondary)',
        }}>{val}</span>
      ),
    },
    {
      key: 'isBlocked', label: 'Holat',
      render: (val, row) => (
        <span style={{
          ...badgeStyle,
          background: val ? 'rgba(239,68,68,0.08)' : row.isActive ? 'rgba(76,175,80,0.08)' : 'var(--bg)',
          color: val ? 'var(--danger)' : row.isActive ? 'var(--success)' : 'var(--text-light)',
        }}>{val ? 'Bloklangan' : row.isActive ? 'Aktiv' : 'Nofaol'}</span>
      ),
    },
    { key: 'xpPoints', label: 'XP', render: (val) => val?.toLocaleString() || '0' },
    { key: 'coins', label: 'Tangalar', render: (val) => val?.toLocaleString() || '0' },
    {
      key: 'createdAt', label: "Ro'yxatdan",
      render: (val) => val ? new Date(val).toLocaleDateString('uz-UZ') : '-',
    },
    {
      key: '_actions', label: 'Amallar',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          {row.isBlocked ? (
            <button style={actionBtn} title="Blokdan chiqarish" onClick={() => handleUnblock(row)}>
              <ShieldCheck size={14} color="var(--success)" />
            </button>
          ) : (
            <button style={actionBtn} title="Bloklash" onClick={() => { setBlockModal(row); setBlockReason(''); }}>
              <ShieldBan size={14} color="var(--danger)" />
            </button>
          )}
          <button style={actionBtn} title="Rolni o'zgartirish" onClick={() => {
            setRoleModal(row);
            setNewRole(ROLES.find(r => r.label === row.role)?.value || 0);
          }}>
            <UserCog size={14} color="var(--secondary)" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        icon={Users}
        title="Foydalanuvchilar"
        subtitle={data ? `${data.length} ta foydalanuvchi` : 'Yuklanmoqda…'}
        accent="blue"
        back="/admin"
      />

      <div style={styles.searchWrap}>
        <Search size={16} style={{ color: 'var(--text-light)' }} />
        <input style={styles.searchInput} placeholder="Username yoki email bo'yicha qidirish..."
          value={search} onChange={e => handleSearch(e.target.value)} />
        {loading && <Loader size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-light)' }} />}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => load(search)} />
      ) : !loading && data?.length === 0 ? (
        <div style={styles.empty}><p style={styles.emptyText}>Foydalanuvchi topilmadi</p></div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>{columns.map(col => <th key={col.key} style={styles.th}>{col.label}</th>)}</tr>
            </thead>
            <tbody>
              {(data || []).map((row, idx) => (
                <tr key={row.id || idx} style={styles.tr}>
                  {columns.map(col => (
                    <td key={col.key} style={styles.td}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Block Modal */}
      <AdminModal title={`${blockModal?.username} ni bloklash`} open={!!blockModal}
        onClose={() => setBlockModal(null)} onSubmit={handleBlock} loading={saving}>
        <FormField label="Sabab">
          <input style={inputStyle} value={blockReason} onChange={e => setBlockReason(e.target.value)}
            placeholder="Bloklash sababi..." required />
        </FormField>
      </AdminModal>

      {/* Role Modal */}
      <AdminModal title={`${roleModal?.username} rolini o'zgartirish`} open={!!roleModal}
        onClose={() => setRoleModal(null)} onSubmit={handleChangeRole} loading={saving}>
        <FormField label="Yangi rol">
          <select style={selectStyle} value={newRole} onChange={e => setNewRole(Number(e.target.value))}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </FormField>
      </AdminModal>
    </div>
  );
}

const badgeStyle = { display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 };
const actionBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, borderRadius: 6, background: 'var(--bg)',
  border: '1px solid var(--border-light)', cursor: 'pointer',
};

const styles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  backBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, background: 'var(--bg)', color: 'var(--text-secondary)', textDecoration: 'none', border: '1px solid var(--border-light)' },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 },
  count: { fontSize: 12, fontWeight: 600, color: 'var(--text-light)', background: 'var(--bg)', padding: '3px 8px', borderRadius: 10 },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', marginBottom: 16 },
  searchInput: { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--text)' },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border-light)', background: 'var(--bg-card)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-light)', background: 'var(--bg)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid var(--border-light)' },
  td: { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'middle' },
  empty: { textAlign: 'center', padding: 48, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' },
  emptyText: { fontSize: 14, color: 'var(--text-light)' },
};
