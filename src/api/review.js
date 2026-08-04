import { api } from './client';
import { LearningItemType, toEnumInt } from './enums';

/**
 * @typedef {import('../types/models').LearningItemTypeName} LearningItemTypeName
 * @typedef {import('../types/models').JlptLevelName} JlptLevelName
 */

/** @returns {Promise<any>} Bugun takrorlash kerak bo'lgan elementlar (SRS) */
export async function getDueReviews() {
  return api('/review/due');
}

/**
 * §12.2 — SRS javobini yuborish.
 * Body'da itemType INT bo'lishi shart (Vocabulary=0, Kanji=1, Grammar=2).
 * @param {string} itemId
 * @param {LearningItemTypeName} itemType
 * @param {number} quality Eslab qolish sifati, 0–5
 * @returns {Promise<any>}
 */
export async function submitReview(itemId, itemType, quality) {
  return api('/review', {
    method: 'POST',
    body: { itemId, itemType: toEnumInt(LearningItemType, itemType, 0), quality },
  });
}

/**
 * Eng ko'p xato qilinadigan so'zlar.
 * @param {number} [limit=20]
 * @returns {Promise<any>}
 */
export async function getWeakWords(limit = 20) {
  return api(`/review/weak?limit=${limit}`);
}

/** @returns {Promise<any>} Kelgusi takrorlashlar prognozi */
export async function getReviewForecast() {
  return api('/review/forecast');
}

/**
 * Fleshkarta uchun elementlar.
 * @param {LearningItemTypeName | string} [type] Element turi (query'da NOM)
 * @param {number} [limit=30]
 * @param {JlptLevelName | null} [level=null] Daraja filtri (query'da NOM, masalan "N5")
 * @param {boolean} [learnedOnly=false] Faqat o'rganilganlar
 * @returns {Promise<any>}
 */
export async function getFlashcardItems(type, limit = 30, level = null, learnedOnly = false) {
  const qs = new URLSearchParams();
  if (type != null) qs.set('type', type);
  if (level != null) qs.set('level', level);
  if (learnedOnly) qs.set('learnedOnly', 'true');
  qs.set('limit', String(limit));
  return api(`/review/flashcards?${qs}`);
}
