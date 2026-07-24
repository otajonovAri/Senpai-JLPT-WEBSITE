import { useMemo } from 'react';

const COLORS = ['#58CC02', '#F5B50A', '#2563EB', '#A78BFA', '#F472B6', '#FB923C'];

/**
 * CSS confetti burst. Render it (conditionally) inside a
 * position:relative parent — pieces explode outward from the center
 * and fade. Mount it with a changing `key` to re-fire.
 */
export default function Confetti({ count = 14, spread = 90 }) {
  const pieces = useMemo(() =>
    Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
      const dist = spread * (0.6 + Math.random() * 0.7);
      return {
        id: i,
        color: COLORS[i % COLORS.length],
        cx: `${Math.round(Math.cos(angle) * dist)}px`,
        cy: `${Math.round(Math.sin(angle) * dist * 0.85 - 20)}px`,
        cr: `${Math.round(180 + Math.random() * 420)}deg`,
        delay: `${(Math.random() * 0.12).toFixed(2)}s`,
        w: 6 + Math.round(Math.random() * 5),
      };
    }), [count, spread]);

  return (
    <span aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      {pieces.map(p => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            background: p.color,
            width: p.w,
            height: p.w * 1.4,
            '--cx': p.cx,
            '--cy': p.cy,
            '--cr': p.cr,
            animationDelay: p.delay,
          }}
        />
      ))}
    </span>
  );
}
