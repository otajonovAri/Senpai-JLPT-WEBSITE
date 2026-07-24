import { api } from './client';

export async function getAchievements() {
  return api('/achievements');
}

export async function checkAchievements() {
  return api('/achievements/check', { method: 'POST' });
}

export async function getDailyQuests() {
  return api('/daily-quests');
}

export async function claimQuestReward(questId) {
  return api(`/daily-quests/${questId}/claim`, { method: 'POST' });
}

export async function getLeagueStandings(tier) {
  return api(`/league/${tier}`);
}

export async function getLeaderboard(top = 20) {
  return api(`/leaderboard?top=${top}`, { auth: false });
}

export async function getFriends() {
  return api('/friends');
}

export async function sendFriendRequest(username) {
  return api('/friends/request', { method: 'POST', body: { username } });
}

export async function respondFriendRequest(friendshipId, accept) {
  return api(`/friends/${friendshipId}/respond`, {
    method: 'POST',
    body: { accept },
  });
}

export async function applyReferralCode(code) {
  return api('/referral/apply', { method: 'POST', body: { code } });
}

export async function getChallenges() {
  return api('/challenges');
}

export async function createChallenge(opponentId) {
  return api('/challenges', { method: 'POST', body: { opponentId } });
}

export async function respondChallenge(challengeId, accept) {
  return api(`/challenges/${challengeId}/respond`, {
    method: 'POST',
    body: { accept },
  });
}

export async function searchUsers(query) {
  if (!query || query.length < 2) return [];
  return api(`/users/search?q=${encodeURIComponent(query)}`);
}

export async function getUserProfile(userId) {
  return api(`/users/${userId}/profile`);
}

export async function removeFriend(userId) {
  return api(`/friends/${userId}`, { method: 'DELETE' });
}

export async function getReferralInfo() {
  return api('/referral/info');
}
