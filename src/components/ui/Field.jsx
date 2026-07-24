import { forwardRef } from 'react';

/**
 * Text field with optional leading icon and trailing adornment (e.g. eye toggle).
 * Pass a lucide icon element via `icon`. `error` toggles the red border.
 */
const Field = forwardRef(function Field(
  { icon, trailing, error = false, className = '', style, ...rest },
  ref
) {
  const input = (
    <input
      ref={ref}
      className={['field', icon && 'field-icon-pad', error && 'field--error', className]
        .filter(Boolean).join(' ')}
      style={style}
      {...rest}
    />
  );
  if (!icon && !trailing) return input;
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon && (
        <span style={{ position: 'absolute', left: 15, display: 'flex', color: 'var(--text-light)', pointerEvents: 'none' }}>
          {icon}
        </span>
      )}
      {input}
      {trailing && (
        <span style={{ position: 'absolute', right: 12, display: 'flex' }}>{trailing}</span>
      )}
    </div>
  );
});

export default Field;
