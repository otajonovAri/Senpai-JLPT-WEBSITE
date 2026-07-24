import { useEffect, useRef, useState } from 'react';

/**
 * Animated number counter — counts from 0 (or `from`) to `value` with
 * an ease-out curve, Duolingo-style. Re-runs whenever `value` changes.
 * Respects prefers-reduced-motion (jumps straight to the value).
 */
export default function CountUp({ value = 0, from, duration = 900, format, ...rest }) {
  const target = Number(value) || 0;
  const startRef = useRef(Number(from ?? 0) || 0);
  const [display, setDisplay] = useState(startRef.current);
  const rafRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduced) { setDisplay(target); return; }

    const start = startRef.current;
    if (start === target) { setDisplay(target); return; }
    const t0 = performance.now();

    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setDisplay(Math.round(start + (target - start) * eased));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        startRef.current = target; // next change animates from here
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <span className="count-up" {...rest}>{format ? format(display) : display.toLocaleString()}</span>;
}
