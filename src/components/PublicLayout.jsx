import { Link } from 'react-router-dom';
import Footer from './Footer';

// Landing'dan tashqari barcha ochiq sahifalar uchun qobiq (nav + footer).
export default function PublicLayout({ children }) {
  return (
    <div style={S.page}>
      <header style={S.nav}>
        <Link to="/" style={S.brand}>
          <img src="/mascot/logo.png" alt="" style={S.logo} />
          <span style={S.brandName}>SenpaiJLPT</span>
        </Link>
        <nav style={S.navLinks}>
          <Link to="/login" style={S.loginBtn} className="press">Kirish</Link>
        </nav>
      </header>

      <main style={S.main}>{children}</main>

      <Footer />
    </div>
  );
}

// Ichki sahifalarda takrorlanadigan bloklar
export function PageHero({ icon, badge, title, subtitle }) {
  return (
    <section style={S.hero} className="anim-fade-up">
      {icon && <img src={icon} alt="" style={S.heroIcon} />}
      {badge && <div style={S.badge}>{badge}</div>}
      <h1 style={S.heroTitle}>{title}</h1>
      {subtitle && <p style={S.heroSub}>{subtitle}</p>}
    </section>
  );
}

export function CardGrid({ items }) {
  return (
    <div style={S.grid} className="stagger-grid">
      {items.map(it => (
        <div key={it.title} style={S.card} className="card-interactive">
          <div style={S.cardIcon}>{it.emoji}</div>
          <h3 style={S.cardTitle}>{it.title}</h3>
          <p style={S.cardBody}>{it.body}</p>
        </div>
      ))}
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <section style={S.section} className="anim-fade-up">
      {title && <h2 style={S.sectionTitle}>{title}</h2>}
      {children}
    </section>
  );
}

export function CtaBlock({ title, body, buttonText, to, href }) {
  const props = href
    ? { as: 'a', href, target: '_blank', rel: 'noopener noreferrer' }
    : {};
  return (
    <section style={S.cta} className="anim-scale-in">
      <h2 style={S.ctaTitle}>{title}</h2>
      <p style={S.ctaBody}>{body}</p>
      {href ? (
        <a href={href} style={S.ctaBtn} className="press" {...props}>{buttonText}</a>
      ) : (
        <Link to={to} style={S.ctaBtn} className="press">{buttonText}</Link>
      )}
    </section>
  );
}

const S = {
  page: { minHeight: '100vh', background: 'var(--bg-alt, var(--bg-alt))', display: 'flex', flexDirection: 'column' },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px', maxWidth: 1140, margin: '0 auto', width: '100%',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  logo: { width: 36, height: 36, objectFit: 'contain' },
  brandName: { fontSize: 20, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.4 },
  navLinks: { display: 'flex', gap: 10 },
  loginBtn: {
    padding: '9px 22px', borderRadius: 999, background: 'var(--primary)', color: '#fff',
    fontSize: 14, fontWeight: 800, textDecoration: 'none', boxShadow: '0 3px 0 var(--primary-dark)',
  },
  main: { flex: 1, maxWidth: 1000, margin: '0 auto', width: '100%', padding: '24px 24px 40px' },

  hero: { textAlign: 'center', padding: '32px 0 40px' },
  heroIcon: { width: 130, height: 130, objectFit: 'contain', marginBottom: 12, filter: 'drop-shadow(0 12px 22px rgba(46,125,50,0.18))' },
  badge: {
    display: 'inline-block', padding: '5px 16px', borderRadius: 999, marginBottom: 12,
    background: 'var(--primary-soft, rgba(88,204,2,0.14))', color: 'var(--primary-dark, var(--primary-dark))',
    fontSize: 12, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
  },
  heroTitle: { fontSize: 38, fontWeight: 900, color: 'var(--text)', letterSpacing: -1, lineHeight: 1.15, marginBottom: 12 },
  heroSub: { fontSize: 17, color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.6, maxWidth: 620, margin: '0 auto' },

  section: { marginBottom: 44 },
  sectionTitle: { fontSize: 24, fontWeight: 900, color: 'var(--text)', marginBottom: 18, letterSpacing: -0.5 },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 },
  card: {
    background: 'var(--bg-card, #fff)', borderRadius: 22, padding: '24px 20px',
    border: '1px solid var(--border-light, var(--border-light))',
  },
  cardIcon: { fontSize: 34, marginBottom: 10 },
  cardTitle: { fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 6 },
  cardBody: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 },

  cta: {
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff',
    borderRadius: 28, padding: '40px 32px', textAlign: 'center', marginBottom: 20,
  },
  ctaTitle: { fontSize: 26, fontWeight: 900, marginBottom: 10 },
  ctaBody: { fontSize: 16, opacity: 0.92, marginBottom: 22, lineHeight: 1.6, maxWidth: 520, margin: '0 auto 22px' },
  ctaBtn: {
    display: 'inline-block', padding: '14px 34px', borderRadius: 999,
    background: '#fff', color: 'var(--primary-dark)', fontSize: 15, fontWeight: 800,
    textDecoration: 'none', boxShadow: '0 4px 0 rgba(0,0,0,0.15)',
  },
};
