import { api } from './client';

/**
 * Admin CRUD API.
 *
 * Bu modul bir xil shakldagi ko'p endpointdan iborat, shuning uchun har biriga
 * alohida JSDoc yozish o'rniga qayta ishlatiladigan funksiya turlari aniqlangan.
 *
 * @typedef {import('../types/models').JlptLevelName} JlptLevelName
 *
 * @typedef {() => Promise<any>} ListFn
 * @typedef {(level?: JlptLevelName | number | null) => Promise<any>} ListByLevelFn
 * @typedef {(data: Record<string, unknown>) => Promise<any>} CreateFn
 * @typedef {(id: string, data: Record<string, unknown>) => Promise<any>} UpdateFn
 * @typedef {(id: string) => Promise<any>} ByIdFn
 */

export const adminApi = {
  dashboard: () => api('/admin/dashboard'),

  // Users
  /** @type {(search?: string) => Promise<any>} */
  listUsers: (search) => api(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  /** @type {(userId: string, reason: string, until?: string | null) => Promise<any>} */
  blockUser: (userId, reason, until) => api(`/admin/users/${userId}/block`, { method: 'POST', body: { reason, until } }),
  /** @type {ByIdFn} */
  unblockUser: (userId) => api(`/admin/users/${userId}/unblock`, { method: 'POST' }),
  /** @type {(userId: string, role: string) => Promise<any>} */
  changeUserRole: (userId, role) => api(`/admin/users/${userId}/role`, { method: 'PUT', body: { role } }),

  // Vocabulary
  /** @type {ListByLevelFn} */
  listVocabulary: (level) => api(`/admin/vocabulary${level != null ? `?level=${level}` : ''}`),
  /** @type {CreateFn} */
  createVocabulary: (data) => api('/admin/vocabulary', { method: 'POST', body: data }),
  /** @type {UpdateFn} */
  updateVocabulary: (id, data) => api(`/admin/vocabulary/${id}`, { method: 'PUT', body: data }),
  /** @type {ByIdFn} */
  deleteVocabulary: (id) => api(`/admin/vocabulary/${id}`, { method: 'DELETE' }),

  // Kanji
  /** @type {ListByLevelFn} */
  listKanji: (level) => api(`/admin/kanji${level != null ? `?level=${level}` : ''}`),
  /** @type {CreateFn} */
  createKanji: (data) => api('/admin/kanji', { method: 'POST', body: data }),
  /** @type {UpdateFn} */
  updateKanji: (id, data) => api(`/admin/kanji/${id}`, { method: 'PUT', body: data }),
  /** @type {ByIdFn} */
  deleteKanji: (id) => api(`/admin/kanji/${id}`, { method: 'DELETE' }),

  // Grammar
  /** @type {ListByLevelFn} */
  listGrammar: (level) => api(`/admin/grammar${level != null ? `?level=${level}` : ''}`),
  /** @type {CreateFn} */
  createGrammar: (data) => api('/admin/grammar', { method: 'POST', body: data }),
  /** @type {UpdateFn} */
  updateGrammar: (id, data) => api(`/admin/grammar/${id}`, { method: 'PUT', body: data }),
  /** @type {ByIdFn} */
  deleteGrammar: (id) => api(`/admin/grammar/${id}`, { method: 'DELETE' }),

  // Lessons
  /** @type {ListByLevelFn} */
  listLessons: (level) => api(`/admin/lessons${level != null ? `?level=${level}` : ''}`),
  /** @type {CreateFn} */
  createLesson: (data) => api('/admin/lessons', { method: 'POST', body: data }),
  /** @type {UpdateFn} */
  updateLesson: (id, data) => api(`/admin/lessons/${id}`, { method: 'PUT', body: data }),
  /** @type {ByIdFn} */
  deleteLesson: (id) => api(`/admin/lessons/${id}`, { method: 'DELETE' }),

  // Shop Items
  /** @type {ListFn} */
  listShopItems: () => api('/admin/shop-items'),
  /** @type {CreateFn} */
  createShopItem: (data) => api('/admin/shop-items', { method: 'POST', body: data }),
  /** @type {UpdateFn} */
  updateShopItem: (id, data) => api(`/admin/shop-items/${id}`, { method: 'PUT', body: data }),
  /** @type {ByIdFn} */
  deleteShopItem: (id) => api(`/admin/shop-items/${id}`, { method: 'DELETE' }),

  // FAQ
  /** @type {ListFn} */
  listFaq: () => api('/admin/faq'),
  /** @type {CreateFn} */
  createFaq: (data) => api('/admin/faq', { method: 'POST', body: data }),
  /** @type {UpdateFn} */
  updateFaq: (id, data) => api(`/admin/faq/${id}`, { method: 'PUT', body: data }),
  /** @type {ByIdFn} */
  deleteFaq: (id) => api(`/admin/faq/${id}`, { method: 'DELETE' }),

  // Achievements
  /** @type {ListFn} */
  listAchievements: () => api('/admin/achievements'),
  /** @type {CreateFn} */
  createAchievement: (data) => api('/admin/achievements', { method: 'POST', body: data }),
  /** @type {UpdateFn} */
  updateAchievement: (id, data) => api(`/admin/achievements/${id}`, { method: 'PUT', body: data }),
  /** @type {ByIdFn} */
  deleteAchievement: (id) => api(`/admin/achievements/${id}`, { method: 'DELETE' }),

  // Subscription Plans
  /** @type {ListFn} */
  listSubscriptionPlans: () => api('/admin/subscription-plans'),
  /** @type {CreateFn} */
  createSubscriptionPlan: (data) => api('/admin/subscription-plans', { method: 'POST', body: data }),
  /** @type {UpdateFn} */
  updateSubscriptionPlan: (id, data) => api(`/admin/subscription-plans/${id}`, { method: 'PUT', body: data }),
  /** @type {ByIdFn} */
  deleteSubscriptionPlan: (id) => api(`/admin/subscription-plans/${id}`, { method: 'DELETE' }),

  // Daily Quests
  /** @type {ListFn} */
  listDailyQuests: () => api('/admin/daily-quests'),
  /** @type {CreateFn} */
  createDailyQuest: (data) => api('/admin/daily-quests', { method: 'POST', body: data }),
  /** @type {UpdateFn} */
  updateDailyQuest: (id, data) => api(`/admin/daily-quests/${id}`, { method: 'PUT', body: data }),
  /** @type {ByIdFn} */
  deleteDailyQuest: (id) => api(`/admin/daily-quests/${id}`, { method: 'DELETE' }),

  // Study Groups (moderatsiya: student guruhlari tasdiq kutadi)
  /** @type {(status?: string | number | null) => Promise<any>} */
  listStudyGroups: (status) => api(`/admin/study-groups${status != null ? `?status=${status}` : ''}`),
  /** @type {ByIdFn} */
  approveStudyGroup: (id) => api(`/admin/study-groups/${id}/approve`, { method: 'POST' }),
  /** @type {ByIdFn} */
  rejectStudyGroup: (id) => api(`/admin/study-groups/${id}/reject`, { method: 'POST' }),
  /** @type {UpdateFn} */
  updateStudyGroup: (id, data) => api(`/admin/study-groups/${id}`, { method: 'PUT', body: data }),
  /** @type {ByIdFn} */
  deleteStudyGroup: (id) => api(`/admin/study-groups/${id}`, { method: 'DELETE' }),

  // Podcasts (via PodcastController)
  /** @type {ListFn} */
  listPodcasts: () => api('/podcasts'),
  /** @type {CreateFn} */
  createPodcast: (data) => api('/podcasts', { method: 'POST', body: data }),
  /** @type {UpdateFn} */
  updatePodcast: (id, data) => api(`/podcasts/${id}`, { method: 'PUT', body: data }),
  /** @type {ByIdFn} */
  deletePodcast: (id) => api(`/podcasts/${id}`, { method: 'DELETE' }),
  /** @type {(podcastId: string, data: Record<string, unknown>) => Promise<any>} */
  createEpisode: (podcastId, data) => api(`/podcasts/${podcastId}/episodes`, { method: 'POST', body: data }),
  /** @type {UpdateFn} */
  updateEpisode: (id, data) => api(`/podcasts/episodes/${id}`, { method: 'PUT', body: data }),
  /** @type {ByIdFn} */
  deleteEpisode: (id) => api(`/podcasts/episodes/${id}`, { method: 'DELETE' }),

  // Mock Tests (admin CRUD — savollar to'liq, §2.2: query'da level NOM)
  /** @type {ListByLevelFn} */
  listMockTests: (level) => api(`/admin/mock-tests${level != null ? `?level=${level}` : ''}`),
  /** @type {CreateFn} */
  createMockTest: (data) => api('/admin/mock-tests', { method: 'POST', body: data }),
  /** @type {CreateFn} */
  generateMockTest: (data) => api('/admin/mock-tests/generate', { method: 'POST', body: data }),
  /** @type {UpdateFn} */
  updateMockTest: (id, data) => api(`/admin/mock-tests/${id}`, { method: 'PUT', body: data }),
  /** @type {ByIdFn} */
  deleteMockTest: (id) => api(`/admin/mock-tests/${id}`, { method: 'DELETE' }),
};
