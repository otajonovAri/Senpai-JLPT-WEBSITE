import { api } from './client';
import { LearningItemType, toEnumInt } from './enums';

export async function updateProfile(data) {
  return api('/profile', { method: 'PUT', body: data });
}

export async function changePassword(currentPassword, newPassword) {
  return api('/profile/change-password', {
    method: 'PUT',
    body: { currentPassword, newPassword },
  });
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  return api('/profile/avatar', {
    method: 'POST',
    body: formData,
    multipart: true,
  });
}

export async function deleteAccount(password) {
  return api('/profile', { method: 'DELETE', body: { password } });
}

export async function getProfileStats() {
  return api('/profile/stats');
}

export async function getHeatmap(days = 90) {
  return api(`/profile/heatmap?days=${days}`);
}

export async function getSavedItems(type) {
  const qs = type ? `?type=${type}` : '';
  return api(`/profile/saved${qs}`);
}

// §5.8 — body itemType must be int (Vocabulary=0, Kanji=1, Grammar=2).
export async function toggleSavedItem(itemId, itemType = 'Vocabulary') {
  return api('/profile/saved/toggle', {
    method: 'POST',
    body: { itemId, itemType: toEnumInt(LearningItemType, itemType, 0) },
  });
}

export async function getSettings() {
  return api('/settings');
}

export async function updateSettings(data) {
  return api('/settings', { method: 'PUT', body: data });
}

export async function getFaq() {
  return api('/faq', { auth: false });
}
