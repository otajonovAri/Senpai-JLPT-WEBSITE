import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// Landing va ochiq sahifalar uchun umumiy footer.
// Struktura: 4 ustun havolalar + ajdaho ijtimoiy ikonlar (intero prototipidan).
const SOCIALS = [
  { icon: '/mascot/icons/telegram.png', label: 'Telegram', href: 'https://t.me/ariCoder' },
  { icon: '/mascot/icons/instagram.png', label: 'Instagram', href: 'https://instagram.com/' },
  { icon: '/mascot/icons/youtube.png', label: 'YouTube', href: 'https://youtube.com/' },
  { icon: '/mascot/icons/github.png', label: 'GitHub', href: 'https://github.com/otajonovAri' },
];

export default function Footer() {
  const { t } = useLanguage();

  const COLUMNS = [
    {
      title: t('footer.colInfo'),
      links: [
        { label: t('footer.about'), to: '/about' },
        { label: t('footer.mission'), to: '/mission' },
        { label: t('footer.terms'), to: '/terms' },
      ],
    },
    {
      title: t('footer.colLearn'),
      links: [
        { label: t('footer.lessons'), to: '/lessons' },
        { label: t('footer.effectiveness'), to: '/effectiveness' },
        { label: t('footer.offer'), to: '/offer' },
      ],
    },
    {
      title: t('footer.colProducts'),
      links: [
        { label: t('footer.forSchools'), to: '/for-schools' },
        { label: t('footer.forDevelopers'), to: '/for-developers' },
        { label: t('footer.partnership'), to: '/partnership' },
      ],
    },
    {
      title: t('footer.colHelp'),
      links: [
        { label: t('footer.helpCenter'), to: '/help' },
        { label: t('footer.privacy'), to: '/privacy' },
        { label: t('footer.account'), to: '/profile' },
        { label: t('footer.payments'), to: '/premium' },
      ],
    },
  ];

  return (
    <footer style={S.footer}>
      <div style={S.bubbleA} />
      <div style={S.bubbleB} />

      <div style={S.inner}>
        <div style={S.top}>
          <div style={S.brandCol}>
            <div style={S.brandRow}>
              <img src="/mascot/logo.png" alt="" style={S.brandLogo} />
              <span style={S.brandName}>SenpaiJLPT</span>
            </div>
            <p style={S.brandSub}>{t('footer.tagline')}</p>

            <div style={S.socialRow}>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="footer-social-link"
                  style={S.socialLink}
                >
                  <img src={s.icon} alt="" style={S.socialImg} />
                </a>
              ))}
            </div>
          </div>

          <div style={S.linkGrid}>
            {COLUMNS.map(col => (
              <div key={col.title}>
                <h3 style={S.colTitle}>{col.title}</h3>
                <ul style={S.colList}>
                  {col.links.map(l => (
                    <li key={l.to} style={{ marginBottom: 10 }}>
                      <Link to={l.to} style={S.colLink} className="footer-link">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={S.bottom}>
          © {new Date().getFullYear()} <strong>SenpaiJLPT</strong>. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}

const S = {
  footer: {
    background: 'linear-gradient(145deg, var(--primary), var(--primary-dark))',
    color: '#fff',
    padding: '56px 24px 28px',
    borderRadius: '48px 48px 0 0',
    marginTop: 60,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 -12px 40px rgba(88,204,2,0.18)',
  },
  bubbleA: {
    position: 'absolute', width: 240, height: 240, left: -80, top: -60,
    borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
  },
  bubbleB: {
    position: 'absolute', width: 180, height: 180, right: -40, bottom: -40,
    borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
  },
  inner: { maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 2 },
  top: {
    display: 'flex', flexWrap: 'wrap', gap: 40,
    justifyContent: 'space-between', marginBottom: 36,
  },
  brandCol: { flex: '1 1 260px', minWidth: 240 },
  brandRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  brandLogo: { width: 38, height: 38, objectFit: 'contain' },
  brandName: { fontSize: 26, fontWeight: 900, letterSpacing: -0.5 },
  brandSub: { fontSize: 15, opacity: 0.9, marginBottom: 22, maxWidth: 280, lineHeight: 1.5 },
  socialRow: { display: 'flex', gap: 14, flexWrap: 'wrap' },
  socialLink: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 58, height: 58, borderRadius: '50%', background: '#fff',
    boxShadow: '0 6px 0 var(--primary-dark), 0 10px 24px rgba(0,0,0,0.14)',
    textDecoration: 'none',
  },
  socialImg: { width: 34, height: 34, objectFit: 'contain', display: 'block' },
  linkGrid: {
    flex: '2 1 560px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 28,
  },
  colTitle: {
    fontSize: 15, fontWeight: 800, marginBottom: 14,
    letterSpacing: 0.3, textTransform: 'uppercase', opacity: 0.95,
  },
  colList: { listStyle: 'none', padding: 0, margin: 0 },
  colLink: {
    fontSize: 14, color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none', fontWeight: 500,
  },
  bottom: {
    fontSize: 14, opacity: 0.9, textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,0.16)', paddingTop: 20,
  },
};
