import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { applyReferralCode, getReferralInfo } from '../../api/gamification';
import { useToast } from '../../context/ToastContext';
import { Gift, Copy, Share2, Check, Users } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function Referral() {
  const { user } = useAuth();
  const toast = useToast();

  const code = user?.referralCode || '—';
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(null);

  useEffect(() => {
    getReferralInfo().then(setInfo).catch(() => {});
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `SenpaiJLPT'da yapon tilini o'rganamiz! Mening taklif kodim: ${code}`;
    if (navigator.share) {
      navigator.share({ title: 'SenpaiJLPT', text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      toast.success('Taklif matni nusxalandi');
    }
  };

  const handleApply = async () => {
    if (!inputCode.trim()) return;
    setError('');
    try {
      const res = await applyReferralCode(inputCode.trim());
      setApplied(true);
      toast.success(res?.message || 'Kod qo\'llanildi!');
    } catch (err) {
      setError(err.message || "Kod noto'g'ri");
    }
  };

  return (
    <div style={styles.page} className="stagger">
      <PageHeader
        icon={Gift}
        title="Do'stingizni taklif qiling!"
        subtitle="Har bir taklif uchun 50 tanga oling"
        accent="pink"
        right={<img src="/mascot/Dragon_with_Lucky_Gift-removebg-preview.png" alt="" style={styles.bannerImage} />}
      />

      <div style={styles.card}>
        <div style={styles.cardTitle}>Sizning kodingiz</div>
        <div style={styles.codeBox}>
          <span style={styles.codeText}>{code}</span>
          <button style={styles.copyBtn} onClick={handleCopy}>
            {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
          </button>
        </div>
        <button style={styles.shareBtn} onClick={handleShare}>
          <Share2 size={16} /> Ulashish
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Kodni kiritish</div>
        <div style={styles.inputRow}>
          <input style={styles.input} placeholder="Kodingizni kiriting" value={inputCode}
            onChange={e => setInputCode(e.target.value)} disabled={applied} />
          <button style={{ ...styles.applyBtn, ...(applied ? { background: 'var(--success)' } : {}) }}
            onClick={handleApply} disabled={applied}>
            {applied ? 'Qo\'llanildi ✓' : "Qo'llash"}
          </button>
        </div>
        {error && <div style={styles.error}>{error}</div>}
      </div>

      {info && info.totalReferred > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}><Users size={16} /> Taklif qilinganlar ({info.totalReferred})</div>
          <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, marginBottom: 10 }}>
            Jami: +{info.totalCoinsEarned} tanga
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {info.referredUsers.map((u, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                  {u.username?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{u.username}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                    {u.reachedStreak ? '🔥 Streak ✓' : ''} {u.completedN5 ? '🎓 N5 ✓' : ''}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>+{u.coinsEarned}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardTitle}>Qanday ishlaydi?</div>
        <div style={styles.steps}>
          {['Kodingizni do\'stingizga yuboring', "Do'stingiz ro'yxatdan o'tadi", 'Ikkalangiz 50 tanga olasiz!'].map((s, i) => (
            <div key={i} style={styles.step}>
              <div style={styles.stepNum}>{i + 1}</div>
              <span style={styles.stepText}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  banner: { textAlign: 'center', padding: '32px 20px', background: 'linear-gradient(135deg, rgba(88,204,2,0.08), rgba(45,27,105,0.08))', borderRadius: 16 },
  bannerTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text)', marginTop: 12 },
  bannerSub: { fontSize: 14, color: 'var(--text-light)', marginTop: 4 },
  card: { background: 'var(--bg-card)', borderRadius: 14, padding: 18, border: '1px solid var(--border-light)' },
  cardTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 },
  codeBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg)', borderRadius: 10, border: '1px dashed var(--border)' },
  codeText: { fontSize: 18, fontWeight: 700, letterSpacing: 2, color: 'var(--primary)' },
  copyBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4 },
  shareBtn: { width: '100%', marginTop: 10, padding: 12, borderRadius: 10, background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 600, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' },
  inputRow: { display: 'flex', gap: 8 },
  input: { flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, outline: 'none' },
  applyBtn: { padding: '10px 18px', borderRadius: 8, background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' },
  error: { fontSize: 12, color: 'var(--danger)', marginTop: 6 },
  steps: { display: 'flex', flexDirection: 'column', gap: 12 },
  step: { display: 'flex', alignItems: 'center', gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 },
  stepText: { fontSize: 13, color: 'var(--text)' },
  bannerImage: { width: 80, height: 80, objectFit: 'contain', marginBottom: 12 },
};
