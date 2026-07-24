import { api, setTokens, clearTokens } from './client';

export async function loginApi(email, password) {
  const data = await api('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function registerApi(email, username, password, fullName) {
  return api('/auth/register', {
    method: 'POST',
    body: { email, username, password, fullName },
    auth: false,
  });
}

export async function verifyRegisterApi(email, otpCode) {
  const data = await api('/auth/verify-register', {
    method: 'POST',
    body: { email, otpCode },
    auth: false,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function googleLoginApi(credential) {
  const data = await api('/auth/google', {
    method: 'POST',
    body: { credential },
    auth: false,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function forgotPasswordApi(email) {
  return api('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    auth: false,
  });
}

export async function resetPasswordApi(email, token, newPassword) {
  return api('/auth/reset-password', {
    method: 'POST',
    body: { email, token, newPassword },
    auth: false,
  });
}

export async function getMe() {
  return api('/auth/me');
}

// §4.6 — telefon raqamiga OTP yuborish; purpose: "login" | "register" | "reset"
export async function sendPhoneOtpApi(phoneNumber, purpose = 'login') {
  return api('/auth/send-otp', {
    method: 'POST',
    body: { phoneNumber, purpose },
    auth: false,
  });
}

// §4.4 — telefon + OTP bilan kirish → AuthResponseDto
export async function loginWithPhoneApi(phoneNumber, otpCode) {
  const data = await api('/auth/login-phone', {
    method: 'POST',
    body: { phoneNumber, otpCode },
    auth: false,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

// §4.12 — email tasdiqlash kodini qayta yuborish (login qilingan holda)
export async function sendEmailVerificationApi() {
  return api('/auth/send-email-verification', { method: 'POST' });
}

// §4.13 — email tasdiqlash (token bilan)
export async function verifyEmailApi(email, token) {
  return api('/auth/verify-email', {
    method: 'POST',
    body: { email, token },
    auth: false,
  });
}

export async function logoutApi() {
  try {
    await api('/auth/logout', { method: 'POST' });
  } finally {
    clearTokens();
  }
}
