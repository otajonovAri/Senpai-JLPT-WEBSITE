import { api } from './client';

export const getPodcasts = (level, category) => {
  const params = new URLSearchParams();
  if (level != null) params.set('level', level);
  if (category != null) params.set('category', category);
  const qs = params.toString();
  return api(`/podcasts${qs ? `?${qs}` : ''}`);
};

export const getPodcastDetail = (id) => api(`/podcasts/${id}`);

export const getEpisode = (id) => api(`/podcasts/episodes/${id}`);

export const updateProgress = (episodeId, progressSeconds, completed) =>
  api('/podcasts/progress', {
    method: 'POST',
    body: { episodeId, progressSeconds, completed },
  });

export const getListeningHistory = () => api('/podcasts/history');
