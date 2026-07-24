import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';

const slides = [
  {
    emoji: './assets/emoji/learn.png  ',
    title: "Yapon tilini o'zbek tilida o'rganing",
    sub: "18,000+ so'z va 2,000+ kanji bilan noldan boshlab o'rganing",
    tint: 'var(--primary-soft)',
    ring: 'var(--primary)',
  },
  {
    emoji: './assets/emoji/srs.png',
    title: 'SRS takrorlash tizimi',
    sub: "Ilmiy usul bilan so'zlarni uzoq muddatga eslab qoling",
    tint: 'var(--secondary-soft)',
    ring: 'var(--secondary)',
  },
  {
    emoji: './assets/emoji/mock.png',
    title: 'JLPT N5–N1 tayyorgarlik',
    sub: "Haqiqiy imtihonga yaqin mock testlar va mashqlar",
    tint: 'var(--accent-soft)',
    ring: 'var(--accent)',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else navigate('/login');
  };

  const slide = slides[step];

  return (
    <div style={styles.page}>
      <div style={styles.top}>
        <span style={styles.brand}><span className="jp" style={{ color: 'var(--primary)' }}>Kana</span> HUB</span>
        <button style={styles.skip} onClick={() => navigate('/login')}>O'tkazish</button>
      </div>

      <div style={styles.center}>
        <div
          key={step}
          className="anim-pop"
          style={{ ...styles.circle, background: slide.tint, boxShadow: `0 0 0 8px color-mix(in srgb, ${slide.ring} 12%, transparent)` }}
        >
          <img src="/mascot/flying.png" style={styles.mascotImg} />
        </div>
        <div key={`t-${step}`} style={styles.info} className="anim-fade-up">
          <h1 style={styles.title}>{slide.title}</h1>
          <p style={styles.sub}>{slide.sub}</p>
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.dots}>
          {slides.map((_, i) => (
            <div key={i} style={{ ...styles.dot, ...(i === step ? styles.dotActive : {}) }} />
          ))}
        </div>
        <Button variant="primary" size="lg" onClick={handleNext}>
          {step === slides.length - 1 ? 'Boshlash 🚀' : 'Keyingi'}
        </Button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    background: 'var(--bg-card)', padding: '0 24px',
  },
  top: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 0 8px',
  },
  brand: { fontSize: 18, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 },
  skip: {
    background: 'none', border: 'none', fontSize: 14, color: 'var(--text-light)',
    fontWeight: 800, cursor: 'pointer', padding: 6,
  },
  center: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 36, textAlign: 'center',
  },
  circle: {
    width: 200, height: 200, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  info: { maxWidth: 380 },
  title: { fontSize: 26, fontWeight: 900, color: 'var(--text)', marginBottom: 10, lineHeight: 1.25 },
  sub: { fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 600 },
  footer: { padding: '0 0 40px', display: 'flex', flexDirection: 'column', gap: 20 },
  dots: { display: 'flex', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--border)', transition: 'all 0.25s ease' },
  dotActive: { width: 28, borderRadius: 4, background: 'var(--primary)' },
  mascotImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 },
};
