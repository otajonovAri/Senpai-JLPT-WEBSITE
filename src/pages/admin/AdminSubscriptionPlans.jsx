import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import AdminTable from './AdminTable';
import AdminModal, { FormField, inputStyle, selectStyle } from './AdminModal';

const columns = [
  { key: 'code', label: 'Kod' },
  { key: 'name', label: 'Nom' },
  { key: 'tier', label: 'Turi' },
  {
    key: 'priceUzs',
    label: 'Narx (UZS)',
    render: (v) => v?.toLocaleString() + ' so\'m',
  },
  { key: 'periodMonths', label: 'Muddat', render: (v) => `${v} oy` },
  {
    key: 'isPopular',
    label: 'Mashhur',
    render: (v) => v ? '⭐' : '—',
  },
  {
    key: 'isActive',
    label: 'Faol',
    render: (v) => (
      <span style={{
        display: 'inline-block',
        width: 8, height: 8, borderRadius: '50%',
        background: v ? 'var(--success)' : 'var(--text-light)',
      }} />
    ),
  },
];

const tiers = [
  { value: 0, label: 'Free' },
  { value: 1, label: 'Premium' },
  { value: 2, label: 'Pro' },
];

const emptyForm = {
  code: '', name: '', nameUz: '', tier: '1',
  priceUzs: '', periodMonths: '', isPopular: false,
};

export default function AdminSubscriptionPlans() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi.listSubscriptionPlans()
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await adminApi.deleteSubscriptionPlan(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success("Obuna rejasi o'chirildi");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditItem(row);
    const tierVal = tiers.find(t => t.label === row.tier)?.value ?? row.tier;
    setForm({
      code: row.code || '',
      name: row.name || '',
      nameUz: row.nameUz || '',
      tier: tierVal.toString(),
      priceUzs: row.priceUzs?.toString() || '',
      periodMonths: row.periodMonths?.toString() || '',
      isPopular: row.isPopular || false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const body = {
        code: form.code,
        name: form.name,
        nameUz: form.nameUz || null,
        tier: parseInt(form.tier),
        priceUzs: parseFloat(form.priceUzs) || 0,
        periodMonths: parseInt(form.periodMonths) || 1,
        isPopular: form.isPopular,
      };
      if (editItem) {
        await adminApi.updateSubscriptionPlan(editItem.id, body);
        toast.success("Obuna rejasi yangilandi");
      } else {
        await adminApi.createSubscriptionPlan(body);
        toast.success("Obuna rejasi qo'shildi");
      }
      setModalOpen(false);
      setForm(emptyForm);
      setEditItem(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div>
      <AdminTable
        title="Obuna rejalari"
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={load}
        onDelete={handleDelete}
        onCreate={openCreate}
        onEdit={openEdit}
      />

      <AdminModal
        title={editItem ? "Obuna rejasini tahrirlash" : "Yangi obuna rejasi"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Kod (unique)">
          <input style={inputStyle} value={form.code} onChange={e => set('code', e.target.value)} required placeholder="premium_monthly" />
        </FormField>
        <FormField label="Nom (EN)">
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Premium Monthly" />
        </FormField>
        <FormField label="Nom (UZ)">
          <input style={inputStyle} value={form.nameUz} onChange={e => set('nameUz', e.target.value)} placeholder="Premium Oylik" />
        </FormField>
        <FormField label="Turi">
          <select style={selectStyle} value={form.tier} onChange={e => set('tier', e.target.value)}>
            {tiers.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </FormField>
        <FormField label="Narx (UZS)">
          <input style={inputStyle} type="number" value={form.priceUzs} onChange={e => set('priceUzs', e.target.value)} required placeholder="49000" />
        </FormField>
        <FormField label="Muddat (oy)">
          <input style={inputStyle} type="number" value={form.periodMonths} onChange={e => set('periodMonths', e.target.value)} required placeholder="1" />
        </FormField>
        <FormField label="Mashhur?">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isPopular} onChange={e => set('isPopular', e.target.checked)} />
            Ha, bu eng mashhur reja
          </label>
        </FormField>
      </AdminModal>
    </div>
  );
}
