import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import AdminTable from './AdminTable';
import AdminModal, { FormField, inputStyle, selectStyle } from './AdminModal';

const SHOP_CATEGORIES = [
  { value: 0, label: 'Theme' },
  { value: 1, label: 'Avatar' },
  { value: 2, label: 'PowerUp' },
  { value: 3, label: 'Badge' },
];
const categoryLabel = (val) => SHOP_CATEGORIES.find(c => c.value === val)?.label || val;

const columns = [
  { key: 'code', label: 'Kod' },
  { key: 'name', label: 'Nomi' },
  {
    key: 'category',
    label: 'Kategoriya',
    render: (val) => categoryLabel(val),
  },
  {
    key: 'price',
    label: 'Narxi',
    render: (val) => <span style={{ fontWeight: 700 }}>{val}</span>,
  },
  {
    key: 'isActive',
    label: 'Faol',
    render: (val) => (
      <span style={{
        display: 'inline-block',
        width: 8, height: 8, borderRadius: '50%',
        background: val ? 'var(--success)' : 'var(--text-light)',
      }} />
    ),
  },
];

const emptyForm = {
  code: '', name: '', nameUz: '',
  category: 0, price: '', unlockLevel: '',
};

export default function AdminShopItems() {
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
    adminApi.listShopItems()
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await adminApi.deleteShopItem(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success("Mahsulot o'chirildi");
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
    const catVal = SHOP_CATEGORIES.find(c => c.label === row.category)?.value ?? row.category;
    setForm({
      code: row.code || '',
      name: row.name || '',
      nameUz: row.nameUz || '',
      category: catVal,
      price: row.price?.toString() || '',
      unlockLevel: row.unlockLevel?.toString() || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const body = {
        ...form,
        category: parseInt(form.category),
        price: parseInt(form.price) || 0,
        unlockLevel: parseInt(form.unlockLevel) || 0,
      };
      if (editItem) {
        await adminApi.updateShopItem(editItem.id, body);
        toast.success("Mahsulot yangilandi");
      } else {
        await adminApi.createShopItem(body);
        toast.success("Mahsulot qo'shildi");
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
        title="Do'kon mahsulotlari"
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
        title={editItem ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Kod">
          <input style={inputStyle} value={form.code} onChange={e => set('code', e.target.value)} required placeholder="dark_theme" />
        </FormField>
        <FormField label="Nomi (EN)">
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required />
        </FormField>
        <FormField label="Nomi (UZ)">
          <input style={inputStyle} value={form.nameUz} onChange={e => set('nameUz', e.target.value)} />
        </FormField>
        <FormField label="Kategoriya">
          <select style={selectStyle} value={form.category} onChange={e => set('category', e.target.value)}>
            {SHOP_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </FormField>
        <FormField label="Narxi (coins)">
          <input style={inputStyle} type="number" value={form.price} onChange={e => set('price', e.target.value)} required />
        </FormField>
        <FormField label="Ochilish darajasi">
          <input style={inputStyle} type="number" value={form.unlockLevel} onChange={e => set('unlockLevel', e.target.value)} placeholder="0" />
        </FormField>
      </AdminModal>
    </div>
  );
}
