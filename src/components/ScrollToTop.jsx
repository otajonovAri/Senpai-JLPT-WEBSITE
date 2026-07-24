import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// SPA'da yo'nalish o'zgarganda brauzer scroll pozitsiyasini saqlab qoladi —
// footer'dagi havolani bosgan odam yangi sahifaning o'rtasiga tushib qolardi.
// Bu komponent har route almashganda sahifani tepaga qaytaradi.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // #anchor bo'lsa — o'sha bo'limga o'tamiz (tepaga emas)
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}
