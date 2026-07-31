import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Mic, Camera } from 'lucide-react';

const permissions = [
  { key: 'notifications', icon: <Bell size={24} color="white" />, title: 'Bildirishnomalar', desc: 'Kunlik eslatmalar va yangiliklar uchun', benefit: "Streak yo'qolmasligi uchun eslatib turamiz" },
  { key: 'microphone', icon: <Mic size={24} color="white" />, title: 'Mikrofon', desc: "Talaffuz mashqlari uchun", benefit: "Japon tili talaffuzingizni baholash uchun kerak" },
  { key: 'camera', icon: <Camera size={24} color="white" />, title: 'Kamera', desc: 'Kanji yozish tanib olish uchun', benefit: "Yozgan kanjilaringizni tekshirish uchun kerak" },
];

export default function Permissions() {
  const navigate = useNavigate();
  const [granted, setGranted] = useState({});

  const handleAllow = (key) => {
    setGranted({ ...granted, [key]: true });
  };

  const allDone = permissions.every(p => granted[p.key]);

  if (allDone) {
    setTimeout(() => navigate('/dashboard'), 1500);
  }

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.center}>
        <div style={styles.iconBox}>
          <Bell size={46} color="white" />
        </div>
        <h1 style={styles.title}>Ruxsatlar</h1>
        <p style={styles.sub}>Ilova to'liq ishlashi uchun quyidagi ruxsatlarni bering</p>

        <div style={styles.list}>
          {permissions.map(p => (
            <div key={p.key} style={styles.benefitCard}>
              <div style={styles.benefitIcon}>{p.icon}</div>
              <div style={styles.benefitInfo}>
                <div style={styles.benefitTitle}>{p.title}</div>
                <div style={styles.benefitDesc}>{p.benefit}</div>
              </div>
              {granted[p.key] ? (
                <span style={styles.grantedBadge}>✓</span>
              ) : (
                <button style={styles.allowBtn} onClick={() => handleAllow(p.key)}>Ruxsat</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.btns}>
        <button style={styles.mainBtn} onClick={() => {
          permissions.forEach(p => handleAllow(p.key));
          navigate('/dashboard');
        }}>
          Barchasiga ruxsat berish
        </button>
        <button style={styles.laterBtn} onClick={() => navigate('/dashboard')}>
          Keyinroq
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', display: 'flex', flexDirection: 'column' },
  center: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' },
  iconBox: { width: 90, height: 90, borderRadius: 28, background: 'linear-gradient(135deg, var(--primary-light), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: '0 0 40px rgba(88,204,2,0.3)' },
  title: { fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 },
  sub: { fontSize: 12, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 20 },
  list: { width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 },
  benefitCard: { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 14, padding: '12px 14px', textAlign: 'left' },
  benefitIcon: { width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  benefitInfo: { flex: 1 },
  benefitTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text)' },
  benefitDesc: { fontSize: 10, color: 'var(--text-light)', marginTop: 1 },
  allowBtn: { padding: '6px 14px', borderRadius: 8, background: 'var(--primary)', color: 'white', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' },
  grantedBadge: { fontSize: 18, color: 'var(--success)', fontWeight: 700 },
  btns: { padding: '0 24px 30px', display: 'flex', flexDirection: 'column', gap: 8 },
  mainBtn: { padding: 15, borderRadius: 14, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(88,204,2,0.3)' },
  laterBtn: { padding: 10, fontSize: 12, fontWeight: 600, color: 'var(--text-light)', background: 'none', border: 'none', cursor: 'pointer' },
};
