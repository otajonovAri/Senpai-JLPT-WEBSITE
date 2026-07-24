import { api } from './client';

// §3.1 — GET /home/dashboard: user, levelProgress (real totallar bilan),
// dailyGoal, leaderboardRank, reviewsDueToday, currentLeague — bitta so'rovda
export async function getHomeDashboard() {
  return api('/home/dashboard');
}
