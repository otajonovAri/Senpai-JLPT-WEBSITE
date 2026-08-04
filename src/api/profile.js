import { api } from './client';
import { LearningItemType, toEnumInt } from './enums';

/**
 * @typedef {import('../types/models').LearningItemTypeName} LearningItemTypeName
 */

/**
 * Profil ma'lumotlarini yangilash.
 * @param {Record<string, unknown>} data
 * @returns {Promise<any>}
 */
export async function updateProfile(data) {
  return api('/profile', { method: 'PUT', body: data });
}

/**
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<any>}
 */
export async function changePassword(currentPassword, newPassword) {
  return api('/profile/change-password', {
    method: 'PUT',
    body: { currentPassword, newPassword },
  });
}

/**
 * Avatar rasmini yuklash (multipart).
 * @param {File | Blob} file
 * @returns {Promise<any>}
 */
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  return api('/profile/avatar', {
    method: 'POST',
    body: formData,
    multipart: true,
  });
}

/**
 * Hisobni o'chirish (parol bilan tasdiqlanadi).
 * @param {string} password
 * @returns {Promise<any>}
 */
export async function deleteAccount(password) {
  return api('/profile', { method: 'DELETE', body: { password } });
}

/** @returns {Promise<any>} Profil statistikasi (coins, totalXp, streak…) */
export async function getProfileStats() {
  return api('/profile/stats');
}

/**
 * Faollik heatmap'i.
 * @param {number} [days=90]
 * @returns {Promise<any>}
 */
export async function getHeatmap(days = 90) {
  return api(`/profile/heatmap?days=${days}`);
}

/**
 * Saqlangan (sevimli) elementlar.
 * @param {LearningItemTypeName | string} [type] Filtr — berilmasa hammasi
 * @returns {Promise<any>}
 */
export async function getSavedItems(type) {
  const qs = type ? `?type=${type}` : '';
  return api(`/profile/saved${qs}`);
}

/**
 * §5.8 — sevimlilarga qo'shish/olib tashlash.
 * Body'da itemType INT bo'lishi shart (Vocabulary=0, Kanji=1, Grammar=2).
 * @param {string} itemId
 * @param {LearningItemTypeName} [itemType='Vocabulary']
 * @returns {Promise<any>}
 */
export async function toggleSavedItem(itemId, itemType = 'Vocabulary') {
  return api('/profile/saved/toggle', {
    method: 'POST',
    body: { itemId, itemType: toEnumInt(LearningItemType, itemType, 0) },
  });
}

/** @returns {Promise<any>} UserSettingsDto */
export async function getSettings() {
  return api('/settings');
}

/**
 * §6.2 — PUT to'liq obyektni talab qiladi (qisman yangilash emas).
 * @param {Record<string, unknown>} data
 * @returns {Promise<any>}
 */
export async function updateSettings(data) {
  return api('/settings', { method: 'PUT', body: data });
}

/** @returns {Promise<any>} FAQ ro'yxati (ochiq endpoint) */
export async function getFaq() {
  return api('/faq', { auth: false });
}
