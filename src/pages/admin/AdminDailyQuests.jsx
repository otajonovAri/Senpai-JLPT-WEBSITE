import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import AdminTable from './AdminTable';
import AdminModal, { FormField, inputStyle, selectStyle } from './AdminModal';

const QUEST_TYPES = [
  { value: 0, label: 'LearnWords' },
  { value: 1, label: 'LearnKanji' },
  { value: 2, label: 'LearnGrammar' },
  { value: 3, label: 'CompleteReviews' },
  { value: 4, label: 'WriteKanji' },
  { value: 5, label: 'CompleteLessons' },
  { value: 6, label: 'EarnXp' },
  { value: 7, label: 'StudyMinutes' },
];

const columns = [
  { key: 'code', label: 'Kod' },
  {
    key: 'description',
    label: 'Tavsif',
    render: (val) => (
      <span style={{ maxWidth: 220, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {val}
      </span>
    ),
  },
  {
    key: 'type',
    label: 'Turi',
    render: (val) => <span style={badgeStyle}>{val}</span>,
  },
  { key: 'targetValue', label: 'Maqsad' },
  {
    key: 'coinReward',
    label: 'Mukofot',
    render: (val) => <span style={{ fontWeight: 700 }}>{val} coin</span>,
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
  code: '', description: '', descriptionUz: '',
  type: '0', targetValue: '', coinReward: '',
};

export default function AdminDailyQuests() {
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
    adminApi.listDailyQuests()
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await adminApi.deleteDailyQuest(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success("Vazifa o'chirildi");
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
    const typeVal = QUEST_TYPES.find(t => t.label === row.type)?.value ?? row.type;
    setForm({
      code: row.code || '',
      description: row.description || '',
      descriptionUz: row.descriptionUz || '',
      type: typeVal.toString(),
      targetValue: row.targetValue?.toString() || '',
      coinReward: row.coinReward?.toString() || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const body = {
        code: form.code,
        description: form.description,
        descriptionUz: form.descriptionUz || null,
        type: parseInt(form.type),
        targetValue: parseInt(form.targetValue) || 1,
        coinReward: parseInt(form.coinReward) || 0,
      };
      if (editItem) {
        await adminApi.updateDailyQuest(editItem.id, body);
        toast.success("Vazifa yangilandi");
      } else {
        await adminApi.createDailyQuest(body);
        toast.success("Vazifa qo'shildi");
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
        title="Kunlik vazifalar"
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
        title={editItem ? "Vazifani tahrirlash" : "Yangi vazifa qo'shish"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Kod (unique)">
          <input style={inputStyle} value={form.code} onChange={e => set('code', e.target.value)} required placeholder="learn_5_words" />
        </FormField>
        <FormField label="Tavsif (EN)">
          <input style={inputStyle} value={form.description} onChange={e => set('description', e.target.value)} required placeholder="Learn 5 new words" />
        </FormField>
        <FormField label="Tavsif (UZ)">
          <input style={inputStyle} value={form.descriptionUz} onChange={e => set('descriptionUz', e.target.value)} placeholder="5 ta yangi so'z o'rganing" />
        </FormField>
        <FormField label="Turi">
          <select style={selectStyle} value={form.type} onChange={e => set('type', e.target.value)}>
            {QUEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </FormField>
        <FormField label="Maqsad qiymati">
          <input style={inputStyle} type="number" value={form.targetValue} onChange={e => set('targetValue', e.target.value)} required placeholder="5" />
        </FormField>
        <FormField label="Mukofot (coins)">
          <input style={inputStyle} type="number" value={form.coinReward} onChange={e => set('coinReward', e.target.value)} required placeholder="10" />
        </FormField>
      </AdminModal>
    </div>
  );
}
