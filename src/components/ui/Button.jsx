/**
 * Chunky 3D button — the signature Duolingo control.
 * Variants: primary (green) | blue | danger | gold | purple | secondary (white) | ghost
 * Sizes: sm | md (default) | lg
 * Renders a <button> by default, or an <a>/<Link> via the `as` prop.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  disabled = false,
  className = '',
  as: Comp = 'button',
  children,
  ...rest
}) {
  const cls = [
    'btn',
    `btn--${variant}`,
    size === 'lg' && 'btn--lg',
    size === 'sm' && 'btn--sm',
    full && 'btn--full',
    'press',
    className,
  ].filter(Boolean).join(' ');

  const isNativeButton = Comp === 'button';

  return (
    <Comp
      className={cls}
      disabled={isNativeButton ? (disabled || loading) : undefined}
      aria-disabled={!isNativeButton && (disabled || loading) ? true : undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="btn-spinner" aria-hidden /> : children}
    </Comp>
  );
}
