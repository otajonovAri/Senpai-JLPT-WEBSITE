import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { JlptLevelToInt } from '../../api/enums';
import { useToast } from '../../context/ToastContext';
import AdminTable from './AdminTable';
import AdminModal, { FormField, inputStyle, selectStyle } from './AdminModal';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

const columns = [
  {
    key: 'pattern',
    label: 'Pattern',
    render: (val) => <span className="jp" style={{ fontWeight: 600 }}>{val}</span>,
  },
  { key: 'title', label: 'Sarlavha' },
  {
    key: 'level',
    label: 'Daraja',
    render: (val) => <span style={badgeStyle}>{val}</span>,
  },
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
  pattern: '', title: '', meaning: '',
  structure: '', explanation: '', level: 'N5',
};

export default function AdminGrammar() {
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
    adminApi.listGrammar(level)
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [level]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await adminApi.deleteGrammar(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success("Grammatika o'chirildi");
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
    setForm({
      pattern: row.pattern || '',
      title: row.title || '',
      meaning: row.meaning || '',
      structure: row.structure || '',
      explanation: row.explanation || '',
      level: row.level || 'N5',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // §2.2 — body'da enum int bo'lishi shart (N5=5 … N1=1)
      const body = { ...form, level: JlptLevelToInt[form.level] ?? 5 };
      if (editItem) {
        await adminApi.updateGrammar(editItem.id, body);
        toast.success("Grammatika yangilandi");
      } else {
        await adminApi.createGrammar(body);
        toast.success("Grammatika qo'shildi");
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
        title="Grammatika"
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
        title={editItem ? "Grammatikani tahrirlash" : "Yangi grammatika qo'shish"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Pattern">
          <input style={inputStyle} className="jp" value={form.pattern} onChange={e => set('pattern', e.target.value)} required />
        </FormField>
        <FormField label="Sarlavha">
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required />
        </FormField>
        <FormField label="Ma'nosi">
          <input style={inputStyle} value={form.meaning} onChange={e => set('meaning', e.target.value)} />
        </FormField>
        <FormField label="Struktura">
          <input style={inputStyle} value={form.structure} onChange={e => set('structure', e.target.value)} placeholder="Verb + ている" />
        </FormField>
        <FormField label="Tushuntirish">
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            value={form.explanation}
            onChange={e => set('explanation', e.target.value)}
          />
        </FormField>
        <FormField label="Daraja">
          <select style={selectStyle} value={form.level} onChange={e => set('level', e.target.value)}>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
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
