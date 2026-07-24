import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import AdminTable from './AdminTable';
import AdminModal, { FormField, inputStyle, selectStyle } from './AdminModal';

const columns = [
  { key: 'code', label: 'Kod' },
  { key: 'name', label: 'Nom' },
  { key: 'category', label: 'Kategoriya' },
  { key: 'targetValue', label: 'Maqsad', render: (v) => v?.toLocaleString() },
  {
    key: 'iconEmoji',
    label: 'Emoji',
    render: (v) => <span style={{ fontSize: 20 }}>{v || '—'}</span>,
  },
];

const categories = [
  { value: 0, label: 'Streak' },
  { value: 1, label: 'Vocabulary' },
  { value: 2, label: 'Kanji' },
  { value: 3, label: 'Grammar' },
  { value: 4, label: 'Level' },
  { value: 5, label: 'League' },
  { value: 6, label: 'Social' },
  { value: 7, label: 'Special' },
];

const emptyForm = {
  code: '', name: '', nameUz: '', category: '0',
  targetValue: '', iconEmoji: '', description: '', descriptionUz: '',
};

export default function AdminAchievements() {
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
    adminApi.listAchievements()
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await adminApi.deleteAchievement(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success("Yutuq o'chirildi");
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
    const catVal = categories.find(c => c.label === row.category)?.value ?? row.category;
    setForm({
      code: row.code || '',
      name: row.name || '',
      nameUz: row.nameUz || '',
      category: catVal.toString(),
      targetValue: row.targetValue?.toString() || '',
      iconEmoji: row.iconEmoji || '',
      description: row.description || '',
      descriptionUz: row.descriptionUz || '',
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
        category: parseInt(form.category),
        targetValue: parseInt(form.targetValue) || 1,
        iconEmoji: form.iconEmoji || null,
        description: form.description || null,
        descriptionUz: form.descriptionUz || null,
      };
      if (editItem) {
        await adminApi.updateAchievement(editItem.id, body);
        toast.success("Yutuq yangilandi");
      } else {
        await adminApi.createAchievement(body);
        toast.success("Yutuq qo'shildi");
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
        title="Yutuqlar (Achievements)"
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
        title={editItem ? "Yutuqni tahrirlash" : "Yangi yutuq qo'shish"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Kod (unique)">
          <input style={inputStyle} value={form.code} onChange={e => set('code', e.target.value)} required placeholder="streak_7" />
        </FormField>
        <FormField label="Nom (EN)">
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Weekly Warrior" />
        </FormField>
        <FormField label="Nom (UZ)">
          <input style={inputStyle} value={form.nameUz} onChange={e => set('nameUz', e.target.value)} placeholder="Haftalik jangchi" />
        </FormField>
        <FormField label="Kategoriya">
          <select style={selectStyle} value={form.category} onChange={e => set('category', e.target.value)}>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </FormField>
        <FormField label="Maqsad qiymati">
          <input style={inputStyle} type="number" value={form.targetValue} onChange={e => set('targetValue', e.target.value)} required placeholder="7" />
        </FormField>
        <FormField label="Emoji">
          <input style={inputStyle} value={form.iconEmoji} onChange={e => set('iconEmoji', e.target.value)} placeholder="🔥" />
        </FormField>
        <FormField label="Tavsif (EN)">
          <input style={inputStyle} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Maintain a 7-day streak" />
        </FormField>
        <FormField label="Tavsif (UZ)">
          <input style={inputStyle} value={form.descriptionUz} onChange={e => set('descriptionUz', e.target.value)} placeholder="7 kunlik streak'ni saqlab turing" />
        </FormField>
      </AdminModal>
    </div>
  );
}
