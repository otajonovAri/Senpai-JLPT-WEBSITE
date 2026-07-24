import { createContext, useContext, useState, useCallback } from 'react';
import uz from '../i18n/uz.json';
import en from '../i18n/en.json';
import ru from '../i18n/ru.json';

const translations = { uz, en, ru };

const LanguageContext = createContext();

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('lang') || 'uz';
  });

  const setLang = useCallback((code) => {
    setLangState(code);
    localStorage.setItem('lang', code);
  }, []);

  const t = useCallback((key) => {
    // Try current language first
    const value = getNestedValue(translations[lang], key);
    if (value !== undefined) return value;
    // Fallback to Uzbek
    const fallback = getNestedValue(translations.uz, key);
    if (fallback !== undefined) return fallback;
    // Return the key itself as last resort
    return key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
