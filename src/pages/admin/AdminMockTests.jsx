import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { JlptLevelToInt, TestSectionLabels } from '../../api/enums';
import { useToast } from '../../context/ToastContext';
import AdminTable from './AdminTable';
import AdminModal, { FormField, inputStyle, selectStyle } from './AdminModal';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const SECTIONS = Object.entries(TestSectionLabels).map(([value, label]) => ({
  value: parseInt(value), label,
}));

const columns = [
  { key: 'title', label: 'Sarlavha' },
  {
    key: 'level',
    label: 'Daraja',
    render: (val) => <span style={badgeStyle}>{val}</span>,
  },
  { key: 'durationMinutes', label: 'Vaqt (min)' },
  {
    key: 'questions',
    label: 'Savollar',
    render: (val) => val?.length ?? 0,
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

// Savol muharriri elementi (optionsText — har qatorda bitta variant)
const emptyQuestion = () => ({
  section: '0', prompt: '', promptUz: '', optionsText: '', correctIndex: '0', audioUrl: '',
});

const emptyForm = { title: '', level: 'N5', durationMinutes: '', questions: [emptyQuestion()] };

export default function AdminMockTests() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genForm, setGenForm] = useState({
    level: 'N5', durationMinutes: '60',
    vocabCount: '8', kanjiCount: '6', grammarCount: '8', readingCount: '4', listeningCount: '4',
  });

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi.listMockTests(level)
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [level]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("Testni barcha savollari va urinishlari bilan o'chirishni tasdiqlaysizmi?")) return;
    try {
      await adminApi.deleteMockTest(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success("Test o'chirildi");
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
      title: row.title || '',
      level: row.level || 'N5',
      durationMinutes: row.durationMinutes?.toString() || '',
      questions: (row.questions?.length ? row.questions : []).map(q => ({
        section: q.section?.toString() ?? '0',
        prompt: q.prompt || '',
        promptUz: q.promptUz || '',
        optionsText: (q.options || []).join('\n'),
        correctIndex: q.correctIndex?.toString() ?? '0',
        audioUrl: q.audioUrl || '',
      })) || [emptyQuestion()],
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    // Client tomonda tayyorlash va tekshirish
    const questions = [];
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      const options = q.optionsText.split('\n').map(s => s.trim()).filter(Boolean);
      if (!q.prompt.trim()) { toast.error(`${i + 1}-savol matni bo'sh`); return; }
      if (options.length < 2) { toast.error(`${i + 1}-savolda kamida 2 ta variant kerak`); return; }
      const correctIndex = parseInt(q.correctIndex) || 0;
      if (correctIndex >= options.length) { toast.error(`${i + 1}-savolda to'g'ri javob varianti noto'g'ri`); return; }
      questions.push({
        // §2.2 — body'da enum int bo'lishi shart
        section: parseInt(q.section) || 0,
        prompt: q.prompt.trim(),
        promptUz: q.promptUz.trim() || null,
        options,
        correctIndex,
        audioUrl: q.audioUrl.trim() || null,
      });
    }
    if (questions.length === 0) { toast.error("Kamida 1 ta savol qo'shing"); return; }

    setSaving(true);
    try {
      const body = {
        title: form.title,
        level: JlptLevelToInt[form.level] ?? 5,
        durationMinutes: parseInt(form.durationMinutes) || 0,
        questions,
      };
      if (editItem) {
        await adminApi.updateMockTest(editItem.id, body);
        toast.success('Test yangilandi');
      } else {
        await adminApi.createMockTest(body);
        toast.success("Test qo'shildi");
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

  const setGen = (key, val) => setGenForm(prev => ({ ...prev, [key]: val }));

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await adminApi.generateMockTest({
        level: JlptLevelToInt[genForm.level] ?? 5,
        durationMinutes: parseInt(genForm.durationMinutes) || 60,
        vocabCount: parseInt(genForm.vocabCount) || 0,
        kanjiCount: parseInt(genForm.kanjiCount) || 0,
        grammarCount: parseInt(genForm.grammarCount) || 0,
        readingCount: parseInt(genForm.readingCount) || 0,
        listeningCount: parseInt(genForm.listeningCount) || 0,
      });
      toast.success('Mock test generatsiya qilindi');
      setGenOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const setQuestion = (idx, key, val) => setForm(prev => ({
    ...prev,
    questions: prev.questions.map((q, i) => (i === idx ? { ...q, [key]: val } : q)),
  }));

  const addQuestion = () => setForm(prev => ({
    ...prev, questions: [...prev.questions, emptyQuestion()],
  }));

  const removeQuestion = (idx) => setForm(prev => ({
    ...prev, questions: prev.questions.filter((_, i) => i !== idx),
  }));

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
        <button style={styles.genBtn} className="press" onClick={() => setGenOpen(true)}>
          ⚡ Generatsiya
        </button>
      </div>

      <AdminTable
        title="Mock Testlar"
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
        title={editItem ? 'Testni tahrirlash' : "Yangi mock test qo'shish"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Sarlavha">
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required placeholder="JLPT N5 Sinov Testi #1" />
        </FormField>
        <FormField label="Daraja">
          <select style={selectStyle} value={form.level} onChange={e => set('level', e.target.value)}>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </FormField>
        <FormField label="Davomiylik (daqiqa)">
          <input style={inputStyle} type="number" value={form.durationMinutes} onChange={e => set('durationMinutes', e.target.value)} required placeholder="30" />
        </FormField>

        {form.questions.map((q, idx) => {
          const optionLines = q.optionsText.split('\n').map(s => s.trim()).filter(Boolean);
          return (
            <div key={idx} style={styles.questionCard}>
              <div style={styles.questionHeader}>
                <span style={styles.questionTitle}>{idx + 1}-savol</span>
                {form.questions.length > 1 && (
                  <button type="button" style={styles.removeBtn} className="press" onClick={() => removeQuestion(idx)}>
                    O'chirish
                  </button>
                )}
              </div>
              <FormField label="Bo'lim">
                <select style={selectStyle} value={q.section} onChange={e => setQuestion(idx, 'section', e.target.value)}>
                  {SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </FormField>
              <FormField label="Savol matni">
                <input style={inputStyle} value={q.prompt} onChange={e => setQuestion(idx, 'prompt', e.target.value)} placeholder="「先生」nima degani?" />
              </FormField>
              <FormField label="Savol matni (UZ)">
                <input style={inputStyle} value={q.promptUz} onChange={e => setQuestion(idx, 'promptUz', e.target.value)} />
              </FormField>
              <FormField label="Variantlar (har qatorda bittadan)">
                <textarea
                  style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
                  value={q.optionsText}
                  onChange={e => setQuestion(idx, 'optionsText', e.target.value)}
                  placeholder={"o'qituvchi\nshifokor\ntalaba\ndo'st"}
                />
              </FormField>
              <FormField label="To'g'ri javob">
                <select style={selectStyle} value={q.correctIndex} onChange={e => setQuestion(idx, 'correctIndex', e.target.value)}>
                  {(optionLines.length ? optionLines : ['—']).map((opt, i) => (
                    <option key={i} value={i}>{i + 1}: {opt}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Audio URL (Tinglash bo'limi uchun)">
                <input style={inputStyle} value={q.audioUrl} onChange={e => setQuestion(idx, 'audioUrl', e.target.value)} placeholder="https://..." />
              </FormField>
            </div>
          );
        })}

        <button type="button" style={styles.addQuestionBtn} className="press" onClick={addQuestion}>
          + Savol qo'shish
        </button>
      </AdminModal>

      <AdminModal
        title="⚡ Mock testni generatsiya qilish"
        open={genOpen}
        onClose={() => setGenOpen(false)}
        onSubmit={handleGenerate}
        loading={generating}
      >
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
          Tanlangan daraja uchun mavjud <b>so'z, kanji va grammatika</b>dan avtomatik ko'p tanlovli
          savollar (chalg'ituvchilari bilan) tuziladi va 4 ta JLPT bo'limiga taqsimlanadi.
        </p>
        <FormField label="Daraja">
          <select style={selectStyle} value={genForm.level} onChange={e => setGen('level', e.target.value)}>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </FormField>
        <FormField label="Davomiylik (daqiqa)">
          <input style={inputStyle} type="number" value={genForm.durationMinutes} onChange={e => setGen('durationMinutes', e.target.value)} />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="So'z savollari">
            <input style={inputStyle} type="number" min="0" value={genForm.vocabCount} onChange={e => setGen('vocabCount', e.target.value)} />
          </FormField>
          <FormField label="Kanji savollari">
            <input style={inputStyle} type="number" min="0" value={genForm.kanjiCount} onChange={e => setGen('kanjiCount', e.target.value)} />
          </FormField>
          <FormField label="Grammatika savollari">
            <input style={inputStyle} type="number" min="0" value={genForm.grammarCount} onChange={e => setGen('grammarCount', e.target.value)} />
          </FormField>
          <FormField label="O'qish savollari">
            <input style={inputStyle} type="number" min="0" value={genForm.readingCount} onChange={e => setGen('readingCount', e.target.value)} />
          </FormField>
          <FormField label="Tinglash savollari">
            <input style={inputStyle} type="number" min="0" value={genForm.listeningCount} onChange={e => setGen('listeningCount', e.target.value)} />
          </FormField>
        </div>
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
    alignItems: 'center',
  },
  genBtn: {
    marginLeft: 'auto',
    padding: '8px 16px',
    borderRadius: 10,
    border: 'none',
    background: 'var(--primary)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 3px 0 var(--primary-dark)',
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
  questionCard: {
    border: '2px solid var(--border)',
    borderRadius: 10,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    background: 'var(--bg)',
  },
  questionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text)',
  },
  removeBtn: {
    padding: '3px 10px',
    borderRadius: 6,
    border: '1px solid var(--danger)',
    background: 'transparent',
    color: 'var(--danger)',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  addQuestionBtn: {
    padding: '9px 12px',
    borderRadius: 8,
    border: '1px dashed var(--secondary)',
    background: 'transparent',
    color: 'var(--secondary)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
