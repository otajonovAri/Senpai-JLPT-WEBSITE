/** Thick rounded progress bar. `value`/`max` or `percent` (0–100). */
export default function ProgressBar({ value, max = 100, percent, sm = false, color, className = '', style }) {
  const pct = percent != null
    ? percent
    : Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div className={['progress', sm && 'progress--sm', className].filter(Boolean).join(' ')} style={style}
      role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${pct}%`, ...(color ? { background: color } : null) }} />
    </div>
  );
}
