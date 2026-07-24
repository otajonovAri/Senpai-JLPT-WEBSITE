import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, verifyRegisterApi, googleLoginApi, loginWithPhoneApi, getMe, logoutApi } from '../api/auth';
import { getProfileStats } from '../api/profile';
import { getAccessToken } from '../api/client';
import { jlptName } from '../api/enums';

const AuthContext = createContext(null);

// The API spreads user data across AuthResponseDto (login), UserStatsDto/me
// (username, xpPoints, streakDays, level) and profile/stats (coins, totalXp).
// Merge them into the single shape the UI reads (fullName, xp, currentStreak,
// coins, currentLevel). See API_REFERENCE_FULL.md §4.11 / §5.5.
function mergeUser(auth, me, stats) {
  return {
    id: auth?.userId || me?.id || auth?.id || null,
    fullName: me?.fullName || auth?.fullName || me?.username || '',
    username: me?.username || '',
    bio: me?.bio || '',
    email: auth?.email || me?.email || '',
    role: auth?.role || me?.role || 'Student',
    avatarUrl: auth?.avatarUrl ?? me?.avatarUrl ?? null,
    currentLevel: jlptName(me?.level),
    xp: stats?.totalXp ?? me?.xpPoints ?? 0,
    coins: stats?.coins ?? 0,
    currentStreak: stats?.streakDays ?? me?.streakDays ?? 0,
    streakDays: stats?.streakDays ?? me?.streakDays ?? 0,
    vocabLearned: stats?.vocabLearned ?? me?.vocabLearned ?? 0,
    kanjiLearned: stats?.kanjiLearned ?? me?.kanjiLearned ?? 0,
    grammarLearned: stats?.grammarLearned ?? 0,
    tier: stats?.tier || 'Free',
    plan: stats?.tier || 'Free',
    dueReviewCount: me?.dueReviewCount ?? 0,
    referralCode: me?.referralCode ?? null,
    isEmailVerified: me?.isEmailVerified ?? true,
    requiresPhoneVerification: auth?.requiresPhoneVerification ?? false,
  };
}

// Pull the full profile (me + stats) after auth so the sidebar/header are correct.
async function fetchFullUser(auth) {
  const [me, stats] = await Promise.all([
    getMe().catch(() => null),
    getProfileStats().catch(() => null),
  ]);
  return mergeUser(auth, me, stats);
}

// Decode a JWT payload (base64url, unicode-safe). Returns null if malformed.
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Build an auth-shaped object from JWT claims so a stored session is recognised
// instantly — without waiting on (or depending on) the /auth/me round-trip.
function authFromToken(token) {
  const c = decodeJwt(token);
  if (!c) return null;
  const ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  const NAMEID = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
  const EMAIL = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
  const userId = c.sub || c.nameid || c[NAMEID] || null;
  if (!userId) return null;
  return {
    userId,
    email: c.email || c[EMAIL] || '',
    role: c.role || c[ROLE] || 'Student',
    fullName: c.fullName || '',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      // Recognise the session immediately from the JWT so the app never bounces
      // a logged-in user to the landing/login page while /auth/me is in flight
      // (or if it momentarily fails). Enrich with the full profile right after.
      const seed = authFromToken(token);
      if (seed) setUser(mergeUser(seed, null, null));
      fetchFullUser(null)
        .then(u => { if (u.id) setUser(u); })   // enrich; keep the session on failure
        .catch(() => { /* transient — real token expiry is handled on 401 refresh */ })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await loginApi(email, password);
      setUser(mergeUser(data, null, null));         // instant: name/email/role
      fetchFullUser(data).then(setUser).catch(() => {}); // enrich: xp/coins/streak/level
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const register = async (fullName, email, password, username) => {
    setAuthError(null);
    try {
      const data = await registerApi(email, username || email.split('@')[0], password, fullName);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const verifyOtp = async (email, otpCode) => {
    setAuthError(null);
    try {
      const data = await verifyRegisterApi(email, otpCode);
      setUser(mergeUser(data, null, null));
      fetchFullUser(data).then(setUser).catch(() => {});
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async (credential) => {
    setAuthError(null);
    try {
      const data = await googleLoginApi(credential);
      setUser(mergeUser(data, null, null));
      fetchFullUser(data).then(setUser).catch(() => {});
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // §4.4 — telefon + OTP bilan kirish
  const loginWithPhone = async (phoneNumber, otpCode) => {
    setAuthError(null);
    try {
      const data = await loginWithPhoneApi(phoneNumber, otpCode);
      setUser(mergeUser(data, null, null));
      fetchFullUser(data).then(setUser).catch(() => {});
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      setUser(await fetchFullUser(null));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="jp anim-float" style={{
            fontSize: 48, fontFamily: 'var(--font-jp)', fontWeight: 700,
            color: 'var(--primary)', marginBottom: 16,
          }}>先輩アリ</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: 'var(--primary)',
                animation: `pulse 1s ease-in-out ${i * 0.18}s infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user, loading, authError, login, register, verifyOtp,
      loginWithGoogle, loginWithPhone, logout, refreshUser, setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
