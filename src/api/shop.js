import { api } from './client';
import { PaymentProvider, DevicePlatform, toEnumInt } from './enums';

/**
 * @typedef {import('../types/models').JlptLevelName} JlptLevelName
 * @typedef {import('../types/models').LearningItemTypeName} LearningItemTypeName
 */

/** @returns {Promise<any>} Do'kon mahsulotlari */
export async function getShopItems() {
  return api('/shop');
}

/**
 * @param {string} shopItemId
 * @returns {Promise<any>}
 */
export async function purchaseItem(shopItemId) {
  return api('/shop/purchase', { method: 'POST', body: { shopItemId } });
}

/**
 * @param {string} shopItemId
 * @param {boolean} equip true — kiyish, false — yechish
 * @returns {Promise<any>}
 */
export async function equipItem(shopItemId, equip) {
  return api('/shop/equip', { method: 'POST', body: { shopItemId, equip } });
}

/** @returns {Promise<any>} Obuna tariflari */
export async function getSubscriptionPlans() {
  return api('/subscription/plans');
}

/**
 * §18.5 — to'lovni boshlash. Body'da provider INT:
 * AppStore=0, GooglePlay=1, Payme=2, Click=3.
 * @param {string} planId
 * @param {'AppStore'|'GooglePlay'|'Payme'|'Click'|number} provider
 * @returns {Promise<any>}
 */
export async function startPayment(planId, provider) {
  return api('/subscription/pay', {
    method: 'POST',
    body: { planId, provider: toEnumInt(PaymentProvider, provider, 2) },
  });
}

/** @returns {Promise<any>} Bildirishnomalar */
export async function getNotifications() {
  return api('/notifications');
}

/**
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function markNotificationRead(id) {
  return api(`/notifications/${id}/read`, { method: 'POST' });
}

/**
 * §19.3 — qurilmani push uchun ro'yxatdan o'tkazish.
 * Body'da platform INT: Android=0, Ios=1 (web klientlar odatda 0 yuboradi).
 * @param {string} token
 * @param {'Android'|'Ios'|number} [platform=0]
 * @returns {Promise<any>}
 */
export async function registerDevice(token, platform = 0) {
  return api('/notifications/device', {
    method: 'POST',
    body: { token, platform: toEnumInt(DevicePlatform, platform, 0) },
  });
}

/**
 * @param {JlptLevelName} [level] Daraja filtri (query'da NOM)
 * @returns {Promise<any>}
 */
export async function getMockTests(level) {
  const qs = level ? `?level=${level}` : '';
  return api(`/mock-tests${qs}`);
}

/**
 * @param {string} testId
 * @returns {Promise<any>} { attemptId, questions… }
 */
export async function startMockTest(testId) {
  return api(`/mock-tests/${testId}/start`, { method: 'POST' });
}

/**
 * §13.3 — bu yerdagi {id} startMockTest qaytargan ATTEMPT id, test id EMAS.
 * @param {string} attemptId
 * @param {unknown[]} answers
 * @returns {Promise<any>}
 */
export async function submitMockTest(attemptId, answers) {
  return api(`/mock-tests/${attemptId}/submit`, {
    method: 'POST',
    body: { answers },
  });
}

/**
 * §5 — Placement test (server tomonda baholanadi, sessiyali).
 * @param {'confirm' | 'auto'} mode 'confirm' — e'lon qilingan daraja tasdiqlanadi,
 *        'auto' — N5→N1 zinapoya
 * @param {number | null} [declaredLevel=null] Body'da enum RAQAM, 2.2-bo'lim (N5=5 … N1=1)
 * @returns {Promise<any>}
 */
export async function startPlacementTest(mode, declaredLevel = null) {
  return api('/placement-test/start', {
    method: 'POST',
    body: { mode, declaredLevel },
  });
}

/**
 * Placement test javoblari.
 * @param {number[]} answers answers[i] — savol[i] uchun tanlangan variant indeksi (-1 = tashlab ketildi)
 * @returns {Promise<any>} { finished, questions (auto keyingi bosqich), result: { estimatedLevel… } }
 */
export async function answerPlacementTest(answers) {
  return api('/placement-test/answer', {
    method: 'POST',
    body: { answers },
  });
}

/** @returns {Promise<any>} Joriy obuna */
export async function getCurrentSubscription() {
  return api('/subscription/current');
}

/** @returns {Promise<any>} */
export async function cancelSubscription() {
  return api('/subscription/cancel', { method: 'POST' });
}

/**
 * Mashq javobini serverda tekshirish.
 * @param {string} itemId
 * @param {LearningItemTypeName | number} itemType
 * @param {string} userAnswer
 * @returns {Promise<any>}
 */
export async function validateExerciseAnswer(itemId, itemType, userAnswer) {
  return api('/exercises/validate', {
    method: 'POST',
    body: { itemId, itemType, userAnswer },
  });
}
