import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const VALID = ['light', 'dark', 'system'];

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
}

export function ThemeProvider({ children }) {
  // Stored preference: 'light' | 'dark' | 'system' (default: system).
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('theme');
    return VALID.includes(saved) ? saved : 'system';
  });
  // What is actually applied right now.
  const [dark, setDark] = useState(() =>
    theme === 'dark' || (theme === 'system' && systemPrefersDark())
  );

  useEffect(() => {
    localStorage.setItem('theme', theme);

    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark());
      setDark(isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };
    apply();

    // In system mode, follow OS changes live.
    if (theme === 'system' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  const setTheme = (mode) => {
    if (VALID.includes(mode)) setThemeState(mode);
  };

  // Legacy helper — flips between explicit light/dark.
  const toggle = () => setThemeState(t =>
    (t === 'dark' || (t === 'system' && systemPrefersDark())) ? 'light' : 'dark'
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
