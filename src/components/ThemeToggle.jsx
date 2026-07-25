import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Compact light/dark toggle for public pages (landing, auth) where the
 * full 3-way theme picker in Settings isn't reachable. Flips between
 * light and dark; "system" stays available in Settings for signed-in users.
 */
export default function ThemeToggle({ style }) {
  const { dark, toggle } = useTheme();
  const label = dark ? "Yorug' rejim" : 'Tungi rejim';
  return (
    <button
      type="button"
      onClick={toggle}
      className="press"
      aria-label={label}
      title={label}
      style={{ ...btn, ...style }}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

const btn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 36, height: 36, borderRadius: 'var(--radius-full)',
  background: 'var(--bg-alt)', border: '2px solid var(--border)',
  color: 'var(--text-secondary)', cursor: 'pointer',
  transition: 'all 0.15s ease',
};
