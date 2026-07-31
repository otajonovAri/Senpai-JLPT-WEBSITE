import { useState } from 'react';

import { useAuth } from "../../context/AuthContext";
import { updateProfile, uploadAvatar, changePassword } from '../../api/profile';
import { useToast } from '../../context/ToastContext';
import { Camera, Save, Loader } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function ProfileEdit() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  // §5.1 — PUT /profile: { username, avatarUrl, fullName, bio }
  const [form, setForm] = useState({
    username: user?.username || '',
    fullName: user?.fullName || '',
    bio: user?.bio || '',
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('profile');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await updateProfile({
        username: form.username,
        fullName: form.fullName,
        bio: form.bio,
      });
      if (refreshUser) await refreshUser();
      setSuccess('Profil yangilandi!');
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) { setError('Parollar mos kelmaydi'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await changePassword(passwordForm.current, passwordForm.newPass);
      setSuccess("Parol o'zgartirildi!");
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setError(err.message || "Joriy parol noto'g'ri");
    }
    setSaving(false);
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      // §5.3 — multipart, maydon nomi "file" (uploadAvatar helper ichida)
      await uploadAvatar(file);
      if (refreshUser) await refreshUser();
      toast.success('Avatar yangilandi');
    } catch (err) {
      toast.error(err.message || 'Avatar yuklanmadi');
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div style={styles.page} className="stagger">
      <PageHeader icon={Camera} title="Profilni tahrirlash" size="sm" back />

      <div style={styles.avatarSection}>
        <div style={styles.avatarWrap}>
          <div style={styles.avatar}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : (form.username?.charAt(0)?.toUpperCase() || 'U')}
          </div>
          <label style={styles.cameraBtn}>
            {avatarUploading
              ? <Loader size={14} color="white" style={{ animation: 'spin 1s linear infinite' }} />
              : <Camera size={14} color="white" />}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
          </label>
        </div>
      </div>

      <div style={styles.tabs}>
        {[['profile', 'Profil'], ['password', 'Parol']].map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setError(''); setSuccess(''); }}
            style={{ ...styles.tabBtn, ...(tab === key ? styles.tabActive : {}) }}>{label}</button>
        ))}
      </div>

      {tab === 'profile' ? (
        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>To'liq ism</label>
            <input style={styles.input} value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              placeholder="Ism Familiya" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Foydalanuvchi nomi</label>
            <input style={styles.input} value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Bio</label>
            <textarea style={{ ...styles.input, resize: 'vertical', minHeight: 70, fontFamily: 'inherit' }}
              value={form.bio} rows={3} maxLength={200}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="O'zingiz haqingizda qisqacha..." />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email (o'zgartirib bo'lmaydi)</label>
            <input style={styles.input} value={user?.email || ''} disabled />
          </div>
          <button style={styles.saveBtn} onClick={handleSaveProfile} disabled={saving}>
            {saving ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <><Save size={16} /> Saqlash</>}
          </button>
        </div>
      ) : (
        <div style={styles.form}>
          {[['current', 'Joriy parol'], ['newPass', 'Yangi parol'], ['confirm', 'Parolni tasdiqlash']].map(([key, label]) => (
            <div key={key} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input style={styles.input} type="password" value={passwordForm[key]}
                onChange={e => setPasswordForm({ ...passwordForm, [key]: e.target.value })} />
            </div>
          ))}
          <button style={styles.saveBtn} onClick={handleChangePassword} disabled={saving}>
            {saving ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : "Parolni o'zgartirish"}
          </button>
        </div>
      )}

      {success && <div style={styles.success}>{success}</div>}
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { background: 'none', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' },
  headerTitle: { fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  avatarSection: { textAlign: 'center' },
  avatarWrap: { position: 'relative', display: 'inline-block' },
  avatar: { width: 80, height: 80, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' },
  tabs: { display: 'flex', gap: 6 },
  tabBtn: { flex: 1, padding: '8px 16px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'center' },
  tabActive: { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  field: {},
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' },
  saveBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' },
  success: { padding: '10px 14px', borderRadius: 8, background: 'rgba(76,175,80,0.08)', color: 'var(--success)', fontSize: 13, fontWeight: 500 },
  error: { padding: '10px 14px', borderRadius: 8, background: 'rgba(244,67,54,0.08)', color: 'var(--danger)', fontSize: 13, fontWeight: 500 },
};
