import { AlertTriangle } from 'lucide-react';

// 56-ekran: Tasdiqlash oynasi (modal)
// <ConfirmDialog open title="..." description="..." confirmLabel="O'chirish"
//   danger onConfirm={...} onCancel={...} />
export default function ConfirmDialog({
  open,
  title = 'Ishonchingiz komilmi?',
  description,
  confirmLabel = 'Ha',
  cancelLabel = "Yo'q, orqaga",
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} className="animate-in" onClick={e => e.stopPropagation()}>
        <div style={{ ...styles.iconWrap, background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,193,7,0.12)' }}>
          <AlertTriangle size={28} color={danger ? 'var(--danger)' : 'var(--accent)'} />
        </div>
        <h3 style={styles.title}>{title}</h3>
        {description && <p style={styles.desc}>{description}</p>}
        <div style={styles.btns}>
          <button style={styles.cancelBtn} onClick={onCancel}>{cancelLabel}</button>
          <button
            style={{ ...styles.confirmBtn, background: danger ? 'var(--danger)' : 'var(--primary)' }}
            onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2500, padding: 20, animation: 'fadeIn 0.2s ease-out',
  },
  modal: {
    background: 'var(--bg-card)', borderRadius: 20, padding: '28px 24px',
    width: 'min(92vw, 380px)', textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  iconWrap: {
    width: 60, height: 60, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px',
  },
  title: { fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 },
  desc: { fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 20 },
  btns: { display: 'flex', gap: 8 },
  cancelBtn: {
    flex: 1, padding: 13, borderRadius: 12, background: 'var(--bg)',
    border: '1px solid var(--border)', color: 'var(--text)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  confirmBtn: {
    flex: 1, padding: 13, borderRadius: 12, color: 'white',
    fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
  },
};
