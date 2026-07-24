import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSubscription, cancelSubscription } from '../../api/shop';
import ErrorState from '../../components/ErrorState';
import { Crown, CreditCard, Calendar, AlertTriangle, Loader } from 'lucide-react';

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch { return iso; }
}

function daysLeft(iso) {
  if (!iso) return 0;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function SubscriptionManage() {
  const navigate = useNavigate();
  const [showCancel, setShowCancel] = useState(false);
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getCurrentSubscription()
      .then(data => {
        setSub({
          tier: data?.tier || 'Free',
          status: data?.status || 'None',
          isActive: !!data?.isActive,
          expiresAt: data?.expiresAt,
          autoRenew: data?.autoRenew,
          platform: data?.platform,
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const isFree = sub.tier === 'Free' || !sub.isActive;
  const remaining = daysLeft(sub.expiresAt);

  if (isFree) {
    return (
      <div style={styles.page} className="stagger">
        <h1 style={styles.title}><Crown size={22} color="#FFD700" /> Obuna boshqaruvi</h1>
        <div style={styles.freeCard}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🆓</div>
          <div style={styles.freeName}>Bepul reja</div>
          <p style={styles.freeDesc}>Premium imkoniyatlardan foydalanish uchun obuna bo'ling</p>
          <button style={styles.changePlanBtn} onClick={() => navigate('/premium')}>Premium ga o'tish</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page} className="stagger">
      <h1 style={styles.title}><Crown size={22} color="#FFD700" /> Obuna boshqaruvi</h1>

      <div style={styles.card}>
        <div style={styles.planRow}>
          <div>
            <div style={styles.planName}>{sub.tier}</div>
            {sub.priceLabel && <div style={styles.planPrice}>{sub.priceLabel}</div>}
          </div>
          <div style={styles.statusBadge}>{sub.isActive ? 'Faol' : 'Muddati tugagan'}</div>
        </div>
        <div style={styles.progressSection}>
          <div style={styles.progressLabel}>{remaining} kun qoldi</div>
          <div style={styles.progressBg}>
            <div style={{ ...styles.progressFill, width: `${Math.min(100, (remaining / 365) * 100)}%` }} />
          </div>
        </div>
      </div>

      <div style={styles.detailsCard}>
        <div style={styles.detailRow}>
          <Calendar size={16} color="var(--text-light)" />
          <span style={styles.detailLabel}>Amal qilish muddati</span>
          <span style={styles.detailValue}>{fmtDate(sub.expiresAt)}</span>
        </div>
        <div style={styles.detailRow}>
          <CreditCard size={16} color="var(--text-light)" />
          <span style={styles.detailLabel}>To'lov usuli</span>
          <span style={styles.detailValue}>Payme / Click</span>
        </div>
      </div>

      <button style={styles.changePlanBtn} onClick={() => navigate('/premium')}>Rejani o'zgartirish / uzaytirish</button>

      <button style={styles.cancelBtn} onClick={() => setShowCancel(true)}>
        Obunani bekor qilish
      </button>

      {showCancel && (
        <div style={styles.cancelModal}>
          <AlertTriangle size={32} color="var(--accent)" />
          <h3 style={styles.cancelTitle}>Obunani bekor qilmoqchimisiz?</h3>
          <p style={styles.cancelDesc}>
            Obuna avtomatik yangilanmaydi — Premium imkoniyatlar {fmtDate(sub.expiresAt)} gacha amal qiladi.
          </p>
          <div style={styles.cancelBtns}>
            <button style={styles.cancelKeepBtn} onClick={() => setShowCancel(false)}>Yo'q, saqlayman</button>
            <button style={{ ...styles.cancelKeepBtn, background: 'var(--danger)' }} onClick={async () => {
              try {
                await cancelSubscription();
                setSub(s => ({ ...s, status: 'Cancelled', autoRenew: false }));
                setShowCancel(false);
              } catch {}
            }}>Ha, bekor qilish</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 },
  card: { background: 'linear-gradient(135deg, #2D1B69, #1a1040)', borderRadius: 16, padding: 20, color: 'white' },
  planRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { fontSize: 18, fontWeight: 700, color: 'white' },
  planPrice: { fontSize: 13, opacity: 0.7, marginTop: 4, color: '#ccc' },
  statusBadge: { padding: '4px 12px', borderRadius: 10, background: 'rgba(76,175,80,0.2)', color: '#81C784', fontSize: 12, fontWeight: 600 },
  progressSection: { marginTop: 16 },
  progressLabel: { fontSize: 12, opacity: 0.7, marginBottom: 6, color: '#ccc' },
  progressBg: { height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3 },
  progressFill: { height: '100%', background: '#FFD700', borderRadius: 3 },
  detailsCard: { background: 'var(--bg-card)', borderRadius: 14, padding: 16, border: '1px solid var(--border-light)' },
  detailRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-light)' },
  detailLabel: { flex: 1, fontSize: 13, color: 'var(--text-light)' },
  detailValue: { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  changePlanBtn: { width: '100%', padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' },
  cancelBtn: { width: '100%', padding: 14, borderRadius: 12, background: 'none', color: 'var(--danger)', fontSize: 14, fontWeight: 500, border: '1px solid var(--danger)', cursor: 'pointer' },
  cancelModal: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' },
  cancelTitle: { fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 10 },
  cancelDesc: { fontSize: 13, color: 'var(--text-light)', marginTop: 6, marginBottom: 16, lineHeight: 1.5 },
  cancelBtns: { display: 'flex', gap: 8 },
  cancelKeepBtn: { flex: 1, padding: 12, borderRadius: 10, background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' },
  freeCard: { textAlign: 'center', background: 'var(--bg-card)', borderRadius: 16, padding: 32, border: '1px solid var(--border-light)' },
  freeName: { fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 6 },
  freeDesc: { fontSize: 13, color: 'var(--text-light)', marginBottom: 20 },
};
