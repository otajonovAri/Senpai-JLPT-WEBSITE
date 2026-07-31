import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { JlptLevelToInt } from '../../api/enums';
import { useToast } from '../../context/ToastContext';
import AdminTable from './AdminTable';
import AdminModal, { FormField, inputStyle, selectStyle } from './AdminModal';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

const columns = [
  {
    key: 'word',
    label: 'So\'z',
    render: (val) => <span className="jp" style={{ fontSize: 16, fontWeight: 600 }}>{val}</span>,
  },
  { key: 'reading', label: 'O\'qilishi' },
  {
    key: 'level',
    label: 'Daraja',
    render: (val) => <span style={badgeStyle}>{val}</span>,
  },
  { key: 'wordType', label: 'Turi' },
  {
    key: 'meanings',
    label: 'Ma\'nolari',
    render: (val) => Array.isArray(val) ? val.join(', ') : val,
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
  word: '', reading: '', romaji: '', level: 'N5',
  wordType: '', meanings: '', meaningsUz: '',
};

export default function AdminVocabulary() {
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
    adminApi.listVocabulary(level)
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [level]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await adminApi.deleteVocabulary(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success("So'z o'chirildi");
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
      word: row.word || '',
      reading: row.reading || '',
      romaji: row.romaji || '',
      level: row.level || 'N5',
      wordType: row.wordType || '',
      meanings: Array.isArray(row.meanings) ? row.meanings.join(', ') : (row.meanings || ''),
      meaningsUz: Array.isArray(row.meaningsUz) ? row.meaningsUz.join(', ') : (row.meaningsUz || ''),
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
        meanings: form.meanings.split(',').map(s => s.trim()).filter(Boolean),
        meaningsUz: form.meaningsUz.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (editItem) {
        await adminApi.updateVocabulary(editItem.id, body);
        toast.success("So'z yangilandi");
      } else {
        await adminApi.createVocabulary(body);
        toast.success("So'z qo'shildi");
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
        title="Lug'at so'zlari"
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
        title={editItem ? "So'zni tahrirlash" : "Yangi so'z qo'shish"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="So'z (yaponcha)">
          <input style={inputStyle} className="jp" value={form.word} onChange={e => set('word', e.target.value)} required />
        </FormField>
        <FormField label="O'qilishi">
          <input style={inputStyle} value={form.reading} onChange={e => set('reading', e.target.value)} />
        </FormField>
        <FormField label="Romaji">
          <input style={inputStyle} value={form.romaji} onChange={e => set('romaji', e.target.value)} />
        </FormField>
        <FormField label="Daraja">
          <select style={selectStyle} value={form.level} onChange={e => set('level', e.target.value)}>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </FormField>
        <FormField label="So'z turi">
          <input style={inputStyle} value={form.wordType} onChange={e => set('wordType', e.target.value)} placeholder="Noun, Verb, Adjective..." />
        </FormField>
        <FormField label="Ma'nolari (vergul bilan)">
          <input style={inputStyle} value={form.meanings} onChange={e => set('meanings', e.target.value)} placeholder="meaning1, meaning2" />
        </FormField>
        <FormField label="Ma'nolari UZ (vergul bilan)">
          <input style={inputStyle} value={form.meaningsUz} onChange={e => set('meaningsUz', e.target.value)} placeholder="ma'no1, ma'no2" />
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
    border: '2px solid var(--border)',
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
