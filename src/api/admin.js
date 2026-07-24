import { api } from './client';

export const adminApi = {
  dashboard: () => api('/admin/dashboard'),

  // Users
  listUsers: (search) => api(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  blockUser: (userId, reason, until) => api(`/admin/users/${userId}/block`, { method: 'POST', body: { reason, until } }),
  unblockUser: (userId) => api(`/admin/users/${userId}/unblock`, { method: 'POST' }),
  changeUserRole: (userId, role) => api(`/admin/users/${userId}/role`, { method: 'PUT', body: { role } }),

  // Vocabulary
  listVocabulary: (level) => api(`/admin/vocabulary${level != null ? `?level=${level}` : ''}`),
  createVocabulary: (data) => api('/admin/vocabulary', { method: 'POST', body: data }),
  updateVocabulary: (id, data) => api(`/admin/vocabulary/${id}`, { method: 'PUT', body: data }),
  deleteVocabulary: (id) => api(`/admin/vocabulary/${id}`, { method: 'DELETE' }),

  // Kanji
  listKanji: (level) => api(`/admin/kanji${level != null ? `?level=${level}` : ''}`),
  createKanji: (data) => api('/admin/kanji', { method: 'POST', body: data }),
  updateKanji: (id, data) => api(`/admin/kanji/${id}`, { method: 'PUT', body: data }),
  deleteKanji: (id) => api(`/admin/kanji/${id}`, { method: 'DELETE' }),

  // Grammar
  listGrammar: (level) => api(`/admin/grammar${level != null ? `?level=${level}` : ''}`),
  createGrammar: (data) => api('/admin/grammar', { method: 'POST', body: data }),
  updateGrammar: (id, data) => api(`/admin/grammar/${id}`, { method: 'PUT', body: data }),
  deleteGrammar: (id) => api(`/admin/grammar/${id}`, { method: 'DELETE' }),

  // Lessons
  listLessons: (level) => api(`/admin/lessons${level != null ? `?level=${level}` : ''}`),
  createLesson: (data) => api('/admin/lessons', { method: 'POST', body: data }),
  updateLesson: (id, data) => api(`/admin/lessons/${id}`, { method: 'PUT', body: data }),
  deleteLesson: (id) => api(`/admin/lessons/${id}`, { method: 'DELETE' }),

  // Shop Items
  listShopItems: () => api('/admin/shop-items'),
  createShopItem: (data) => api('/admin/shop-items', { method: 'POST', body: data }),
  updateShopItem: (id, data) => api(`/admin/shop-items/${id}`, { method: 'PUT', body: data }),
  deleteShopItem: (id) => api(`/admin/shop-items/${id}`, { method: 'DELETE' }),

  // FAQ
  listFaq: () => api('/admin/faq'),
  createFaq: (data) => api('/admin/faq', { method: 'POST', body: data }),
  updateFaq: (id, data) => api(`/admin/faq/${id}`, { method: 'PUT', body: data }),
  deleteFaq: (id) => api(`/admin/faq/${id}`, { method: 'DELETE' }),

  // Achievements
  listAchievements: () => api('/admin/achievements'),
  createAchievement: (data) => api('/admin/achievements', { method: 'POST', body: data }),
  updateAchievement: (id, data) => api(`/admin/achievements/${id}`, { method: 'PUT', body: data }),
  deleteAchievement: (id) => api(`/admin/achievements/${id}`, { method: 'DELETE' }),

  // Subscription Plans
  listSubscriptionPlans: () => api('/admin/subscription-plans'),
  createSubscriptionPlan: (data) => api('/admin/subscription-plans', { method: 'POST', body: data }),
  updateSubscriptionPlan: (id, data) => api(`/admin/subscription-plans/${id}`, { method: 'PUT', body: data }),
  deleteSubscriptionPlan: (id) => api(`/admin/subscription-plans/${id}`, { method: 'DELETE' }),

  // Daily Quests
  listDailyQuests: () => api('/admin/daily-quests'),
  createDailyQuest: (data) => api('/admin/daily-quests', { method: 'POST', body: data }),
  updateDailyQuest: (id, data) => api(`/admin/daily-quests/${id}`, { method: 'PUT', body: data }),
  deleteDailyQuest: (id) => api(`/admin/daily-quests/${id}`, { method: 'DELETE' }),

  // Study Groups (moderatsiya: student guruhlari tasdiq kutadi)
  listStudyGroups: (status) => api(`/admin/study-groups${status != null ? `?status=${status}` : ''}`),
  approveStudyGroup: (id) => api(`/admin/study-groups/${id}/approve`, { method: 'POST' }),
  rejectStudyGroup: (id) => api(`/admin/study-groups/${id}/reject`, { method: 'POST' }),
  updateStudyGroup: (id, data) => api(`/admin/study-groups/${id}`, { method: 'PUT', body: data }),
  deleteStudyGroup: (id) => api(`/admin/study-groups/${id}`, { method: 'DELETE' }),

  // Podcasts (via PodcastController)
  listPodcasts: () => api('/podcasts'),
  createPodcast: (data) => api('/podcasts', { method: 'POST', body: data }),
  updatePodcast: (id, data) => api(`/podcasts/${id}`, { method: 'PUT', body: data }),
  deletePodcast: (id) => api(`/podcasts/${id}`, { method: 'DELETE' }),
  createEpisode: (podcastId, data) => api(`/podcasts/${podcastId}/episodes`, { method: 'POST', body: data }),
  updateEpisode: (id, data) => api(`/podcasts/episodes/${id}`, { method: 'PUT', body: data }),
  deleteEpisode: (id) => api(`/podcasts/episodes/${id}`, { method: 'DELETE' }),

  // Mock Tests (admin CRUD — savollar to'liq, §2.2: query'da level NOM)
  listMockTests: (level) => api(`/admin/mock-tests${level != null ? `?level=${level}` : ''}`),
  createMockTest: (data) => api('/admin/mock-tests', { method: 'POST', body: data }),
  updateMockTest: (id, data) => api(`/admin/mock-tests/${id}`, { method: 'PUT', body: data }),
  deleteMockTest: (id) => api(`/admin/mock-tests/${id}`, { method: 'DELETE' }),
};
