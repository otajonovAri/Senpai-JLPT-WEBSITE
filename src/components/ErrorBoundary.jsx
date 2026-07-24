import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

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
        <div style={styles.container}>
          <AlertTriangle size={48} color="var(--danger)" />
          <h2 style={styles.title}>Kutilmagan xatolik yuz berdi</h2>
          <p style={styles.message}>{this.state.error?.message || "Nimadur noto'g'ri ketdi"}</p>
          <div style={styles.btns}>
            <button style={styles.retryBtn} onClick={this.handleReset}>Qayta urinish</button>
            <button style={styles.homeBtn} onClick={() => { window.location.href = '/dashboard'; }}>Bosh sahifa</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--text, #1a1a2e)', marginTop: 16 },
  message: { fontSize: 14, color: 'var(--text-light, #666)', marginTop: 8, maxWidth: 400 },
  btns: { display: 'flex', gap: 12, marginTop: 24 },
  retryBtn: { padding: '12px 24px', borderRadius: 12, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' },
  homeBtn: { padding: '12px 24px', borderRadius: 12, background: 'var(--bg, #f5f5f5)', border: '1px solid var(--border, #ddd)', fontSize: 14, color: 'var(--text-secondary, #444)', cursor: 'pointer' },
};
