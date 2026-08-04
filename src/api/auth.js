import { api, setTokens, clearTokens } from './client';

/**
 * Email + parol bilan kirish. Muvaffaqiyatda tokenlar saqlanadi.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<any>} AuthResponseDto
 */
export async function loginApi(email, password) {
  const data = await api('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

/**
 * Ro'yxatdan o'tish — OTP emailga yuboriladi (tokenlar hali berilmaydi).
 * @param {string} email
 * @param {string} username
 * @param {string} password
 * @param {string} fullName
 * @returns {Promise<any>}
 */
export async function registerApi(email, username, password, fullName) {
  return api('/auth/register', {
    method: 'POST',
    body: { email, username, password, fullName },
    auth: false,
  });
}

/**
 * Ro'yxatdan o'tishni OTP bilan tasdiqlash. Muvaffaqiyatda tokenlar saqlanadi.
 * @param {string} email
 * @param {string} otpCode
 * @returns {Promise<any>} AuthResponseDto
 */
export async function verifyRegisterApi(email, otpCode) {
  const data = await api('/auth/verify-register', {
    method: 'POST',
    body: { email, otpCode },
    auth: false,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

/**
 * Google ID token bilan kirish.
 * @param {string} credential Google'dan kelgan ID token
 * @returns {Promise<any>} AuthResponseDto
 */
export async function googleLoginApi(credential) {
  const data = await api('/auth/google', {
    method: 'POST',
    body: { credential },
    auth: false,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

/**
 * Parolni tiklash havolasini yuborish.
 * @param {string} email
 * @returns {Promise<any>}
 */
export async function forgotPasswordApi(email) {
  return api('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    auth: false,
  });
}

/**
 * Yangi parol o'rnatish.
 * @param {string} email
 * @param {string} token Emaildagi tiklash tokeni
 * @param {string} newPassword
 * @returns {Promise<any>}
 */
export async function resetPasswordApi(email, token, newPassword) {
  return api('/auth/reset-password', {
    method: 'POST',
    body: { email, token, newPassword },
    auth: false,
  });
}

/**
 * Joriy foydalanuvchi (UserStatsDto).
 * @returns {Promise<any>}
 */
export async function getMe() {
  return api('/auth/me');
}

/**
 * §4.6 — telefon raqamiga OTP yuborish.
 * @param {string} phoneNumber
 * @param {'login' | 'register' | 'reset'} [purpose='login']
 * @returns {Promise<any>}
 */
export async function sendPhoneOtpApi(phoneNumber, purpose = 'login') {
  return api('/auth/send-otp', {
    method: 'POST',
    body: { phoneNumber, purpose },
    auth: false,
  });
}

/**
 * §4.4 — telefon + OTP bilan kirish. Muvaffaqiyatda tokenlar saqlanadi.
 * @param {string} phoneNumber
 * @param {string} otpCode
 * @returns {Promise<any>} AuthResponseDto
 */
export async function loginWithPhoneApi(phoneNumber, otpCode) {
  const data = await api('/auth/login-phone', {
    method: 'POST',
    body: { phoneNumber, otpCode },
    auth: false,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

/**
 * §4.12 — email tasdiqlash kodini qayta yuborish (login qilingan holda).
 * @returns {Promise<any>}
 */
export async function sendEmailVerificationApi() {
  return api('/auth/send-email-verification', { method: 'POST' });
}

/**
 * §4.13 — email tasdiqlash (token bilan).
 * @param {string} email
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function verifyEmailApi(email, token) {
  return api('/auth/verify-email', {
    method: 'POST',
    body: { email, token },
    auth: false,
  });
}

/**
 * Chiqish — server sessiyasini yopadi va tokenlarni har holatda tozalaydi.
 * @returns {Promise<void>}
 */
export async function logoutApi() {
  try {
    await api('/auth/logout', { method: 'POST' });
  } finally {
    clearTokens();
  }
}
