/** Small rounded stat/status pill. Tones: default | green | blue | gold | red */
export default function Pill({ tone = 'default', className = '', children, ...rest }) {
  const cls = ['pill', tone !== 'default' && `pill--${tone}`, className].filter(Boolean).join(' ');
  return <span className={cls} {...rest}>{children}</span>;
}
