import { api } from './client';

/** @returns {Promise<any>} Yutuqlar ro'yxati */
export async function getAchievements() {
  return api('/achievements');
}

/** @returns {Promise<any>} Yangi ochilgan yutuqlarni tekshiradi */
export async function checkAchievements() {
  return api('/achievements/check', { method: 'POST' });
}

/** @returns {Promise<any>} Kunlik topshiriqlar */
export async function getDailyQuests() {
  return api('/daily-quests');
}

/**
 * @param {string} questId
 * @returns {Promise<any>}
 */
export async function claimQuestReward(questId) {
  return api(`/daily-quests/${questId}/claim`, { method: 'POST' });
}

/**
 * Liga jadvali. Route'da tier NOMI ketadi ("Bronze", "Silver"…).
 * @param {string} tier
 * @returns {Promise<any>}
 */
export async function getLeagueStandings(tier) {
  return api(`/league/${tier}`);
}

/**
 * @param {number} [top=20]
 * @returns {Promise<any>} Reyting (ochiq endpoint)
 */
export async function getLeaderboard(top = 20) {
  return api(`/leaderboard?top=${top}`, { auth: false });
}

/** @returns {Promise<any>} Do'stlar va so'rovlar */
export async function getFriends() {
  return api('/friends');
}

/**
 * @param {string} username
 * @returns {Promise<any>}
 */
export async function sendFriendRequest(username) {
  return api('/friends/request', { method: 'POST', body: { username } });
}

/**
 * @param {string} friendshipId
 * @param {boolean} accept
 * @returns {Promise<any>}
 */
export async function respondFriendRequest(friendshipId, accept) {
  return api(`/friends/${friendshipId}/respond`, {
    method: 'POST',
    body: { accept },
  });
}

/**
 * @param {string} code Referal kod
 * @returns {Promise<any>}
 */
export async function applyReferralCode(code) {
  return api('/referral/apply', { method: 'POST', body: { code } });
}

/** @returns {Promise<any>} Chaqiriqlar (challenges) */
export async function getChallenges() {
  return api('/challenges');
}

/**
 * @param {string} opponentId
 * @returns {Promise<any>}
 */
export async function createChallenge(opponentId) {
  return api('/challenges', { method: 'POST', body: { opponentId } });
}

/**
 * @param {string} challengeId
 * @param {boolean} accept
 * @returns {Promise<any>}
 */
export async function respondChallenge(challengeId, accept) {
  return api(`/challenges/${challengeId}/respond`, {
    method: 'POST',
    body: { accept },
  });
}

/**
 * Foydalanuvchi qidirish. 2 belgidan qisqa so'rovda so'rov yuborilmaydi.
 * @param {string} query
 * @returns {Promise<any>}
 */
export async function searchUsers(query) {
  if (!query || query.length < 2) return [];
  return api(`/users/search?q=${encodeURIComponent(query)}`);
}

/**
 * @param {string} userId
 * @returns {Promise<any>}
 */
export async function getUserProfile(userId) {
  return api(`/users/${userId}/profile`);
}

/**
 * @param {string} userId
 * @returns {Promise<any>}
 */
export async function removeFriend(userId) {
  return api(`/friends/${userId}`, { method: 'DELETE' });
}

/** @returns {Promise<any>} Referal kod va statistika */
export async function getReferralInfo() {
  return api('/referral/info');
}
