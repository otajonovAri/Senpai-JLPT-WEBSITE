import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import GoogleButton from '../../components/GoogleButton';
import { Button, Field } from '../../components/ui';
import { User, Mail, Lock, Eye, EyeOff, AtSign, KeyRound, ArrowLeft } from 'lucide-react';

export default function Register() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [maskedTarget, setMaskedTarget] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (!fullName || !username || !email || !password) return t('auth.fillAllFields');
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) return t('auth.usernameFormat');
    if (password.length < 8) return t('auth.passwordMin');
    if (!/[A-Z]/.test(password)) return t('auth.passwordUpper');
    if (!/[a-z]/.test(password)) return t('auth.passwordLower');
    if (!/\d/.test(password)) return t('auth.passwordDigit');
    if (password !== confirmPass) return t('auth.passwordMismatch');
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await register(fullName, email, password, username);
      setMaskedTarget(res?.maskedTarget || email);
      setStep(2);
    } catch (e2) {
      setError(e2.message || t('auth.genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otpCode)) { setError(t('auth.codeSixDigits')); return; }
    setError('');
    setSubmitting(true);
    try {
      await verifyOtp(email, otpCode);
      navigate('/placement-test');
    } catch (e2) {
      setError(e2.message || t('auth.codeWrong'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topDecor} />

      <div style={styles.wrapper}>
        <div style={styles.card} className="anim-pop">
          <div style={styles.mascotWrap}>
            <div style={styles.speechBubble} className="anim-pop delay-3">
              <span style={styles.speechText} className="jp">{t('auth.niceToMeet')}</span>
              <span style={styles.speechArrow} />
            </div>
            <img src="/mascot/studying.png" alt="SenpaiJLPT maskoti" style={styles.mascotImg} />
          </div>
          {step === 1 ? (
            <>
              <div style={styles.brand}>
                <h1 style={styles.brandName}>{t('auth.registerTitle')}</h1>
                <p style={styles.brandTag}>{t('auth.registerSubtitle')}</p>
              </div>

              {error && <div style={styles.error} className="anim-wiggle">{error}</div>}

              <form onSubmit={handleSubmit} style={styles.form}>
                <Field type="text" placeholder={t('auth.fullName')} value={fullName}
                  onChange={(e) => setFullName(e.target.value)} icon={<User size={18} />} />
                <Field type="text" placeholder={t('auth.username')} value={username}
                  onChange={(e) => setUsername(e.target.value)} icon={<AtSign size={18} />} />
                <Field type="email" placeholder={t('auth.email')} value={email}
                  onChange={(e) => setEmail(e.target.value)} icon={<Mail size={18} />} />
                <Field type={showPass ? 'text' : 'password'} placeholder={t('auth.passwordHint')} value={password}
                  onChange={(e) => setPassword(e.target.value)} icon={<Lock size={18} />}
                  trailing={
                    <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  } />
                <Field type={showPass ? 'text' : 'password'} placeholder={t('auth.confirmPassword')} value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)} icon={<Lock size={18} />} />

                <Button type="submit" variant="primary" size="lg" full loading={submitting}>
                  {t('auth.register')}
                </Button>

                <div style={styles.divider}>
                  <span style={styles.dividerLine} />
                  <span style={styles.dividerText}>{t('auth.or')}</span>
                  <span style={styles.dividerLine} />
                </div>

                <GoogleButton label={t('auth.googleRegister')} onError={setError} />
              </form>

              <p style={styles.bottomText}>
                {t('auth.haveAccount')}{' '}
                <Link to="/login" style={styles.link}>{t('auth.loginLink')}</Link>
              </p>
            </>
          ) : (
            <>
              <button style={styles.backBtn} onClick={() => { setStep(1); setError(''); }}>
                <ArrowLeft size={16} /> {t('auth.back')}
              </button>
              <div style={styles.brand}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
                <h1 style={styles.brandName}>{t('auth.verifyCode')}</h1>
                <p style={styles.brandTag}>
                  <strong>{maskedTarget}</strong> — {t('auth.codeSentTo')}
                </p>
              </div>

              {error && <div style={styles.error} className="anim-wiggle">{error}</div>}

              <form onSubmit={handleVerify} style={styles.form}>
                <Field
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={t('auth.codePlaceholder')}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  icon={<KeyRound size={18} />}
                  style={{ letterSpacing: 8, textAlign: 'center', fontSize: 20, fontWeight: 800 }}
                  autoFocus
                />
                <Button type="submit" variant="primary" size="lg" full loading={submitting} disabled={otpCode.length !== 6}>
                  {t('auth.confirm')}
                </Button>
              </form>
            </>
          )}
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
    maxWidth: 430,
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
  brand: { textAlign: 'center', marginBottom: 22 },
  logoImg: {
    width: 52,
    height: 52,
    objectFit: 'contain',
    margin: '0 auto 10px',
    display: 'block',
    borderRadius: 16,
  },
  brandName: { fontSize: 26, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.5 },
  brandTag: { fontSize: 14, color: 'var(--text-light)', fontWeight: 700, marginTop: 4, lineHeight: 1.5 },
  error: {
    background: 'var(--danger-soft)', color: 'var(--danger-dark)', padding: '12px 14px',
    borderRadius: 14, fontSize: 14, fontWeight: 700, marginBottom: 16, textAlign: 'center',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  eyeBtn: { background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: 'var(--text-light)', display: 'flex' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '2px 0' },
  dividerLine: { flex: 1, height: 2, background: 'var(--border)', borderRadius: 2 },
  dividerText: { fontSize: 12, color: 'var(--text-light)', fontWeight: 800, letterSpacing: 1 },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
    color: 'var(--text-light)', fontSize: 14, fontWeight: 800, cursor: 'pointer', marginBottom: 8, padding: 0,
  },
  bottomText: { textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-light)', fontWeight: 700 },
  link: { color: 'var(--primary)', fontWeight: 900 },
};
