import { useLanguage } from '../context/LanguageContext';

const LANGS = [
  { code: 'uz', label: "O'z" },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

/**
 * Compact 3-way language segment (UZ / EN / RU) for public pages
 * where the full Settings screen isn't reachable (landing, auth).
 */
export default function LangSwitcher({ style }) {
  const { lang, setLang } = useLanguage();
  return (
    <div style={{ ...wrap, ...style }}>
      {LANGS.map(l => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          className="press"
          style={{ ...btn, ...(lang === l.code ? btnActive : {}) }}
          aria-pressed={lang === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

const wrap = {
  display: 'inline-flex', gap: 2, padding: 3,
  background: 'var(--bg-alt)', border: '2px solid var(--border)',
  borderRadius: 'var(--radius-full)',
};
const btn = {
  padding: '5px 11px', borderRadius: 'var(--radius-full)',
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontSize: 12.5, fontWeight: 800, color: 'var(--text-light)',
  fontFamily: 'var(--font-sans)', transition: 'all 0.15s ease',
};
const btnActive = { background: 'var(--primary)', color: '#fff' };
