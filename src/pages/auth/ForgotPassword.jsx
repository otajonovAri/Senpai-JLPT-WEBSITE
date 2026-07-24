import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { forgotPasswordApi, resetPasswordApi } from '../../api/auth';
import { Mail, Send, ArrowLeft, Info, Lock, Loader } from 'lucide-react';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await forgotPasswordApi(email);
      setStep(2);
    } catch (err) { setError(err.message || t('auth.genericError')); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await resetPasswordApi(email, code, newPassword);
      setSuccess(true);
    } catch (err) { setError(err.message || t('auth.genericError')); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.topDecor} />
        <div style={styles.wrapper}>
          <div style={styles.card} className="anim-pop">
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <img src="/mascot/celebration.png" alt="Success" style={{ width: 80, height: 80, objectFit: 'contain' }} />
            </div>
            <h1 style={styles.title}>{t('auth.passwordUpdated')}</h1>
            <p style={styles.sub}>{t('auth.passwordUpdatedSub')}</p>
            <Link to="/login" style={styles.btn}>{t('auth.backToLogin')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.topDecor} />
      <div style={styles.wrapper}>
        <div style={styles.card} className="anim-pop">
          <Link to="/login" style={styles.back}><ArrowLeft size={18} /> {t('auth.back')}</Link>

          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <img src="/mascot/icons/forgot-password.png" alt="Forgot Password" style={{ width: 80, height: 80, objectFit: 'contain' }} />
          </div>

          <h1 style={styles.title}>{t('auth.forgotTitle')}</h1>
          <p style={styles.sub}>
            {step === 1 ? t('auth.forgotStep1Sub') : t('auth.forgotStep2Sub')}
          </p>

          {error && <div style={styles.error} className="anim-wiggle">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleSendCode} style={styles.form}>
              <div style={styles.inputWrap}>
                <Mail size={18} style={styles.inputIcon} />
                <input type="email" placeholder={t('auth.emailAddress')} value={email}
                  onChange={e => setEmail(e.target.value)} required style={styles.input} />
              </div>
              <button type="submit" disabled={loading} style={styles.btn}>
                {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                {t('auth.sendCode')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} style={styles.form}>
              <div style={styles.inputWrap}>
                <input type="text" placeholder={t('auth.resetCode')} value={code}
                  onChange={e => setCode(e.target.value)} required style={styles.input} />
              </div>
              <div style={styles.inputWrap}>
                <Lock size={18} style={styles.inputIcon} />
                <input type="password" placeholder={t('auth.newPassword')} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} required style={styles.input} />
              </div>
              <button type="submit" disabled={loading} style={styles.btn}>
                {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {t('auth.updatePassword')}
              </button>
            </form>
          )}

          <div style={styles.infoBox}>
            <Info size={16} color="var(--secondary)" />
            <span>{t('auth.codeValidInfo')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)', padding: '20px 20px 40px', position: 'relative', overflow: 'hidden',
  },
  topDecor: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 220,
    background: 'linear-gradient(180deg, var(--primary-soft) 0%, var(--bg) 100%)', pointerEvents: 'none',
  },
  wrapper: {
    position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  mascotWrap: {
    marginBottom: -24, zIndex: 2,
    filter: 'drop-shadow(0 8px 24px rgba(88,204,2,0.25))',
  },
  mascotImg: { width: 120, height: 120, objectFit: 'contain' },
  card: {
    position: 'relative', width: '100%', background: 'var(--bg-card)',
    border: '2px solid var(--border)', borderRadius: 28,
    padding: '36px 28px 28px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  back: {
    display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-light)',
    fontSize: 14, marginBottom: 16, textDecoration: 'none', fontWeight: 700,
  },
  title: { fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 6 },
  sub: { fontSize: 13, color: 'var(--text-light)', marginBottom: 20, lineHeight: 1.5, fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, color: 'var(--text-light)' },
  input: {
    width: '100%', padding: '14px 14px 14px 44px', border: '2px solid var(--border)',
    borderRadius: 14, fontSize: 14, fontWeight: 600, background: 'var(--bg-alt)',
    outline: 'none',
  },
  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, borderRadius: 14, background: '#58CC02', color: 'white',
    fontSize: 14, fontWeight: 800, border: 'none', textDecoration: 'none',
    marginTop: 4, cursor: 'pointer', boxShadow: '0 4px 0 #46A302',
  },
  error: {
    background: 'var(--danger-soft)', color: 'var(--danger-dark)', padding: '10px 14px',
    borderRadius: 14, fontSize: 13, marginBottom: 12, fontWeight: 700,
  },
  infoBox: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    background: 'var(--secondary-soft)', border: '1.5px solid var(--secondary-soft)',
    borderRadius: 14, padding: '10px 14px', fontSize: 12,
    color: 'var(--text-secondary)', marginTop: 16, textAlign: 'left', fontWeight: 600,
  },
};
