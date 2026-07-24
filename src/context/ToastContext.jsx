import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

// 55-ekran: Toast / Snackbar
const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
  }, []);

  const show = useCallback((message, type = 'info', duration = 3500) => {
    const id = nextId++;
    setToasts(prev => [...prev.slice(-2), { id, message, type }]); // max 3 ta
    timersRef.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = {
    show,
    success: (msg, d) => show(msg, 'success', d),
    error: (msg, d) => show(msg, 'error', d),
    info: (msg, d) => show(msg, 'info', d),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={styles.container}>
        {toasts.map(t => (
          <div key={t.id} style={{ ...styles.toast, ...typeStyles[t.type] }} className="animate-in">
            {t.type === 'success' && <CheckCircle size={18} color="var(--success)" />}
            {t.type === 'error' && <AlertCircle size={18} color="var(--danger)" />}
            {t.type === 'info' && <Info size={18} color="#2196F3" />}
            <span style={styles.message}>{t.message}</span>
            <button style={styles.closeBtn} onClick={() => dismiss(t.id)}><X size={14} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Provider yo'q bo'lsa ham ishdan chiqmasin
    return { show: () => {}, success: () => {}, error: () => {}, info: () => {} };
  }
  return ctx;
}

const typeStyles = {
  success: { borderLeft: '3px solid var(--success)' },
  error: { borderLeft: '3px solid var(--danger)' },
  info: { borderLeft: '3px solid #2196F3' },
};

const styles = {
  container: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    zIndex: 3000,
    width: 'min(92vw, 420px)',
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    background: 'var(--bg-card)',
    borderRadius: 14,
    boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
    border: '1px solid var(--border-light)',
    pointerEvents: 'auto',
  },
  message: { flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text)' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', display: 'flex', padding: 2 },
};
