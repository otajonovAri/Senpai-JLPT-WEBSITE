import { Component } from 'react';

// Note: this boundary sits OUTSIDE LanguageProvider, so it can't use t().
// Text is hardcoded in Uzbek (the app's default language).
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.page}>
          <div style={styles.card}>
            <img src="/mascot/worried.png" alt="" style={styles.mascot} />
            <h2 style={styles.title}>Nimadir noto'g'ri ketdi</h2>
            <p style={styles.message}>
              Kutilmagan xatolik yuz berdi. Sahifani yangilab, qayta urinib ko'ring.
            </p>

            {/* Texnik tafsilot faqat ishlab chiqish (dev) rejimida ko'rinadi */}
            {import.meta.env.DEV && this.state.error?.message && (
              <pre style={styles.devError}>{this.state.error.message}</pre>
            )}

            <div style={styles.btns}>
              <button className="btn btn--primary" onClick={() => window.location.reload()}>
                Qayta urinish
              </button>
              <button className="btn btn--secondary" onClick={() => { window.location.href = '/'; }}>
                Bosh sahifaga
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    background: 'var(--bg)',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: 440,
    width: '100%',
    padding: '36px 28px 32px',
    background: 'var(--bg-card)',
    border: '2px solid var(--border)',
    borderRadius: 28,
    boxShadow: 'var(--shadow-lg)',
  },
  mascot: {
    width: 120,
    height: 120,
    objectFit: 'contain',
    marginBottom: 8,
    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))',
  },
  title: { fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 8 },
  message: {
    fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)',
    lineHeight: 1.55, maxWidth: 360, marginBottom: 22,
  },
  devError: {
    width: '100%',
    textAlign: 'left',
    fontSize: 12,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    color: 'var(--danger-dark)',
    background: 'var(--danger-soft)',
    border: '1px solid var(--danger)',
    borderRadius: 12,
    padding: '10px 12px',
    marginBottom: 22,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxHeight: 140,
    overflow: 'auto',
  },
  btns: { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
};
