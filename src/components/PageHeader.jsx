import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * The single page header used by every inner screen.
 *
 * Keeps title scale, hero gradient and spacing identical app-wide — pages
 * should never roll their own <h1> block again.
 *
 *   <PageHeader icon={Trophy} title="Reyting" subtitle="Haftalik" accent="gold" />
 *   <PageHeader back icon="🎧" title="Podkast" right={<button className="btn btn--sm">…</button>} />
 *
 * @param icon      lucide component, emoji/string, or a ready-made node
 * @param accent    primary | blue | purple | pink | gold | orange | red
 * @param back      true → history back, or a path string to navigate to
 * @param size      'sm' for drill screens that need vertical room
 */
export default function PageHeader({
  icon,
  title,
  subtitle,
  accent = 'primary',
  back = false,
  right,
  size,
  className = '',
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof back === 'string') navigate(back);
    else navigate(-1);
  };

  return (
    <header
      className={`page-head page-head--${accent}${size === 'sm' ? ' page-head--sm' : ''} anim-scale-in ${className}`.trim()}
    >
      {back && (
        <button className="page-head__back" onClick={handleBack} aria-label="Orqaga">
          <ArrowLeft size={20} />
        </button>
      )}

      {icon && <span className="page-head__icon">{renderIcon(icon, size)}</span>}

      <div className="page-head__body">
        <h1 className="page-head__title">{title}</h1>
        {subtitle && <p className="page-head__sub">{subtitle}</p>}
      </div>

      {right && <div className="page-head__actions">{right}</div>}
    </header>
  );
}

function renderIcon(icon, size) {
  // A lucide icon is passed as the component itself, not an element.
  if (typeof icon === 'function') {
    const Icon = icon;
    return <Icon size={size === 'sm' ? 20 : 26} color="#fff" />;
  }
  return icon;
}
