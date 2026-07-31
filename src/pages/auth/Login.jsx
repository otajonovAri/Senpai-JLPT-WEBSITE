import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { sendPhoneOtpApi } from '../../api/auth';
import GoogleButton from '../../components/GoogleButton';
import LangSwitcher from '../../components/LangSwitcher';
import ThemeToggle from '../../components/ThemeToggle';
import { Button, Field } from '../../components/ui';
import { Eye, EyeOff, Mail, Lock, Phone, KeyRound } from 'lucide-react';

export default function Login() {
  const { t } = useLanguage();
  const [mode, setMode] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [phone, setPhone] = useState('+998');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithPhone, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || t('auth.loginFailed'));
    }
  };

  const handleSendOtp = async () => {
    if (!/^\+\d{10,15}$/.test(phone)) {
      setError(t('auth.phoneFormatError'));
      return;
    }
    setError('');
    setBusy(true);
    try {
      const res = await sendPhoneOtpApi(phone, 'login');
      setOtpSent(true);
      setOtpInfo(`${res?.maskedTarget || phone} — ${t('auth.codeSent')}`);
    } catch (err) {
      setError(err.message || t('auth.codeNotSent'));
    } finally {
      setBusy(false);
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otpCode)) {
      setError(t('auth.codeSixDigits'));
      return;
    }
    setError('');
    setBusy(true);
    try {
      await loginWithPhone(phone, otpCode);
    } catch (err) {
      setError(err.message || t('auth.loginFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topDecor} />
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
        <ThemeToggle />
        <LangSwitcher />
      </div>

      <div style={styles.wrapper}>
        <div style={styles.card} className="anim-pop">
          <div style={styles.mascotWrap}>
            <div style={styles.speechBubble} className="anim-pop delay-3">
              <span style={styles.speechText} className="jp">{t('auth.welcomeBack')}</span>
              <span style={styles.speechArrow} />
            </div>
            <img src="/mascot/3D_Dragon_Greeting_Icon-removebg-preview.png" alt="SenpaiJLPT maskoti" style={styles.mascotImg} />
          </div>
          <div style={styles.brand}>
            <h1 style={styles.brandName}>Senpai<span style={{ color: 'var(--primary)' }}>JLPT</span></h1>
            <p style={styles.brandTag}>{t('auth.loginTagline')}</p>
          </div>

          <div style={styles.tabs}>
            <button type="button" onClick={() => { setMode('email'); setError(''); }}
              className={`chip${mode === 'email' ? ' chip--active' : ''}`}>
              <Mail size={15} /> {t('auth.email')}
            </button>
            <button type="button" onClick={() => { setMode('phone'); setError(''); }}
              className={`chip${mode === 'phone' ? ' chip--active' : ''}`}>
              <Phone size={15} /> {t('auth.phone')}
            </button>
          </div>

          {error && <div style={styles.error} className="anim-wiggle">{error}</div>}

          {mode === 'email' ? (
            <form onSubmit={handleSubmit} style={styles.form}>
              <Field
                type="email"
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
              />
              <Field
                type={showPass ? 'text' : 'password'}
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                trailing={
                  <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              <div style={styles.forgotRow}>
                <Link to="/forgot-password" style={styles.forgotLink}>{t('auth.forgotPassword')}</Link>
              </div>
              <Button type="submit" variant="primary" size="lg" full loading={loading}>
                {t('auth.login')}
              </Button>

              <div style={styles.divider}>
                <span style={styles.dividerLine} />
                <span style={styles.dividerText}>{t('auth.or')}</span>
                <span style={styles.dividerLine} />
              </div>

              <GoogleButton label={t('auth.googleLogin')} onError={setError} />
            </form>
          ) : (
            <form onSubmit={handlePhoneLogin} style={styles.form}>
              <Field
                type="tel"
                placeholder="+998901234567"
                value={phone}
                disabled={otpSent}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
                icon={<Phone size={18} />}
              />

              {!otpSent ? (
                <Button type="button" variant="primary" size="lg" full onClick={handleSendOtp} loading={busy}>
                  {t('auth.sendSms')}
                </Button>
              ) : (
                <>
                  {otpInfo && <div style={styles.otpInfo}>{otpInfo}</div>}
                  <Field
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder={t('auth.codePlaceholder')}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    icon={<KeyRound size={18} />}
                    style={{ letterSpacing: 8, textAlign: 'center', fontWeight: 800, fontSize: 18 }}
                    autoFocus
                  />
                  <Button type="submit" variant="primary" size="lg" full loading={busy} disabled={otpCode.length !== 6}>
                    {t('auth.login')}
                  </Button>
                  <button type="button" style={styles.resendBtn}
                    onClick={() => { setOtpSent(false); setOtpCode(''); setOtpInfo(''); }}>
                    {t('auth.changeNumber')}
                  </button>
                </>
              )}
            </form>
          )}

          <p style={styles.bottomText}>
            {t('auth.noAccount')}{' '}
            <Link to="/register" style={styles.link}>{t('auth.signUpLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 20px 40px',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden',
  },
  topDecor: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 220,
    background: 'linear-gradient(180deg, var(--primary-soft) 0%, var(--bg) 100%)',
    pointerEvents: 'none',
  },
  wrapper: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 420,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  mascotWrap: {
    position: 'absolute',
    top: -72,
    right: 14,
    zIndex: 2,
    filter: 'drop-shadow(0 8px 24px rgba(88,204,2,0.25))',
  },
  mascotImg: {
    width: 106,
    height: 106,
    objectFit: 'contain',
    display: 'block',
  },
  card: {
    position: 'relative',
    width: '100%',
    marginTop: 76,
    background: 'var(--bg-card)',
    border: '2px solid var(--border)',
    borderRadius: 28,
    padding: '40px 28px 32px',
    boxShadow: 'var(--shadow-lg)',
  },
  speechBubble: {
    position: 'absolute',
    top: 6,
    right: 102,
    background: 'var(--primary)',
    borderRadius: 16,
    padding: '8px 14px',
    boxShadow: '0 3px 0 var(--primary-dark)',
    whiteSpace: 'nowrap',
  },
  speechText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 800,
  },
  speechArrow: {
    position: 'absolute',
    right: -7,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 0,
    height: 0,
    borderTop: '7px solid transparent',
    borderBottom: '7px solid transparent',
    borderLeft: '8px solid var(--primary)',
  },
  brand: { textAlign: 'center', marginBottom: 20 },
  brandName: { fontSize: 28, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.5 },
  brandTag: { fontSize: 14, color: 'var(--text-light)', fontWeight: 700, marginTop: 4 },
  tabs: {
    display: 'flex', gap: 6, marginBottom: 18,
    background: 'var(--bg-alt)', borderRadius: 16, padding: 5,
    border: '2px solid var(--border)',
  },
  tab: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '10px 0', borderRadius: 12, background: 'transparent', border: 'none',
    fontSize: 14, fontWeight: 800, color: 'var(--text-light)', cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabActive: {
    background: 'var(--bg-card)', color: 'var(--primary)',
    boxShadow: 'var(--shadow-md)',
  },
  otpInfo: {
    fontSize: 13, color: 'var(--primary-dark)', background: 'var(--primary-soft)',
    padding: '10px 12px', borderRadius: 12, fontWeight: 700, textAlign: 'center',
  },
  resendBtn: {
    background: 'none', border: 'none', color: 'var(--text-light)',
    fontSize: 13, cursor: 'pointer', fontWeight: 700, padding: 6,
  },
  error: {
    background: 'var(--danger-soft)',
    color: 'var(--danger-dark)',
    padding: '12px 14px',
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 16,
    textAlign: 'center',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  eyeBtn: {
    background: 'none', border: 'none', padding: 6, cursor: 'pointer',
    color: 'var(--text-light)', display: 'flex',
  },
  forgotRow: { textAlign: 'right', marginTop: -4 },
  forgotLink: { fontSize: 13, color: 'var(--secondary)', fontWeight: 800 },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '2px 0' },
  dividerLine: { flex: 1, height: 2, background: 'var(--border)', borderRadius: 2 },
  dividerText: { fontSize: 12, color: 'var(--text-light)', fontWeight: 800, letterSpacing: 1 },
  bottomText: {
    textAlign: 'center', marginTop: 22, fontSize: 14,
    color: 'var(--text-light)', fontWeight: 700,
  },
  link: { color: 'var(--primary)', fontWeight: 900 },
};
