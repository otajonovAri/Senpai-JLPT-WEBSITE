import { api } from './client';

/** @typedef {import('../types/models').JlptLevelName} JlptLevelName */

/**
 * Podkastlar ro'yxati.
 * @param {JlptLevelName | number | null} [level] Daraja filtri (query'da NOM)
 * @param {string | null} [category] Kategoriya filtri
 * @returns {Promise<any>}
 */
export const getPodcasts = (level, category) => {
  const params = new URLSearchParams();
  if (level != null) params.set('level', String(level));
  if (category != null) params.set('category', category);
  const qs = params.toString();
  return api(`/podcasts${qs ? `?${qs}` : ''}`);
};

/**
 * @param {string} id
 * @returns {Promise<any>}
 */
export const getPodcastDetail = (id) => api(`/podcasts/${id}`);

/**
 * @param {string} id
 * @returns {Promise<any>}
 */
export const getEpisode = (id) => api(`/podcasts/episodes/${id}`);

/**
 * Tinglash progressini saqlash.
 * @param {string} episodeId
 * @param {number} progressSeconds
 * @param {boolean} completed
 * @returns {Promise<any>}
 */
export const updateProgress = (episodeId, progressSeconds, completed) =>
  api('/podcasts/progress', {
    method: 'POST',
    body: { episodeId, progressSeconds, completed },
  });

/** @returns {Promise<any>} Tinglash tarixi */
export const getListeningHistory = () => api('/podcasts/history');
