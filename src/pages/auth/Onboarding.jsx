import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui';

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);

  const slides = [
    { title: t('onboarding.slide1Title'), sub: t('onboarding.slide1Sub'), tint: 'var(--primary-soft)', ring: 'var(--primary)' },
    { title: t('onboarding.slide2Title'), sub: t('onboarding.slide2Sub'), tint: 'var(--secondary-soft)', ring: 'var(--secondary)' },
    { title: t('onboarding.slide3Title'), sub: t('onboarding.slide3Sub'), tint: 'var(--accent-soft)', ring: 'var(--accent)' },
  ];

  const handleNext = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else navigate('/login');
  };

  const slide = slides[step];

  return (
    <div style={styles.page}>
      <div style={styles.top}>
        <span style={styles.brand}>Senpai<span style={{ color: 'var(--primary)' }}>JLPT</span></span>
        <button style={styles.skip} onClick={() => navigate('/login')}>{t('onboarding.skip')}</button>
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
          {step === slides.length - 1 ? t('onboarding.start') : t('onboarding.next')}
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
