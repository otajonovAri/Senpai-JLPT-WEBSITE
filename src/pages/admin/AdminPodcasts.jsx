import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { getPodcastDetail, getEpisode } from '../../api/podcasts';
import { useToast } from '../../context/ToastContext';
import AdminTable from './AdminTable';
import AdminModal, { FormField, inputStyle, selectStyle } from './AdminModal';

const columns = [
  { key: 'title', label: 'Sarlavha' },
  { key: 'titleUz', label: 'Sarlavha (UZ)' },
  {
    key: 'level',
    label: 'Daraja',
    render: (v) => {
      const map = { 5: 'N5', 4: 'N4', 3: 'N3', 2: 'N2', 1: 'N1' };
      return map[v] || v;
    },
  },
  {
    key: 'category',
    label: 'Kategoriya',
    render: (v) => {
      const map = { 0: 'Conversation', 1: 'News', 2: 'Story', 3: 'Grammar', 4: 'Culture', 5: 'Business' };
      return map[v] || v;
    },
  },
  { key: 'episodeCount', label: 'Epizodlar' },
  {
    key: 'isFree',
    label: 'Bepul',
    render: (v) => v ? '✓' : '—',
  },
];

const levels = [
  { value: 5, label: 'N5' },
  { value: 4, label: 'N4' },
  { value: 3, label: 'N3' },
  { value: 2, label: 'N2' },
  { value: 1, label: 'N1' },
];

const categories = [
  { value: 0, label: 'Conversation' },
  { value: 1, label: 'News' },
  { value: 2, label: 'Story' },
  { value: 3, label: 'Grammar' },
  { value: 4, label: 'Culture' },
  { value: 5, label: 'Business' },
];

const emptyForm = {
  title: '', titleUz: '', description: '',
  level: '5', category: '0', isFree: true, coverImageUrl: '',
};

const emptyEpForm = {
  title: '', titleUz: '', audioUrl: '',
  transcript: '', transcriptUz: '',
  durationSeconds: '', orderIndex: '',
};

export default function AdminPodcasts() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [epModalOpen, setEpModalOpen] = useState(false);
  const [editEpisode, setEditEpisode] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [epForm, setEpForm] = useState(emptyEpForm);
  const [selectedPodcastId, setSelectedPodcastId] = useState(null);
  const [saving, setSaving] = useState(false);
  // Epizodlar boshqaruvi modali
  const [epListPodcast, setEpListPodcast] = useState(null);
  const [episodes, setEpisodes] = useState(null);
  const [epLoading, setEpLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi.listPodcasts()
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadEpisodes = useCallback((podcastId) => {
    setEpLoading(true);
    getPodcastDetail(podcastId)
      .then(d => setEpisodes(d.episodes || []))
      .catch(err => toast.error(err.message))
      .finally(() => setEpLoading(false));
  }, [toast]);

  // ── Podcast CRUD ──

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditItem(row);
    setForm({
      title: row.title || '',
      titleUz: row.titleUz || '',
      description: row.description || '',
      level: row.level?.toString() || '5',
      category: row.category?.toString() || '0',
      isFree: row.isFree !== false,
      coverImageUrl: row.coverImageUrl || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const body = {
        title: form.title,
        titleUz: form.titleUz,
        description: form.description || null,
        // §2.2 — body'da enum int bo'lishi shart
        level: parseInt(form.level),
        category: parseInt(form.category),
        isFree: form.isFree,
        coverImageUrl: form.coverImageUrl || null,
      };
      if (editItem) {
        await adminApi.updatePodcast(editItem.id, body);
        toast.success('Podcast yangilandi');
      } else {
        await adminApi.createPodcast(body);
        toast.success("Podcast qo'shildi");
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

  const handleDelete = async (id) => {
    if (!confirm("Podcastni barcha epizodlari bilan o'chirishni tasdiqlaysizmi?")) return;
    try {
      await adminApi.deletePodcast(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success("Podcast o'chirildi");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Epizod CRUD ──

  const openEpCreate = (podcastId) => {
    setSelectedPodcastId(podcastId);
    setEditEpisode(null);
    setEpForm(emptyEpForm);
    setEpModalOpen(true);
  };

  const openEpEdit = async (ep) => {
    try {
      // Ro'yxat DTO'sida transcript yo'q — to'liq epizodni olamiz
      const full = await getEpisode(ep.id);
      setEditEpisode(full);
      setEpForm({
        title: full.title || '',
        titleUz: full.titleUz || '',
        audioUrl: full.audioUrl || '',
        transcript: full.transcript || '',
        transcriptUz: full.transcriptUz || '',
        durationSeconds: full.durationSeconds?.toString() || '',
        orderIndex: full.orderIndex?.toString() || '',
      });
      setEpModalOpen(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEpSubmit = async () => {
    setSaving(true);
    try {
      const body = {
        title: epForm.title,
        titleUz: epForm.titleUz,
        audioUrl: epForm.audioUrl,
        transcript: epForm.transcript || null,
        transcriptUz: epForm.transcriptUz || null,
        durationSeconds: parseInt(epForm.durationSeconds) || 0,
        orderIndex: parseInt(epForm.orderIndex) || 0,
      };
      if (editEpisode) {
        await adminApi.updateEpisode(editEpisode.id, body);
        toast.success('Epizod yangilandi');
      } else {
        await adminApi.createEpisode(selectedPodcastId, body);
        toast.success("Epizod qo'shildi");
      }
      setEpModalOpen(false);
      setEpForm(emptyEpForm);
      setEditEpisode(null);
      load();
      if (epListPodcast) loadEpisodes(epListPodcast.id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEpDelete = async (ep) => {
    if (!confirm(`"${ep.title}" epizodini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await adminApi.deleteEpisode(ep.id);
      toast.success("Epizod o'chirildi");
      load();
      if (epListPodcast) loadEpisodes(epListPodcast.id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openEpList = (row) => {
    setEpListPodcast(row);
    setEpisodes(null);
    loadEpisodes(row.id);
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const setEp = (key, val) => setEpForm(prev => ({ ...prev, [key]: val }));

  const columnsWithAction = [
    ...columns,
    {
      key: '_episodes',
      label: '',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            style={actionBtnStyle}
            className="press"
            onClick={(e) => { e.stopPropagation(); openEpList(row); }}
          >
            Epizodlar
          </button>
          <button
            style={actionBtnStyle}
            className="press"
            onClick={(e) => { e.stopPropagation(); openEpCreate(row.id); }}
          >
            + Epizod
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminTable
        title="Podkastlar"
        columns={columnsWithAction}
        data={data}
        loading={loading}
        error={error}
        onRetry={load}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <AdminModal
        title={editItem ? 'Podcastni tahrirlash' : 'Yangi podcast'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Sarlavha (EN)">
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Daily Japanese" />
        </FormField>
        <FormField label="Sarlavha (UZ)">
          <input style={inputStyle} value={form.titleUz} onChange={e => set('titleUz', e.target.value)} required placeholder="Kundalik yapon tili" />
        </FormField>
        <FormField label="Tavsif">
          <textarea
            style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Podcast haqida qisqacha..."
          />
        </FormField>
        <FormField label="Daraja">
          <select style={selectStyle} value={form.level} onChange={e => set('level', e.target.value)}>
            {levels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </FormField>
        <FormField label="Kategoriya">
          <select style={selectStyle} value={form.category} onChange={e => set('category', e.target.value)}>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </FormField>
        <FormField label="Bepulmi?">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isFree} onChange={e => set('isFree', e.target.checked)} />
            Ha, bepul podcast
          </label>
        </FormField>
        <FormField label="Muqova rasmi URL">
          <input style={inputStyle} value={form.coverImageUrl} onChange={e => set('coverImageUrl', e.target.value)} placeholder="https://..." />
        </FormField>
      </AdminModal>

      <AdminModal
        title={editEpisode ? 'Epizodni tahrirlash' : "Yangi epizod qo'shish"}
        open={epModalOpen}
        onClose={() => setEpModalOpen(false)}
        onSubmit={handleEpSubmit}
        loading={saving}
      >
        <FormField label="Sarlavha (EN)">
          <input style={inputStyle} value={epForm.title} onChange={e => setEp('title', e.target.value)} required placeholder="Episode 1: Greetings" />
        </FormField>
        <FormField label="Sarlavha (UZ)">
          <input style={inputStyle} value={epForm.titleUz} onChange={e => setEp('titleUz', e.target.value)} required placeholder="1-qism: Salomlashish" />
        </FormField>
        <FormField label="Audio URL">
          <input style={inputStyle} value={epForm.audioUrl} onChange={e => setEp('audioUrl', e.target.value)} required placeholder="https://...audio.mp3" />
        </FormField>
        <FormField label="Transkript (EN)">
          <textarea
            style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
            value={epForm.transcript}
            onChange={e => setEp('transcript', e.target.value)}
          />
        </FormField>
        <FormField label="Transkript (UZ)">
          <textarea
            style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
            value={epForm.transcriptUz}
            onChange={e => setEp('transcriptUz', e.target.value)}
          />
        </FormField>
        <FormField label="Davomiylik (soniya)">
          <input style={inputStyle} type="number" value={epForm.durationSeconds} onChange={e => setEp('durationSeconds', e.target.value)} required placeholder="300" />
        </FormField>
        <FormField label="Tartib raqami">
          <input style={inputStyle} type="number" value={epForm.orderIndex} onChange={e => setEp('orderIndex', e.target.value)} placeholder="1" />
        </FormField>
      </AdminModal>

      {epListPodcast && (
        <>
          <div style={epListStyles.overlay} onClick={() => setEpListPodcast(null)} />
          <div style={epListStyles.modal} className="animate-in">
            <div style={epListStyles.header}>
              <h2 style={epListStyles.title}>{epListPodcast.titleUz || epListPodcast.title} — epizodlar</h2>
              <button style={epListStyles.closeBtn} onClick={() => setEpListPodcast(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={epListStyles.body}>
              {epLoading && <p style={epListStyles.muted}>Yuklanmoqda...</p>}
              {!epLoading && episodes?.length === 0 && (
                <p style={epListStyles.muted}>Epizodlar yo'q</p>
              )}
              {!epLoading && episodes?.map(ep => (
                <div key={ep.id} style={epListStyles.row}>
                  <div style={{ minWidth: 0 }}>
                    <div style={epListStyles.epTitle}>
                      {ep.orderIndex != null ? `${ep.orderIndex}. ` : ''}{ep.titleUz || ep.title}
                    </div>
                    {ep.durationSeconds != null && (
                      <div style={epListStyles.epMeta}>
                        {Math.floor(ep.durationSeconds / 60)}:{String(ep.durationSeconds % 60).padStart(2, '0')}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button style={actionBtnStyle} className="press" onClick={() => openEpEdit(ep)}>
                      Tahrirlash
                    </button>
                    <button style={dangerBtnStyle} className="press" onClick={() => handleEpDelete(ep)}>
                      O'chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={epListStyles.footer}>
              <button
                style={actionBtnStyle}
                className="press"
                onClick={() => openEpCreate(epListPodcast.id)}
              >
                + Yangi epizod
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const actionBtnStyle = {
  padding: '4px 10px',
  borderRadius: 6,
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  color: 'var(--secondary)',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const dangerBtnStyle = {
  ...actionBtnStyle,
  color: 'var(--danger, #e74c3c)',
  borderColor: 'var(--danger, #e74c3c)',
};

const epListStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 2000,
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(92vw, 520px)',
    maxHeight: '85vh',
    background: 'var(--bg-card, white)',
    borderRadius: 16,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    zIndex: 2001,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-light)',
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 8,
    background: 'var(--bg)',
    color: 'var(--text-secondary)',
    border: 'none',
    cursor: 'pointer',
  },
  body: {
    padding: '12px 20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  footer: {
    padding: '12px 20px',
    borderTop: '1px solid var(--border-light)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid var(--border-light)',
  },
  epTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  epMeta: {
    fontSize: 11,
    color: 'var(--text-light)',
  },
  muted: {
    fontSize: 13,
    color: 'var(--text-light)',
    textAlign: 'center',
    padding: '12px 0',
  },
};
