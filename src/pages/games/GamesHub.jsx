import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

// O'yinlar markazi — barcha interaktiv o'yinlar bitta joyda.
const GAMES = [
  { to: '/games/kana-ninja', emoji: '⌨️', title: "So'z Terish", sub: "Yaponcha so'zni romaji bilan yozing", color: 'var(--primary)', soft: 'var(--primary-soft)' },
  { to: '/games/reading', emoji: '📖', title: "O'qish Review", sub: "Kanji o'qilishi / ma'nosini yozing", color: 'var(--secondary)', soft: 'var(--secondary-soft)' },
  { to: '/games/grammar', emoji: '📝', title: 'Grammatika Viktorina', sub: "Pattern ↔ ma'no moslashtiring", color: 'var(--purple)', soft: 'color-mix(in srgb, var(--purple) 15%, transparent)' },
  { to: '/review/flashcards', emoji: '🎴', title: 'Flashcard', sub: "7 yo'nalishli so'z/kanji mashqi", color: 'var(--accent)', soft: 'var(--accent-soft)' },
];

export default function GamesHub() {
  const navigate = useNavigate();
  return (
    <div style={styles.page} className="stagger">
      <PageHeader
        icon={Gamepad2}
        title="O'yinlar"
        subtitle="O'ynab o'rganing — har bir natija XP va progressga yoziladi"
      />

      <div style={styles.grid}>
        {GAMES.map(g => (
          <button key={g.to} style={styles.card} className="press hover-lift" onClick={() => navigate(g.to)}>
            <div style={{ ...styles.emoji, background: g.soft }}>{g.emoji}</div>
            <div style={styles.cardText}>
              <div style={styles.cardTitle}>{g.title}</div>
              <div style={styles.cardSub}>{g.sub}</div>
            </div>
            <div style={{ ...styles.arrow, color: g.color }}>›</div>
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 640, margin: '0 auto' },
  head: { display: 'flex', alignItems: 'center', gap: 12 },
  iconWrap: { width: 46, height: 46, borderRadius: 14, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontSize: 24, fontWeight: 900, color: 'var(--text)' },
  sub: { fontSize: 13.5, color: 'var(--text-secondary)', fontWeight: 600 },
  grid: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, background: 'var(--bg-card)', border: '2px solid var(--border)', boxShadow: 'var(--shadow)', cursor: 'pointer', textAlign: 'left', width: '100%' },
  emoji: { width: 54, height: 54, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 800, color: 'var(--text)' },
  cardSub: { fontSize: 13, color: 'var(--text-light)', fontWeight: 600, marginTop: 2 },
  arrow: { fontSize: 28, fontWeight: 900, lineHeight: 1 },
};
