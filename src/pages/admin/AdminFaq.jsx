import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import AdminTable from './AdminTable';
import AdminModal, { FormField, inputStyle } from './AdminModal';

const columns = [
  { key: 'category', label: 'Kategoriya' },
  {
    key: 'question',
    label: 'Savol',
    render: (val) => (
      <span style={{ maxWidth: 260, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {val}
      </span>
    ),
  },
  { key: 'order', label: 'Tartib' },
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
  category: '', question: '', questionUz: '',
  answer: '', answerUz: '', order: '',
};

export default function AdminFaq() {
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
    adminApi.listFaq()
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await adminApi.deleteFaq(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success("FAQ o'chirildi");
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
      category: row.category || '',
      question: row.question || '',
      questionUz: row.questionUz || '',
      answer: row.answer || '',
      answerUz: row.answerUz || '',
      order: row.order?.toString() || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const body = {
        ...form,
        order: parseInt(form.order) || 0,
      };
      if (editItem) {
        await adminApi.updateFaq(editItem.id, body);
        toast.success("FAQ yangilandi");
      } else {
        await adminApi.createFaq(body);
        toast.success("FAQ qo'shildi");
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
        title="FAQ"
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
        title={editItem ? "FAQni tahrirlash" : "Yangi FAQ qo'shish"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Kategoriya">
          <input style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)} required placeholder="Umumiy, Obuna, Texnik..." />
        </FormField>
        <FormField label="Savol (EN)">
          <input style={inputStyle} value={form.question} onChange={e => set('question', e.target.value)} required />
        </FormField>
        <FormField label="Savol (UZ)">
          <input style={inputStyle} value={form.questionUz} onChange={e => set('questionUz', e.target.value)} />
        </FormField>
        <FormField label="Javob (EN)">
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            value={form.answer}
            onChange={e => set('answer', e.target.value)}
            required
          />
        </FormField>
        <FormField label="Javob (UZ)">
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            value={form.answerUz}
            onChange={e => set('answerUz', e.target.value)}
          />
        </FormField>
        <FormField label="Tartib raqami">
          <input style={inputStyle} type="number" value={form.order} onChange={e => set('order', e.target.value)} />
        </FormField>
      </AdminModal>
    </div>
  );
}
