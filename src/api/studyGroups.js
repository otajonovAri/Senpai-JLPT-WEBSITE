import { api } from './client';

/** @typedef {import('../types/models').JlptLevelName} JlptLevelName */

/**
 * Ochiq (public) o'quv guruhlari ro'yxati.
 * @param {string} [search] Nom bo'yicha qidiruv
 * @param {JlptLevelName | number | null} [level] Daraja filtri (query'da NOM)
 * @returns {Promise<any>}
 */
export const getPublicGroups = (search, level) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (level != null) params.set('level', String(level));
  const qs = params.toString();
  return api(`/study-groups${qs ? `?${qs}` : ''}`);
};

/** @returns {Promise<any>} Foydalanuvchi a'zo bo'lgan guruhlar */
export const getMyGroups = () => api('/study-groups/my');

/**
 * @param {string} id
 * @returns {Promise<any>}
 */
export const getGroupDetail = (id) => api(`/study-groups/${id}`);

/**
 * @param {Record<string, unknown>} data
 * @returns {Promise<any>}
 */
export const createGroup = (data) =>
  api('/study-groups', { method: 'POST', body: data });

/**
 * @param {string} id
 * @returns {Promise<any>}
 */
export const joinGroup = (id) =>
  api(`/study-groups/${id}/join`, { method: 'POST' });

/**
 * @param {string} code Taklif kodi
 * @returns {Promise<any>}
 */
export const joinByCode = (code) =>
  api('/study-groups/join-by-code', { method: 'POST', body: { code } });

/**
 * @param {string} id
 * @returns {Promise<any>}
 */
export const leaveGroup = (id) =>
  api(`/study-groups/${id}/leave`, { method: 'DELETE' });
