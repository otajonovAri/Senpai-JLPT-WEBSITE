import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-reveal wrapper — fades/slides children in when they enter the
 * viewport (IntersectionObserver). `variant`: "up" (default) | "scale".
 * `delay` in ms staggers siblings.
 */
export default function Reveal({ children, variant = 'up', delay = 0, style, className = '', as: Comp = 'div', ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    // Already on screen at mount (above the fold) — show immediately,
    // don't wait for the first observer callback.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) { setVisible(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const base = variant === 'scale' ? 'reveal-scale' : 'reveal';
  return (
    <Comp
      ref={ref}
      className={[base, visible && 'reveal-visible', className].filter(Boolean).join(' ')}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined, ...style }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
