import { api } from './client';
import { LearningItemType, toEnumInt } from './enums';

// §10.4 — {level} is the JlptLevel NAME in the route (e.g. "N5").
export async function getRoadmap(level) {
  return api(`/roadmap/${level}`);
}

// Barcha darajalar holati: [{ level, unlocked, completed, totalLessons, completedLessons, isCurrent }]
export async function getLevels() {
  return api('/lessons/levels');
}

export async function getLessonCards(lessonId) {
  return api(`/lessons/${lessonId}/cards`);
}

// §10.2 — this endpoint binds the whole command from the body:
// { userId, itemId, itemType(int), known(bool), responseTimeMs }.
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

export async function completeLesson(lessonId, data) {
  return api(`/lessons/${lessonId}/complete`, {
    method: 'POST',
    body: data,
  });
}

export async function generateExercises(lessonId, type, count = 10) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  params.set('count', count);
  return api(`/exercises/generate/${lessonId}?${params}`);
}

export async function submitExerciseResult(data) {
  return api('/exercises/result', { method: 'POST', body: data });
}

export async function submitPronunciation(vocabularyId, score, syllableScores) {
  return api('/exercises/pronunciation', {
    method: 'POST',
    body: { vocabularyId, score, syllableScores },
  });
}

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

export async function submitKanjiWriting(kanjiId, score, strokeCount, correctStrokes) {
  return api('/exercises/kanji-writing', {
    method: 'POST',
    body: { kanjiId, score, strokeCount, correctStrokes },
  });
}
