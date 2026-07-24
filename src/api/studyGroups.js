import { api } from './client';

export const getPublicGroups = (search, level) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (level != null) params.set('level', level);
  const qs = params.toString();
  return api(`/study-groups${qs ? `?${qs}` : ''}`);
};

export const getMyGroups = () => api('/study-groups/my');

export const getGroupDetail = (id) => api(`/study-groups/${id}`);

export const createGroup = (data) =>
  api('/study-groups', { method: 'POST', body: data });

export const joinGroup = (id) =>
  api(`/study-groups/${id}/join`, { method: 'POST' });

export const joinByCode = (code) =>
  api('/study-groups/join-by-code', { method: 'POST', body: { code } });

export const leaveGroup = (id) =>
  api(`/study-groups/${id}/leave`, { method: 'DELETE' });
