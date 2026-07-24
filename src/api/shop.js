import { api } from './client';
import { PaymentProvider, DevicePlatform, toEnumInt } from './enums';

export async function getShopItems() {
  return api('/shop');
}

export async function purchaseItem(shopItemId) {
  return api('/shop/purchase', { method: 'POST', body: { shopItemId } });
}

export async function equipItem(shopItemId, equip) {
  return api('/shop/equip', { method: 'POST', body: { shopItemId, equip } });
}

export async function getSubscriptionPlans() {
  return api('/subscription/plans');
}

// §18.5 — provider int: AppStore=0, GooglePlay=1, Payme=2, Click=3.
export async function startPayment(planId, provider) {
  return api('/subscription/pay', {
    method: 'POST',
    body: { planId, provider: toEnumInt(PaymentProvider, provider, 2) },
  });
}

export async function getNotifications() {
  return api('/notifications');
}

export async function markNotificationRead(id) {
  return api(`/notifications/${id}/read`, { method: 'POST' });
}

// §19.3 — platform int: Android=0, Ios=1. Web clients typically pass 0.
export async function registerDevice(token, platform = 0) {
  return api('/notifications/device', {
    method: 'POST',
    body: { token, platform: toEnumInt(DevicePlatform, platform, 0) },
  });
}

export async function getMockTests(level) {
  const qs = level ? `?level=${level}` : '';
  return api(`/mock-tests${qs}`);
}

export async function startMockTest(testId) {
  return api(`/mock-tests/${testId}/start`, { method: 'POST' });
}

// §13.3 — {id} here is the ATTEMPT id returned by startMockTest, not the test id.
export async function submitMockTest(attemptId, answers) {
  return api(`/mock-tests/${attemptId}/submit`, {
    method: 'POST',
    body: { answers },
  });
}

// §5 — Placement test (server-side baholash, sessiyali).
// mode: 'confirm' (declaredLevel int bilan, §2.2: body'da enum raqam) | 'auto' (zinapoya)
export async function startPlacementTest(mode, declaredLevel = null) {
  return api('/placement-test/start', {
    method: 'POST',
    body: { mode, declaredLevel },
  });
}

// answers[i] — savol[i] uchun tanlangan variant indeksi (-1 = tashlab ketildi).
// Javob: { finished, questions (auto keyingi bosqich), result: { estimatedLevel... } }
export async function answerPlacementTest(answers) {
  return api('/placement-test/answer', {
    method: 'POST',
    body: { answers },
  });
}

export async function getCurrentSubscription() {
  return api('/subscription/current');
}

export async function cancelSubscription() {
  return api('/subscription/cancel', { method: 'POST' });
}

export async function validateExerciseAnswer(itemId, itemType, userAnswer) {
  return api('/exercises/validate', {
    method: 'POST',
    body: { itemId, itemType, userAnswer },
  });
}
