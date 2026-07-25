import { Link } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useLanguage } from '../context/LanguageContext';
import { Button, Reveal, CountUp } from '../components/ui';
import Footer from '../components/Footer';
import LangSwitcher from '../components/LangSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import { Check } from 'lucide-react';

export default function Landing() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { t } = useLanguage();

  const FEATURES = [
    { icon: '/mascot/icons/brain.png', soft: 'var(--secondary-soft)', title: t('landing.feature1Title'), body: t('landing.feature1Body') },
    { icon: '/mascot/icons/gamepad.png', soft: 'var(--accent-soft)', title: t('landing.feature2Title'), body: t('landing.feature2Body') },
    { icon: '/mascot/icons/jlpt-scroll.png', soft: 'var(--primary-soft)', title: t('landing.feature3Title'), body: t('landing.feature3Body') },
    { icon: '/mascot/icons/uz-lantern.png', soft: 'color-mix(in srgb, var(--purple) 16%, transparent)', title: t('landing.feature4Title'), body: t('landing.feature4Body') },
  ];

  const STATS = [
    { value: 18000, suffix: '+', label: t('landing.statWords') },
    { value: 2000, suffix: '+', label: t('landing.statKanji') },
    { num: 'N5–N1', label: t('landing.statLevels') },
    { value: 100, suffix: '%', label: t('landing.statFree') },
  ];

  return (
    <div style={styles.page}>
      {/* ---- Nav ---- */}
      <header style={styles.nav}>
        <div style={styles.brand}>
          <img src="/mascot/logo.png" alt="SenpaiJLPT" style={styles.navLogo} />
          <span style={styles.brandName}>SenpaiJLPT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          <LangSwitcher />
          <Button as={Link} to="/login" variant="secondary" size="sm">{t('landing.loginBtn')}</Button>
        </div>
      </header>

      {/* ---- Hero ---- */}
      <section style={{ ...styles.hero, padding: isMobile ? '32px 20px 48px' : '56px 20px 72px' }}>
        <div style={styles.blobHero} />
        <div style={styles.heroMascot} className="anim-pop">
          <img src="/mascot/flying.png" alt="SenpaiJLPT Dragon" style={styles.heroMascotImg} />
        </div>
        <h1 style={{ ...styles.heroTitle, fontSize: isMobile ? 32 : 46 }} className="anim-fade-up delay-1">
          {t('landing.heroTitle1')}<br />
          <span style={styles.heroAccent}>{t('landing.heroAccent')}</span> {t('landing.heroTitle2')}
        </h1>
        <p style={styles.heroSub} className="anim-fade-up delay-2">
          {t('landing.heroSubtitle')}
        </p>
        <div style={styles.heroCtas} className="anim-fade-up delay-3">
          <Button as={Link} to="/register" variant="primary" size="lg" className="btn-shine" style={{ minWidth: 260 }}>
            {t('landing.startFree')}
          </Button>
          <Button as={Link} to="/login" variant="secondary" size="lg" style={{ minWidth: 260 }}>
            {t('landing.haveAccount')}
          </Button>
        </div>
      </section>

      {/* ---- Stats bar ---- */}
      <section style={styles.statsBar}>
        <div style={{ ...styles.statsInner, gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)' }}>
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90} style={styles.stat}>
              <div style={styles.statNum}>
                {typeof s.value === 'number'
                  ? <><CountUp value={s.value} duration={1400} />{s.suffix}</>
                  : s.num}
              </div>
              <div style={styles.statLabel}>{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- Features ---- */}
      <section style={styles.features}>
        {FEATURES.map((f, i) => {
          const reverse = !isMobile && i % 2 === 1;
          return (
            <Reveal
              key={f.title}
              style={{
                ...styles.featureRow,
                flexDirection: isMobile ? 'column' : (reverse ? 'row-reverse' : 'row'),
                textAlign: isMobile ? 'center' : 'left',
              }}
            >
              <div style={{ ...styles.featureVisual, background: f.soft }} className="lift">
                <img src={f.icon} alt={f.title} style={styles.featureIcon} />
              </div>
              <div style={styles.featureText}>
                <h2 style={styles.featureTitle}>{f.title}</h2>
                <p style={styles.featureBody}>{f.body}</p>
              </div>
            </Reveal>
          );
        })}
      </section>

      {/* ---- How it works ---- */}
      <section style={styles.how}>
        <Reveal><h2 style={styles.sectionTitle}>{t('landing.howTitle')}</h2></Reveal>
        <div style={{ ...styles.steps, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)' }}>
          {[
            { n: 1, img: '/mascot/thinking.png', title: t('landing.step1Title'), d: t('landing.step1Body') },
            { n: 2, img: '/mascot/studying.png', title: t('landing.step2Title'), d: t('landing.step2Body') },
            { n: 3, img: '/mascot/streak.png', title: t('landing.step3Title'), d: t('landing.step3Body') },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 120} variant="scale" style={styles.stepCard} className="lift">
              <div style={styles.stepNum}>{s.n}</div>
              <img src={s.img} alt={s.title} style={styles.stepImg} />
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepDesc}>{s.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section style={styles.finalCta}>
        <Reveal variant="scale" style={styles.ctaCard}>
          <img src="/mascot/icons/rocket.png" alt="Rocket" style={styles.ctaIcon} />
          <h2 style={styles.ctaTitle}>{t('landing.ctaTitle')}</h2>
          <p style={styles.ctaSub}>{t('landing.ctaSubtitle')}</p>
          <Button as={Link} to="/register" variant="primary" size="lg" className="btn-shine" style={{ minWidth: 280 }}>
            {t('landing.ctaButton')}
          </Button>
          <div style={styles.ctaPerks}>
            {[t('landing.perkFree'), t('landing.perkUzbek'), t('landing.perkAnyDevice')].map(p => (
              <span key={p} style={styles.perk}><Check size={15} color="var(--primary)" /> {p}</span>
            ))}
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-card)', color: 'var(--text)' },

  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 24px', maxWidth: 1080, margin: '0 auto',
    position: 'sticky', top: 0, zIndex: 50,
    background: 'color-mix(in srgb, var(--bg-card) 82%, transparent)',
    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  navLogo: {
    width: 40, height: 40, borderRadius: 12, objectFit: 'contain',
    boxShadow: '0 4px 0 var(--primary-dark)',
  },
  brandName: { fontSize: 20, fontWeight: 900, letterSpacing: -0.5 },

  hero: {
    position: 'relative', textAlign: 'center', overflow: 'hidden',
    maxWidth: 820, margin: '0 auto',
  },
  blobHero: {
    position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
    width: 460, height: 460, borderRadius: '50%',
    background: 'radial-gradient(circle, var(--primary-soft), transparent 70%)',
    opacity: 0.6, pointerEvents: 'none', zIndex: 0,
  },
  heroMascot: {
    position: 'relative', zIndex: 1,
    width: 160, height: 160, margin: '0 auto 24px',
    filter: 'drop-shadow(0 12px 32px rgba(88,204,2,0.3))',
  },
  heroMascotImg: { width: '100%', height: '100%', objectFit: 'contain' },
  heroTitle: {
    position: 'relative', zIndex: 1,
    fontWeight: 900, lineHeight: 1.15, letterSpacing: -1, marginBottom: 18,
  },
  heroAccent: { color: 'var(--primary)' },
  heroSub: {
    position: 'relative', zIndex: 1,
    fontSize: 18, color: 'var(--text-secondary)', fontWeight: 600,
    maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.5,
  },
  heroCtas: {
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center',
  },

  statsBar: { background: 'var(--bg-alt)', borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)', padding: '28px 20px' },
  statsInner: { maxWidth: 900, margin: '0 auto', display: 'grid', gap: 20 },
  stat: { textAlign: 'center' },
  statNum: { fontSize: 30, fontWeight: 900, color: 'var(--primary)', letterSpacing: -0.5 },
  statLabel: { fontSize: 14, color: 'var(--text-secondary)', fontWeight: 700, marginTop: 2 },

  features: { maxWidth: 940, margin: '0 auto', padding: '64px 24px', display: 'flex', flexDirection: 'column', gap: 56 },
  featureRow: { display: 'flex', alignItems: 'center', gap: 44 },
  featureVisual: {
    flex: '0 0 auto', width: 260, height: 220, borderRadius: 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    maxWidth: '100%',
  },
  featureIcon: { width: 120, height: 120, objectFit: 'contain' },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 26, fontWeight: 900, marginBottom: 10, letterSpacing: -0.5 },
  featureBody: { fontSize: 16, color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.6 },

  how: { maxWidth: 940, margin: '0 auto', padding: '16px 24px 64px', textAlign: 'center' },
  sectionTitle: { fontSize: 30, fontWeight: 900, marginBottom: 36, letterSpacing: -0.5 },
  steps: { display: 'grid', gap: 20 },
  stepCard: {
    position: 'relative', background: 'var(--bg-card)', border: '2px solid var(--border)',
    borderRadius: 20, padding: '28px 20px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 10,
  },
  stepNum: {
    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
    width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)',
    color: 'white', fontWeight: 900, fontSize: 15,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 3px 0 var(--primary-dark)',
  },
  stepImg: { width: 80, height: 80, objectFit: 'contain' },
  stepTitle: { fontSize: 18, fontWeight: 800, marginTop: 4 },
  stepDesc: { fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.5 },

  finalCta: { padding: '20px 24px 72px', maxWidth: 720, margin: '0 auto' },
  ctaCard: {
    background: 'var(--bg-alt)', border: '2px solid var(--border)', borderRadius: 28,
    padding: '44px 28px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
  },
  ctaIcon: { width: 64, height: 64, objectFit: 'contain' },
  ctaTitle: { fontSize: 30, fontWeight: 900, letterSpacing: -0.5 },
  ctaSub: { fontSize: 16, color: 'var(--text-secondary)', fontWeight: 600, maxWidth: 420, lineHeight: 1.5 },
  ctaPerks: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 6 },
  perk: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' },

  footer: {
    borderTop: '2px solid var(--border)', padding: '32px 24px',
    textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center',
  },
  footerBrand: { fontSize: 16, fontWeight: 800 },
  footerLinks: { display: 'flex', gap: 20 },
  footerLink: { fontSize: 14, color: 'var(--secondary)', fontWeight: 800 },
  footerCopy: { fontSize: 13, color: 'var(--text-light)', fontWeight: 600 },
};
