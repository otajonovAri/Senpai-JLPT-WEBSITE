import { isValidElement } from 'react';
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
  // Emoji / string / number, or an already-built element (e.g. <img />).
  if (typeof icon === 'string' || typeof icon === 'number') return icon;
  if (isValidElement(icon)) return icon;

  // Otherwise it's the component itself. Plain components are functions, but
  // lucide icons are forwardRef *objects* — rendering one as a child throws
  // "Objects are not valid as a React child", so check for both.
  if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && icon.$$typeof)) {
    const Icon = icon;
    return <Icon size={size === 'sm' ? 20 : 26} color="#fff" />;
  }
  return null;
}
