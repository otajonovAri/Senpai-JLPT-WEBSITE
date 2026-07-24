/** Rounded card with the signature 2px border. */
export default function Card({ tappable = false, flat = false, className = '', style, children, ...rest }) {
  const cls = [
    'card',
    flat && 'card--flat',
    tappable && 'card--tappable',
    className,
  ].filter(Boolean).join(' ');
  return (
    <div className={cls} style={style} {...rest}>
      {children}
    </div>
  );
}
