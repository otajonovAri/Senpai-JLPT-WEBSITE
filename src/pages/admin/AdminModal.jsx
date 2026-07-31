import { X } from 'lucide-react';

export default function AdminModal({ title, open, onClose, onSubmit, children, loading }) {
  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.modal} className="animate-in">
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.body}>
            {children}
          </div>
          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Bekor qilish
            </button>
            <button type="submit" style={styles.submitBtn} className="press" disabled={loading}>
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export function FormField({ label, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

export const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 8,
  border: '2px solid var(--border)',
  background: 'var(--bg)',
  fontSize: 14,
  color: 'var(--text)',
  outline: 'none',
  boxSizing: 'border-box',
};

export const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 2000,
    animation: 'fadeIn 0.2s ease-out',
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(92vw, 480px)',
    maxHeight: '85vh',
    background: 'var(--bg-card, white)',
    borderRadius: 16,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    zIndex: 2001,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-light)',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 8,
    background: 'var(--bg)',
    color: 'var(--text-secondary)',
    border: 'none',
    cursor: 'pointer',
  },
  body: {
    padding: '16px 20px',
    overflowY: 'auto',
    maxHeight: 'calc(85vh - 130px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    padding: '12px 20px',
    borderTop: '1px solid var(--border-light)',
  },
  cancelBtn: {
    padding: '9px 18px',
    borderRadius: 8,
    border: '2px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '9px 18px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--secondary)',
    color: 'white',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
};
