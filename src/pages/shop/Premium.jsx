import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubscriptionPlans, startPayment } from '../../api/shop';
import ErrorState from '../../components/ErrorState';
import { Crown, Zap, Loader } from 'lucide-react';

const features = [
  { icon: '♾️', title: 'Cheksiz darslar', desc: 'Barcha darslarga kirish' },
  { icon: '🚫', title: 'Reklamasiz', desc: 'Hech qanday reklama' },
  { icon: '📊', title: 'Batafsil statistika', desc: 'Chuqur tahlil va grafiklar' },
  { icon: '🎯', title: 'JLPT imtihonlar', desc: 'Barcha mock testlar' },
  { icon: '🎨', title: 'Maxsus kosmetiklar', desc: 'Premium maskot buyumlari' },
  { icon: '⚡', title: '2x XP har doim', desc: 'Doimiy 2x tajriba ballari' },
];

function formatUzs(n) {
  return Number(n || 0).toLocaleString('uz-UZ');
}

export default function Premium() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentTier, setCurrentTier] = useState('Free');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payResult, setPayResult] = useState(null);
  const [payError, setPayError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // §18.4 — GET /subscription/plans → { currentTier, expiresAt, isActive, plans }
    getSubscriptionPlans()
      .then(data => {
        const list = (data?.plans || []).map(p => ({
          id: p.id,
          name: p.nameUz || p.name,
          priceUzs: p.priceUzs,
          periodMonths: p.periodMonths,
          isPopular: p.isPopular,
          tier: p.tier,
        }));
        setPlans(list);
        setCurrentTier(data?.currentTier || 'Free');
        const popular = list.find(p => p.isPopular) || list[0];
        setSelectedPlan(popular?.id ?? null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setPayError(null);
    setPaying(true);
    try {
      // §18.5 — POST /subscription/pay { planId, provider(int) } → { paymentId, amountUzs, provider }
      const res = await startPayment(selectedPlan, 'Payme');
      setPayResult(res);
    } catch (err) {
      setPayError(err.message || "To'lovni boshlashda xatolik");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const periodLabel = (m) => (m >= 12 ? 'yil' : m === 1 ? 'oy' : `${m} oy`);

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.banner} className="anim-scale-in">
        <Crown size={48} color="#FFD700" className="anim-float" />
        <h1 style={styles.bannerTitle} className="gradient-text">SenpaiJLPT Premium</h1>
        <p style={styles.bannerSub}>Yapon tilini cheksiz o'rganing</p>
        {currentTier !== 'Free' && (
          <div style={styles.tierBadge}>Joriy reja: {currentTier}</div>
        )}
      </div>

      <div style={styles.featureGrid} className="stagger-grid">
        {features.map((f, i) => (
          <div key={i} style={styles.featureCard} className="card-interactive">
            <span style={{ fontSize: 24 }}>{f.icon}</span>
            <div>
              <div style={styles.featureTitle}>{f.title}</div>
              <div style={styles.featureDesc}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.plansSection}>
        <h2 style={styles.sectionTitle}>Rejangizni tanlang</h2>
        {plans.map(plan => (
          <div key={plan.id}
            className="card-interactive press"
            style={{ ...styles.planCard, ...(selectedPlan === plan.id ? styles.planSelected : {}), ...(plan.isPopular ? { border: '2px solid var(--primary)' } : {}) }}
            onClick={() => setSelectedPlan(plan.id)}>
            {plan.isPopular && <div style={styles.popularBadge}>Eng mashhur</div>}
            <div style={styles.planLeft}>
              <div style={{ ...styles.radio, ...(selectedPlan === plan.id ? styles.radioActive : {}) }} />
              <div>
                <div style={styles.planName}>{plan.name}</div>
                {plan.savings && <div style={styles.planSavings}>{plan.savings}</div>}
              </div>
            </div>
            <div style={styles.planPrice}>
              {formatUzs(plan.priceUzs)} <span style={styles.planPeriod}>so'm/{periodLabel(plan.periodMonths)}</span>
            </div>
          </div>
        ))}
      </div>

      {payError && <div style={styles.errorBox}>{payError}</div>}

      {payResult ? (
        <div style={styles.successBox}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>To'lov boshlandi!</div>
          <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
            To'lov ID: {payResult.paymentId} · {formatUzs(payResult.amountUzs)} so'm ({payResult.provider}). To'lov sahifasiga o'ting va tasdiqlang.
          </div>
          <button style={{ ...styles.subscribeBtn, marginTop: 14 }} onClick={() => navigate('/subscription')}>
            Obunani boshqarish
          </button>
        </div>
      ) : (
        <button style={{ ...styles.subscribeBtn, opacity: paying ? 0.6 : 1 }} onClick={handleSubscribe} disabled={paying}>
          {paying ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={18} />}
          {paying ? "Boshlanyapti…" : "Premium ga o'tish"}
        </button>
      )}
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-light)' }}>To'lov: Payme yoki Click orqali</div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  banner: { textAlign: 'center', padding: '32px 20px', background: 'linear-gradient(135deg, #2D1B69, #1a1040)', borderRadius: 16, color: 'white' },
  bannerTitle: { fontSize: 26, fontWeight: 800, marginTop: 10, color: 'white' },
  bannerSub: { fontSize: 14, opacity: 0.8, marginTop: 4, color: '#ddd' },
  tierBadge: { display: 'inline-block', marginTop: 10, padding: '4px 14px', borderRadius: 12, background: 'rgba(255,215,0,0.15)', color: '#FFD700', fontSize: 12, fontWeight: 700 },
  featureGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  featureCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' },
  featureTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  featureDesc: { fontSize: 11, color: 'var(--text-light)' },
  plansSection: {},
  sectionTitle: { fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10 },
  planCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', marginBottom: 8, cursor: 'pointer', position: 'relative' },
  planSelected: { background: 'rgba(88,204,2,0.04)', borderColor: 'var(--primary)' },
  popularBadge: { position: 'absolute', top: -10, right: 14, padding: '3px 10px', borderRadius: 8, background: 'var(--primary)', color: 'white', fontSize: 10, fontWeight: 700 },
  planLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  radio: { width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border)', flexShrink: 0 },
  radioActive: { border: '5px solid var(--primary)' },
  planName: { fontSize: 15, fontWeight: 600, color: 'var(--text)' },
  planSavings: { fontSize: 11, fontWeight: 600, color: 'var(--success)', marginTop: 2 },
  planPrice: { fontSize: 16, fontWeight: 700, color: 'var(--text)' },
  planPeriod: { fontSize: 11, fontWeight: 400, color: 'var(--text-light)' },
  subscribeBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 16, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary-light), var(--primary-dark))', color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(88,204,2,0.3)' },
  errorBox: { padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 13, textAlign: 'center' },
  successBox: { textAlign: 'center', padding: 20, borderRadius: 14, background: 'rgba(76,175,80,0.06)', border: '1px solid var(--success)' },
};
