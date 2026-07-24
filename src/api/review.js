import { api } from './client';
import { LearningItemType, toEnumInt } from './enums';

export async function getDueReviews() {
  return api('/review/due');
}

// §12.2 — body itemType must be int (Vocabulary=0, Kanji=1, Grammar=2); quality 0–5.
export async function submitReview(itemId, itemType, quality) {
  return api('/review', {
    method: 'POST',
    body: { itemId, itemType: toEnumInt(LearningItemType, itemType, 0), quality },
  });
}

export async function getWeakWords(limit = 20) {
  return api(`/review/weak?limit=${limit}`);
}

export async function getReviewForecast() {
  return api('/review/forecast');
}

export async function getFlashcardItems(type, limit = 30) {
  const qs = new URLSearchParams();
  if (type != null) qs.set('type', type);
  qs.set('limit', limit);
  return api(`/review/flashcards?${qs}`);
}
