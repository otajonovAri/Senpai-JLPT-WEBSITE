import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateSettings } from '../../api/profile';
import { Button } from '../../components/ui';
import { Target, Clock, Minus, Plus } from 'lucide-react';

export default function GoalSetup() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState({ words: 20, kanji: 10, grammar: 5 });
  const [minutes, setMinutes] = useState(15);

  const update = (key, delta, max) => {
    setGoals(g => ({ ...g, [key]: Math.max(1, Math.min(max, g[key] + delta)) }));
  };

  const handleStart = async () => {
    // §6.2 — PUT requires the full settings object; defaults for fields not shown here.
    try {
      await updateSettings({
        language: 0,
        darkMode: false,
        dailyReminderEnabled: true,
        dailyReminderTime: '20:00:00',
        notifSrsReady: true,
        notifLeaderboard: true,
        notifFriendRequest: true,
        notifChallenge: true,
        dailyWordGoal: goals.words,
        dailyKanjiGoal: goals.kanji,
        dailyGrammarGoal: goals.grammar,
        dailyMinutesGoal: minutes,
      });
    } catch { /* onboarding: ignore failures */ }
    navigate('/dashboard');
  };

  const items = [
    { key: 'words', label: "So'zlar", desc: 'Kunlik yangi so\'zlar', icon: '語', color: 'var(--purple)', soft: 'color-mix(in srgb, var(--purple) 16%, transparent)', max: 50 },
    { key: 'kanji', label: 'Kanji', desc: 'Kunlik yangi kanji', icon: '漢', color: 'var(--secondary)', soft: 'var(--secondary-soft)', max: 30 },
    { key: 'grammar', label: 'Grammatika', desc: 'Kunlik grammatika qoidasi', icon: '文', color: 'var(--primary)', soft: 'var(--primary-soft)', max: 20 },
  ];

  const timeOptions = [5, 10, 15, 30];

  return (
    <div style={styles.page}>
      <div style={styles.card} className="anim-scale-in">
        <div style={styles.steps}>
          <div style={{ ...styles.step, background: 'var(--primary)' }} />
          <div style={{ ...styles.step, background: 'var(--primary)' }} />
          <div style={styles.step} />
        </div>
        <h1 style={styles.title}><Target size={22} color="var(--primary)" /> Kunlik maqsadingiz</h1>
        <p style={styles.sub}>Har kuni qancha o'rganmoqchisiz?</p>

        <div style={styles.goalList}>
          {items.map(item => (
            <div key={item.key} style={styles.goalCard}>
              <div style={{ ...styles.goalIcon, background: item.soft, color: item.color }}>
                <span className="jp" style={{ fontSize: 20, fontWeight: 800 }}>{item.icon}</span>
              </div>
              <div style={styles.goalInfo}>
                <div style={styles.goalName}>{item.label}</div>
                <div style={styles.goalDesc}>{item.desc}</div>
              </div>
              <div style={styles.counter}>
                <button style={styles.counterBtn} className="press" onClick={() => update(item.key, -5, item.max)}><Minus size={16} /></button>
                <span style={{ ...styles.counterNum, color: item.color }}>{goals[item.key]}</span>
                <button style={styles.counterBtn} className="press" onClick={() => update(item.key, 5, item.max)}><Plus size={16} /></button>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.timeSection}>
          <div style={styles.timeLabel}>Kunlik vaqt</div>
          <div style={styles.timeChips}>
            {timeOptions.map(t => (
              <button key={t} onClick={() => setMinutes(t)} className="press"
                style={{ ...styles.timeChip, ...(minutes === t ? styles.timeChipActive : {}) }}>
                {t} daq
              </button>
            ))}
          </div>
        </div>

        <div style={styles.estimate}>
          <Clock size={18} color="var(--primary)" />
          <div>
            <div style={styles.estTitle}>~{minutes} daqiqa/kun</div>
            <div style={styles.estSub}>N5 darajasini {minutes <= 10 ? '6' : minutes <= 15 ? '3' : '2'} oyda o'tish mumkin</div>
          </div>
        </div>

        <Button variant="primary" size="lg" full onClick={handleStart}>Boshlash 🚀</Button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-alt)', padding: 20 },
  card: { background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 24, padding: 28, maxWidth: 460, width: '100%', boxShadow: 'var(--shadow-lg)' },
  steps: { display: 'flex', gap: 6, marginBottom: 22 },
  step: { flex: 1, height: 6, borderRadius: 999, background: 'var(--border)' },
  title: { fontSize: 22, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  sub: { fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 20 },
  goalList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  goalCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-alt)', border: '2px solid var(--border)', borderRadius: 16 },
  goalIcon: { width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  goalInfo: { flex: 1 },
  goalName: { fontSize: 15, fontWeight: 800, color: 'var(--text)' },
  goalDesc: { fontSize: 12, color: 'var(--text-light)', fontWeight: 600 },
  counter: { display: 'flex', alignItems: 'center', gap: 8 },
  counterBtn: { width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-card)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' },
  counterNum: { fontSize: 20, fontWeight: 900, minWidth: 30, textAlign: 'center' },
  timeSection: { marginBottom: 16 },
  timeLabel: { fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 10 },
  timeChips: { display: 'flex', gap: 8 },
  timeChip: { flex: 1, padding: '10px 8px', borderRadius: 14, background: 'var(--bg-alt)', border: '2px solid var(--border)', fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', cursor: 'pointer' },
  timeChipActive: { background: 'var(--primary-soft)', color: 'var(--primary-dark)', borderColor: 'var(--primary)' },
  estimate: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--primary-soft)', borderRadius: 14, marginBottom: 22 },
  estTitle: { fontSize: 14, fontWeight: 800, color: 'var(--text)' },
  estSub: { fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 },
};
