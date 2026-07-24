import { api } from './client';

export async function searchVocabulary(params = {}) {
  const qs = new URLSearchParams();
  if (params.level) qs.set('level', params.level);
  if (params.search) qs.set('search', params.search);
  if (params.wordType) qs.set('wordType', params.wordType);
  qs.set('page', params.page || 1);
  qs.set('pageSize', params.pageSize || 20);
  return api(`/vocabulary?${qs}`, { auth: false });
}

export async function getVocabularyById(id) {
  return api(`/vocabulary/${id}`, { auth: false });
}

export async function searchKanji(params = {}) {
  const qs = new URLSearchParams();
  if (params.level) qs.set('level', params.level);
  if (params.search) qs.set('search', params.search);
  qs.set('page', params.page || 1);
  qs.set('pageSize', params.pageSize || 50);
  return api(`/kanji?${qs}`, { auth: false });
}

export async function getKanjiById(id) {
  return api(`/kanji/${id}`, { auth: false });
}

export async function getHiragana() {
  return api('/kana/hiragana');
}

export async function getKatakana() {
  return api('/kana/katakana');
}

export async function getKanaById(id) {
  return api(`/kana/${id}`);
}

export async function searchDictionary(query) {
  if (!query || query.length < 1) return { vocabulary: [], kanji: [], grammar: [] };
  return api(`/dictionary/search?q=${encodeURIComponent(query)}`);
}

export async function getGrammarList(level) {
  const qs = level ? `?level=${level}` : '';
  return api(`/grammar${qs}`);
}

export async function getGrammarById(id) {
  return api(`/grammar/${id}`);
}
