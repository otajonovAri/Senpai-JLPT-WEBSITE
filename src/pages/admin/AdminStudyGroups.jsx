import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import AdminTable from './AdminTable';
import AdminModal, { FormField, inputStyle, selectStyle } from './AdminModal';
import { Check, X as XIcon } from 'lucide-react';

// GroupStatus: 0=Pending, 1=Approved, 2=Rejected (backend enum bilan bir xil)
const STATUS_TABS = [
  { key: null, label: 'Barchasi' },
  { key: 0, label: 'Kutilmoqda' },
  { key: 1, label: 'Tasdiqlangan' },
  { key: 2, label: 'Rad etilgan' },
];

const STATUS_BADGE = {
  Pending: { label: 'Kutilmoqda', bg: 'rgba(245,181,10,0.12)', color: '#B45309' },
  Approved: { label: 'Tasdiqlangan', bg: 'rgba(88,204,2,0.12)', color: '#2E7D32' },
  Rejected: { label: 'Rad etilgan', bg: 'rgba(239,68,68,0.1)', color: 'var(--danger)' },
};

const emptyForm = { name: '', description: '', maxMembers: '10', isPublic: true };

export default function AdminStudyGroups() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi.listStudyGroups(status)
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    try {
      await adminApi.approveStudyGroup(id);
      toast.success('Guruh tasdiqlandi');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.rejectStudyGroup(id);
      toast.success('Guruh rad etildi');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Guruhni a'zolari bilan birga o'chirishni tasdiqlaysizmi?")) return;
    try {
      await adminApi.deleteStudyGroup(id);
      setData(prev => prev.filter(g => g.id !== id));
      toast.success("Guruh o'chirildi");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openEdit = (row) => {
    setEditItem(row);
    setForm({
      name: row.name || '',
      description: row.description || '',
      maxMembers: row.maxMembers?.toString() || '10',
      isPublic: !!row.isPublic,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await adminApi.updateStudyGroup(editItem.id, {
        name: form.name,
        description: form.description,
        maxMembers: parseInt(form.maxMembers) || 10,
        isPublic: form.isPublic,
      });
      toast.success('Guruh yangilandi');
      setModalOpen(false);
      setEditItem(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const columns = [
    { key: 'name', label: 'Nomi', render: (val) => <span style={{ fontWeight: 700 }}>{val}</span> },
    { key: 'ownerUsername', label: 'Egasi' },
    { key: 'level', label: 'Daraja', render: (val) => <span style={levelBadge}>{val}</span> },
    {
      key: 'memberCount', label: "A'zolar",
      render: (val, row) => `${val}/${row.maxMembers}`,
    },
    {
      key: 'isPublic', label: 'Turi',
      render: (val) => val ? 'Ochiq' : 'Yopiq',
    },
    {
      key: 'status', label: 'Holat',
      render: (val) => {
        const b = STATUS_BADGE[val] || STATUS_BADGE.Pending;
        return <span style={{ ...statusBadge, background: b.bg, color: b.color }}>{b.label}</span>;
      },
    },
    {
      key: 'id', label: 'Moderatsiya',
      render: (_, row) => row.status === 'Pending' ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={approveBtn} className="press" onClick={(e) => { e.stopPropagation(); handleApprove(row.id); }}>
            <Check size={13} /> Tasdiqlash
          </button>
          <button style={rejectBtn} className="press" onClick={(e) => { e.stopPropagation(); handleReject(row.id); }}>
            <XIcon size={13} /> Rad etish
          </button>
        </div>
      ) : row.status === 'Rejected' ? (
        <button style={approveBtn} className="press" onClick={(e) => { e.stopPropagation(); handleApprove(row.id); }}>
          <Check size={13} /> Tasdiqlash
        </button>
      ) : null,
    },
  ];

  return (
    <div>
      <div style={filters}>
        {STATUS_TABS.map(t => (
          <button
            key={String(t.key)}
            style={status === t.key ? filterActive : filterBtn}
            className="press"
            onClick={() => setStatus(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AdminTable
        title="O'quv guruhlari"
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={load}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <AdminModal
        title="Guruhni tahrirlash"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Nomi *">
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required />
        </FormField>
        <FormField label="Tavsif">
          <textarea
            style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </FormField>
        <FormField label="Maksimal a'zolar (2–50)">
          <input
            style={inputStyle} type="number" min={2} max={50}
            value={form.maxMembers}
            onChange={e => set('maxMembers', e.target.value)}
          />
        </FormField>
        <FormField label="Turi">
          <select style={selectStyle} value={form.isPublic ? '1' : '0'} onChange={e => set('isPublic', e.target.value === '1')}>
            <option value="1">Ochiq — hamma qo'shila oladi</option>
            <option value="0">Yopiq — faqat taklif kodi bilan</option>
          </select>
        </FormField>
      </AdminModal>
    </div>
  );
}

const filters = { display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' };
const filterBtn = {
  padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg-card, white)', color: 'var(--text-secondary)',
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const filterActive = { ...filterBtn, border: '1px solid var(--secondary)', background: 'var(--secondary)', color: 'white' };
const levelBadge = {
  display: 'inline-block', padding: '2px 8px', borderRadius: 6,
  background: 'var(--secondary-soft)', color: 'var(--secondary)', fontSize: 11, fontWeight: 700,
};
const statusBadge = {
  display: 'inline-block', padding: '3px 10px', borderRadius: 999,
  fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
};
const approveBtn = {
  display: 'flex', alignItems: 'center', gap: 4,
  padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
  background: 'rgba(88,204,2,0.12)', color: '#2E7D32', fontSize: 12, fontWeight: 700,
  whiteSpace: 'nowrap',
};
const rejectBtn = {
  display: 'flex', alignItems: 'center', gap: 4,
  padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
  background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontSize: 12, fontWeight: 700,
  whiteSpace: 'nowrap',
};
