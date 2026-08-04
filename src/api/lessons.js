import { api } from './client';
import { LearningItemType, toEnumInt } from './enums';

/**
 * @typedef {import('../types/models').JlptLevelName} JlptLevelName
 * @typedef {import('../types/models').LearningItemTypeName} LearningItemTypeName
 * @typedef {import('../types/models').ExerciseResultRequest} ExerciseResultRequest
 * @typedef {import('../types/models').ExerciseResultResponse} ExerciseResultResponse
 */

/**
 * §10.4 — {level} route'da JlptLevel NOMI (masalan "N5").
 * @param {JlptLevelName} level
 * @returns {Promise<any>}
 */
export async function getRoadmap(level) {
  return api(`/roadmap/${level}`);
}

/**
 * Barcha darajalar holati.
 * @returns {Promise<any>} [{ level, unlocked, completed, totalLessons, completedLessons, isCurrent }]
 */
export async function getLevels() {
  return api('/lessons/levels');
}

/**
 * @param {string} lessonId
 * @returns {Promise<any>} Dars kartochkalari
 */
export async function getLessonCards(lessonId) {
  return api(`/lessons/${lessonId}/cards`);
}

/**
 * §10.2 — bu endpoint butun komandani body'dan bog'laydi:
 * { userId, itemId, itemType(int), known(bool), responseTimeMs }.
 *
 * @param {object} params
 * @param {string} params.itemId
 * @param {LearningItemTypeName | number} params.itemType
 * @param {boolean} params.known
 * @param {number} [params.responseTimeMs=0]
 * @param {string} [params.userId]
 * @returns {Promise<any>}
 */
export async function submitCardResponse({ itemId, itemType, known, responseTimeMs = 0, userId }) {
  return api('/cards/response', {
    method: 'POST',
    body: {
      ...(userId ? { userId } : {}),
      itemId,
      itemType: toEnumInt(LearningItemType, itemType, 0),
      known: !!known,
      responseTimeMs,
    },
  });
}

/**
 * @param {string} lessonId
 * @param {Record<string, unknown>} data
 * @returns {Promise<any>}
 */
export async function completeLesson(lessonId, data) {
  return api(`/lessons/${lessonId}/complete`, {
    method: 'POST',
    body: data,
  });
}

/**
 * Dars uchun mashq savollarini generatsiya qiladi.
 * @param {string} lessonId
 * @param {string} [type] Mashq turi
 * @param {number} [count=10]
 * @returns {Promise<any>}
 */
export async function generateExercises(lessonId, type, count = 10) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  params.set('count', String(count));
  return api(`/exercises/generate/${lessonId}?${params}`);
}

/**
 * §11.2 — mashq natijasini yuborish (XP shu yerda hisoblanadi).
 * `exerciseType` va `answers[].itemType` bu yerda MATN sifatida yuboriladi.
 * @param {ExerciseResultRequest} data
 * @returns {Promise<ExerciseResultResponse>}
 */
export async function submitExerciseResult(data) {
  return api('/exercises/result', { method: 'POST', body: data });
}

/**
 * @param {string} vocabularyId
 * @param {number} score
 * @param {unknown} [syllableScores]
 * @returns {Promise<any>}
 */
export async function submitPronunciation(vocabularyId, score, syllableScores) {
  return api('/exercises/pronunciation', {
    method: 'POST',
    body: { vocabularyId, score, syllableScores },
  });
}

/**
 * Talaffuzni audio bo'yicha baholash (Azure Speech).
 * @param {string} vocabularyId
 * @param {File | Blob} audioFile
 * @returns {Promise<any>}
 */
export async function evaluatePronunciation(vocabularyId, audioFile) {
  const formData = new FormData();
  formData.append('VocabularyId', vocabularyId);
  formData.append('Audio', audioFile);
  return api('/exercises/pronunciation/evaluate', {
    method: 'POST',
    body: formData,
    multipart: true,
  });
}

/**
 * @param {string} kanjiId
 * @param {number} score
 * @param {number} strokeCount
 * @param {number} correctStrokes
 * @returns {Promise<any>}
 */
export async function submitKanjiWriting(kanjiId, score, strokeCount, correctStrokes) {
  return api('/exercises/kanji-writing', {
    method: 'POST',
    body: { kanjiId, score, strokeCount, correctStrokes },
  });
}
