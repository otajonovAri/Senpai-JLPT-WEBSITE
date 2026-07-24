import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { JlptLevelToInt } from '../../api/enums';
import { useToast } from '../../context/ToastContext';
import AdminTable from './AdminTable';
import AdminModal, { FormField, inputStyle, selectStyle } from './AdminModal';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const CATEGORIES = [
  { value: 0, label: 'Vocabulary' },
  { value: 1, label: 'Kanji' },
  { value: 2, label: 'Grammar' },
  { value: 3, label: 'Mixed' },
];
const categoryLabel = (val) => CATEGORIES.find(c => c.value === val)?.label || val;

const columns = [
  { key: 'title', label: 'Sarlavha' },
  { key: 'titleUz', label: 'Sarlavha UZ' },
  {
    key: 'level',
    label: 'Daraja',
    render: (val) => <span style={badgeStyle}>{val}</span>,
  },
  {
    key: 'category',
    label: 'Kategoriya',
    render: (val) => categoryLabel(val),
  },
  { key: 'order', label: 'Tartib' },
  { key: 'xpReward', label: 'XP' },
  { key: 'itemCount', label: 'Elementlar' },
];

const badgeStyle = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 6,
  background: 'var(--secondary-soft)',
  color: 'var(--secondary)',
  fontSize: 11,
  fontWeight: 700,
};

const emptyForm = {
  title: '', titleUz: '', level: 'N5',
  category: 0, order: '', xpReward: '', iconChar: '',
};

export default function AdminLessons() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi.listLessons(level)
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [level]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await adminApi.deleteLesson(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success("Dars o'chirildi");
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
    const catVal = CATEGORIES.find(c => c.label === row.category)?.value ?? row.category;
    setForm({
      title: row.title || '',
      titleUz: row.titleUz || '',
      level: row.level || 'N5',
      category: catVal,
      order: row.order?.toString() || '',
      xpReward: row.xpReward?.toString() || '',
      iconChar: row.iconChar || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const body = {
        ...form,
        // §2.2 — body'da enum int bo'lishi shart (N5=5 … N1=1)
        level: JlptLevelToInt[form.level] ?? 5,
        category: parseInt(form.category),
        order: parseInt(form.order) || 0,
        xpReward: parseInt(form.xpReward) || 0,
      };
      if (editItem) {
        await adminApi.updateLesson(editItem.id, body);
        toast.success("Dars yangilandi");
      } else {
        await adminApi.createLesson(body);
        toast.success("Dars qo'shildi");
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
      <div style={styles.filters}>
        <button
          style={level === null ? styles.filterActive : styles.filterBtn}
          className="press"
          onClick={() => setLevel(null)}
        >
          Hammasi
        </button>
        {LEVELS.map(l => (
          <button
            key={l}
            style={level === l ? styles.filterActive : styles.filterBtn}
            className="press"
            onClick={() => setLevel(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <AdminTable
        title="Darslar"
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
        title={editItem ? "Darsni tahrirlash" : "Yangi dars qo'shish"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Sarlavha">
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required />
        </FormField>
        <FormField label="Sarlavha UZ">
          <input style={inputStyle} value={form.titleUz} onChange={e => set('titleUz', e.target.value)} />
        </FormField>
        <FormField label="Daraja">
          <select style={selectStyle} value={form.level} onChange={e => set('level', e.target.value)}>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </FormField>
        <FormField label="Kategoriya">
          <select style={selectStyle} value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </FormField>
        <FormField label="Tartib raqami">
          <input style={inputStyle} type="number" value={form.order} onChange={e => set('order', e.target.value)} />
        </FormField>
        <FormField label="XP mukofot">
          <input style={inputStyle} type="number" value={form.xpReward} onChange={e => set('xpReward', e.target.value)} />
        </FormField>
        <FormField label="Icon belgi">
          <input style={inputStyle} value={form.iconChar} onChange={e => set('iconChar', e.target.value)} placeholder="📖" />
        </FormField>
      </AdminModal>
    </div>
  );
}

const styles = {
  filters: {
    display: 'flex',
    gap: 6,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--bg-card, white)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  filterActive: {
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid var(--secondary)',
    background: 'var(--secondary)',
    color: 'white',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
