import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSettings, updateSettings, getFaq, deleteAccount } from '../../api/profile';
import { sendEmailVerificationApi, verifyEmailApi } from '../../api/auth';
import { LangCodeToInt, LangIntToCode } from '../../api/enums';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  Globe, Bell, Target, Shield, HelpCircle,
  ChevronRight, ChevronDown, Save, Loader, Trash2, MailCheck, Moon, Sun, Monitor, Settings } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import PageHeader from '../../components/PageHeader';

export default function SettingsPage() {
  const { theme, setTheme, dark } = useTheme();
  const { lang: uiLang, setLang: setUiLang, t } = useLanguage();
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  // Email tasdiqlash (§4.12/§4.13)
  const [verifyToken, setVerifyToken] = useState('');
  const [verifySending, setVerifySending] = useState(false);
  const [verifyCodeSent, setVerifyCodeSent] = useState(false);
  const [language, setLanguage] = useState('uz');
  const [goals, setGoals] = useState({ words: 20, kanji: 10, grammar: 5, minutes: 15 });
  const [notifications, setNotifications] = useState({
    streak: true, srs: true, league: true, friends: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [faqItems, setFaqItems] = useState([]);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  // Keep the raw UserSettingsDto so we can round-trip fields the UI doesn't expose
  // (darkMode, dailyReminderTime, notifChallenge) — PUT §6.2 requires the full object.
  const [raw, setRaw] = useState(null);

  useEffect(() => {
    Promise.all([
      getSettings().catch(() => null),
      getFaq().catch(() => null),
    ]).then(([settings, faq]) => {
      if (settings) {
        setRaw(settings);
        setLanguage(LangIntToCode[settings.language] || 'uz');
        setGoals({
          words: settings.dailyWordGoal ?? 20,
          kanji: settings.dailyKanjiGoal ?? 10,
          grammar: settings.dailyGrammarGoal ?? 5,
          minutes: settings.dailyMinutesGoal ?? 15,
        });
        setNotifications({
          streak: settings.dailyReminderEnabled ?? true,
          srs: settings.notifSrsReady ?? true,
          league: settings.notifLeaderboard ?? true,
          friends: settings.notifFriendRequest ?? true,
        });
      }
      if (faq && Array.isArray(faq)) {
        // §20 — FAQ is grouped by category: [{ category, items: [...] }].
        const flat = faq.flatMap(c => Array.isArray(c.items) ? c.items : [c]);
        setFaqItems(flat.map(f => ({ question: f.questionUz || f.question, answer: f.answerUz || f.answer })));
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // §6.2 — send the full flat object; language as int.
      await updateSettings({
        language: LangCodeToInt[language] ?? 0,
        darkMode: dark,
        dailyReminderEnabled: notifications.streak,
        dailyReminderTime: raw?.dailyReminderTime || '20:00:00',
        notifSrsReady: notifications.srs,
        notifLeaderboard: notifications.league,
        notifFriendRequest: notifications.friends,
        notifChallenge: raw?.notifChallenge ?? true,
        dailyWordGoal: goals.words,
        dailyKanjiGoal: goals.kanji,
        dailyGrammarGoal: goals.grammar,
        dailyMinutesGoal: goals.minutes,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={styles.page} className="stagger">
      <PageHeader icon={Settings} title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}><Globe size={18} /> {t('settings.language')}</h2>
        <div style={styles.langBtnRow}>
          {[
            { code: 'uz', label: "O'zbek" },
            { code: 'en', label: 'English' },
            { code: 'ru', label: 'Русский' },
          ].map(l => (
            <button
              key={l.code}
              style={{
                ...styles.langBtn,
                ...(uiLang === l.code ? styles.langBtnActive : {}),
              }}
              onClick={() => { setUiLang(l.code); setLanguage(l.code); }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>{dark ? <Moon size={18} /> : <Sun size={18} />} {t('settings.theme')}</h2>
        <div style={styles.langBtnRow}>
          {[
            { mode: 'light', label: t('settings.themeLight'), icon: Sun },
            { mode: 'dark', label: t('settings.themeDark'), icon: Moon },
            { mode: 'system', label: t('settings.themeSystem'), icon: Monitor },
          ].map(o => (
            <button
              key={o.mode}
              className="press"
              style={{
                ...styles.themeBtn,
                ...(theme === o.mode ? styles.themeBtnActive : {}),
              }}
              onClick={() => setTheme(o.mode)}
            >
              <o.icon size={18} className={theme === o.mode ? 'anim-icon-pop' : ''} />
              {o.label}
            </button>
          ))}
        </div>
        {theme === 'system' && (
          <p style={styles.themeHint}>
            {dark ? t('settings.systemHintDark') : t('settings.systemHintLight')}
          </p>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}><Target size={18} /> {t('settings.goals')}</h2>
        <div style={styles.goalGrid}>
          {[
            { key: 'words', label: t('settings.goalWords'), max: 50 },
            { key: 'kanji', label: t('settings.goalKanji'), max: 30 },
            { key: 'grammar', label: t('settings.goalGrammar'), max: 20 },
            { key: 'minutes', label: t('settings.goalMinutes'), max: 60 },
          ].map(g => (
            <div key={g.key} style={styles.goalItem}>
              <label style={styles.goalLabel}>{g.label}</label>
              <div style={styles.goalControl}>
                <button style={styles.goalBtn} onClick={() =>
                  setGoals({ ...goals, [g.key]: Math.max(1, goals[g.key] - 5) })}>-</button>
                <span style={styles.goalValue}>{goals[g.key]}</span>
                <button style={styles.goalBtn} onClick={() =>
                  setGoals({ ...goals, [g.key]: Math.min(g.max, goals[g.key] + 5) })}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}><Bell size={18} /> {t('settings.notifications')}</h2>
        {[
          { key: 'streak', label: t('settings.notifStreak') },
          { key: 'srs', label: t('settings.notifSrs') },
          { key: 'league', label: t('settings.notifLeague') },
          { key: 'friends', label: t('settings.notifFriends') },
        ].map(n => (
          <div key={n.key} style={styles.toggleRow}>
            <span style={styles.toggleLabel}>{n.label}</span>
            <button
              style={{ ...styles.toggle, ...(notifications[n.key] ? styles.toggleOn : {}) }}
              onClick={() => setNotifications({ ...notifications, [n.key]: !notifications[n.key] })}
            >
              <div style={{ ...styles.toggleDot, ...(notifications[n.key] ? styles.toggleDotOn : {}) }} />
            </button>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}><Shield size={18} /> {t('settings.account')}</h2>
        <div style={styles.accountItem}>
          <span>{t('settings.accountEmail')}: {user?.email || t('settings.unknown')}</span>
        </div>
        <div style={styles.accountItem}>
          <span>{t('settings.accountPlan')}: {user?.plan || 'Free'}</span>
          <span style={styles.upgradeBadge}>{t('settings.upgrade')}</span>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}><HelpCircle size={18} /> {t('settings.help')}</h2>
        <div style={styles.faqList}>
          {faqItems.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--text-light)', padding: '8px 0' }}>{t('settings.faqEmpty')}</div>
          )}
          {faqItems.map((faq, i) => (
            <div key={i}>
              <div style={styles.faqItem} onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                <span>{faq.question}</span>
                {faq.answer
                  ? (expandedFaq === i ? <ChevronDown size={16} color="var(--text-light)" /> : <ChevronRight size={16} color="var(--text-light)" />)
                  : <ChevronRight size={16} color="var(--text-light)" />}
              </div>
              {expandedFaq === i && faq.answer && (
                <div style={styles.faqAnswer}>{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
        {saving ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
        {saved ? t('common.saved') : saving ? t('common.saving') : t('common.save')}
      </button>

      {/* Email tasdiqlash — §4.12/§4.13 */}
      {user && user.isEmailVerified === false && (
        <div style={{ ...styles.section, borderColor: 'rgba(255,193,7,0.4)' }}>
          <h2 style={styles.sectionTitle}><MailCheck size={18} /> {t('settings.emailVerify')}</h2>
          <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 10 }}>
            {t('settings.emailNotVerified').replace('{email}', user.email)}
          </p>
          {!verifyCodeSent ? (
            <button
              style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--primary)', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: verifySending ? 0.6 : 1 }}
              disabled={verifySending}
              onClick={async () => {
                setVerifySending(true);
                try {
                  await sendEmailVerificationApi();
                  setVerifyCodeSent(true);
                  toast.success(t('settings.verifyCodeSent'));
                } catch (err) {
                  toast.error(err.message || t('settings.verifyCodeFailed'));
                } finally {
                  setVerifySending(false);
                }
              }}>
              {verifySending ? t('settings.sending') : t('settings.sendVerifyCode')}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder={t('settings.verifyCodePlaceholder')}
                value={verifyToken}
                onChange={e => setVerifyToken(e.target.value)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
              />
              <button
                style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--success)', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: verifyToken ? 1 : 0.5 }}
                disabled={!verifyToken}
                onClick={async () => {
                  try {
                    await verifyEmailApi(user.email, verifyToken.trim());
                    toast.success(t('settings.emailVerified'));
                    await refreshUser();
                  } catch (err) {
                    toast.error(err.message || t('settings.codeWrong'));
                  }
                }}>
                {t('settings.verify')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 48-ekran: Hisobni o'chirish (xavfli hudud) — §5.4 DELETE /profile, parol talab etiladi */}
      <div style={{ ...styles.section, borderColor: 'rgba(239,68,68,0.3)' }}>
        <h2 style={{ ...styles.sectionTitle, color: 'var(--danger)' }}><Trash2 size={18} /> {t('settings.dangerZone')}</h2>
        <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 10 }}>
          {t('settings.deleteWarning')}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="password"
            placeholder={t('settings.yourPassword')}
            value={deletePassword}
            onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
          />
          <button
            style={{ padding: '10px 16px', borderRadius: 8, background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: deletePassword ? 1 : 0.5 }}
            disabled={!deletePassword}
            onClick={() => setShowDeleteConfirm(true)}>
            {t('settings.deleteAccount')}
          </button>
        </div>
        {deleteError && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)' }}>{deleteError}</div>}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        danger
        title={t('settings.deleteConfirmTitle')}
        description={t('settings.deleteConfirmDesc')}
        confirmLabel={t('settings.deleteConfirmYes')}
        cancelLabel={t('common.cancel')}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          try {
            await deleteAccount(deletePassword);
            setShowDeleteConfirm(false);
            await logout();
            navigate('/login');
          } catch (err) {
            setShowDeleteConfirm(false);
            setDeleteError(err.message || t('settings.passwordWrong'));
          }
        }}
      />
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 },
  title: { fontSize: 28, fontWeight: 700, color: 'var(--text)' },
  section: {
    background: 'var(--bg-card)', borderRadius: 14, padding: 20,
    border: '1px solid var(--border-light)',
  },
  sectionTitle: {
    fontSize: 15, fontWeight: 600, color: 'var(--text)',
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
  },
  select: {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid var(--border)', fontSize: 14, background: 'var(--bg)',
  },
  goalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  goalItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 12px', background: 'var(--bg)', borderRadius: 8,
  },
  goalLabel: { fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' },
  goalControl: { display: 'flex', alignItems: 'center', gap: 10 },
  goalBtn: {
    width: 28, height: 28, borderRadius: '50%', background: 'var(--border-light)',
    fontSize: 16, fontWeight: 600, color: 'var(--text)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  goalValue: { fontSize: 16, fontWeight: 700, color: 'var(--text)', minWidth: 24, textAlign: 'center' },
  toggleRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid var(--border-light)',
  },
  toggleLabel: { fontSize: 14, color: 'var(--text-secondary)' },
  toggle: {
    width: 44, height: 24, borderRadius: 12, background: 'var(--border)',
    padding: 2, transition: 'background 0.2s', position: 'relative',
  },
  toggleOn: { background: 'var(--success)' },
  toggleDot: {
    width: 20, height: 20, borderRadius: '50%', background: 'white',
    transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  toggleDotOn: { transform: 'translateX(20px)' },
  accountItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid var(--border-light)',
    fontSize: 14, color: 'var(--text-secondary)',
  },
  upgradeBadge: {
    padding: '4px 12px', borderRadius: 8, background: 'var(--accent)',
    color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  faqList: {},
  faqItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid var(--border-light)',
    fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer',
  },
  faqAnswer: {
    padding: '8px 0 12px', fontSize: 13, color: 'var(--text-light)',
    lineHeight: 1.5, borderBottom: '1px solid var(--border-light)',
  },
  saveBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '14px', borderRadius: 12, background: 'var(--primary)',
    color: 'white', fontSize: 15, fontWeight: 600,
    boxShadow: '0 4px 15px rgba(88,204,2,0.3)',
  },
  langBtnRow: {
    display: 'flex', gap: 8,
  },
  langBtn: {
    flex: 1, padding: '10px 12px', borderRadius: 12,
    border: '2px solid var(--border)', background: 'var(--bg-alt)',
    fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  langBtnActive: {
    background: 'var(--primary-soft)',
    borderColor: 'var(--primary)',
    color: 'var(--primary-dark)',
    fontWeight: 800,
  },
  themeBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '11px 12px', borderRadius: 12,
    border: '2px solid var(--border)', background: 'var(--bg-alt)',
    fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  themeBtnActive: {
    background: 'var(--primary-soft)',
    borderColor: 'var(--primary)',
    color: 'var(--primary-dark)',
    fontWeight: 800,
  },
  themeHint: {
    marginTop: 10, fontSize: 12.5, fontWeight: 600,
    color: 'var(--text-light)',
  },
};
