import { useState, useEffect, useCallback } from 'react';
import { getReviewForecast } from '../../api/review';
import ErrorState from '../../components/ErrorState';
import { Calendar, Clock, TrendingUp, Loader } from 'lucide-react';

const DAY_NAMES = ['Yak', 'Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha'];

export default function ReviewForecast() {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getReviewForecast()
      .then(data => {
        setForecast((data?.days || []).map(f => ({
          date: f.date,
          count: f.total ?? 0,
          vocabCount: f.vocabCount ?? 0,
          kanjiCount: f.kanjiCount ?? 0,
          day: DAY_NAMES[new Date(f.date).getDay()] || '',
        })));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const maxCount = Math.max(...forecast.map(f => f.count), 1);
  const total = forecast.reduce((s, f) => s + f.count, 0);

  return (
    <div style={styles.page} className="stagger">
      <h1 style={styles.title}><Calendar size={22} /> Takrorlash taqvimi</h1>
      <p style={styles.sub}>Kelgusi 7 kun uchun SRS takrorlash rejasi</p>

      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <Clock size={20} color="var(--primary)" />
          <div style={styles.summaryNum}>{forecast[0]?.count || 0}</div>
          <div style={styles.summaryLabel}>Bugun</div>
        </div>
        <div style={styles.summaryCard}>
          <TrendingUp size={20} color="var(--info)" />
          <div style={styles.summaryNum}>{total}</div>
          <div style={styles.summaryLabel}>Jami 7 kun</div>
        </div>
        <div style={styles.summaryCard}>
          <Calendar size={20} color="var(--success)" />
          <div style={styles.summaryNum}>{Math.round(total / 7)}</div>
          <div style={styles.summaryLabel}>O'rtacha/kun</div>
        </div>
      </div>

      <div style={styles.chartCard}>
        <div style={styles.chartTitle}>Kunlik takrorlash soni</div>
        <div style={styles.chart}>
          {forecast.map((f, i) => (
            <div key={i} style={styles.barCol}>
              <div style={styles.barCount}>{f.count}</div>
              <div style={styles.barWrap}>
                <div style={{ ...styles.bar, height: `${(f.count / maxCount) * 100}%`, background: i === 0 ? 'var(--primary)' : 'var(--info)' }} />
              </div>
              <div style={{ ...styles.barDay, color: i === 0 ? 'var(--primary)' : 'var(--text-light)' }}>{f.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.listCard}>
        {forecast.map((f, i) => (
          <div key={i} style={{ ...styles.listItem, ...(i === 0 ? { background: 'rgba(88,204,2,0.05)', borderColor: 'var(--primary)' } : {}) }}>
            <div style={styles.listDate}>{i === 0 ? 'Bugun' : f.day} · {f.date}</div>
            <div style={styles.listCount}>{f.count} ta so'z</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 },
  sub: { fontSize: 14, color: 'var(--text-light)', marginTop: -8 },
  summaryRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 },
  summaryCard: { background: 'var(--bg-card)', borderRadius: 14, padding: 16, textAlign: 'center', border: '1px solid var(--border-light)' },
  summaryNum: { fontSize: 24, fontWeight: 700, color: 'var(--text)', marginTop: 4 },
  summaryLabel: { fontSize: 11, color: 'var(--text-light)' },
  chartCard: { background: 'var(--bg-card)', borderRadius: 16, padding: 20, border: '1px solid var(--border-light)' },
  chartTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 },
  chart: { display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 },
  barCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  barCount: { fontSize: 11, fontWeight: 700, color: 'var(--text)' },
  barWrap: { width: '100%', height: 100, display: 'flex', alignItems: 'flex-end' },
  bar: { width: '100%', borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height 0.5s' },
  barDay: { fontSize: 10, fontWeight: 600 },
  listCard: { display: 'flex', flexDirection: 'column', gap: 6 },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-light)' },
  listDate: { fontSize: 13, fontWeight: 500, color: 'var(--text)' },
  listCount: { fontSize: 13, fontWeight: 600, color: 'var(--primary)' },
};
