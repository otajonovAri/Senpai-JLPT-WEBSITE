import { api } from './client';

/**
 * @typedef {import('../types/models').JlptLevelName} JlptLevelName
 * @typedef {import('../types/models').KanaList} KanaList
 * @typedef {import('../types/models').DictionarySearchResult} DictionarySearchResult
 */

/**
 * @typedef {object} SearchParams
 * @property {JlptLevelName} [level] Daraja filtri (query'da NOM: "N5")
 * @property {string} [search] Qidiruv matni
 * @property {string} [wordType] So'z turkumi
 * @property {number} [page=1]
 * @property {number} [pageSize]
 */

/**
 * Lug'atdan so'z qidirish (sahifalangan).
 * Token bo'lsa yuboriladi (isLearned belgisi uchun); mehmon bo'lsa oddiy ishlaydi.
 * @param {SearchParams} [params]
 * @returns {Promise<any>} { items, total, page, pageSize }
 */
export async function searchVocabulary(params = {}) {
  const qs = new URLSearchParams();
  if (params.level) qs.set('level', params.level);
  if (params.search) qs.set('search', params.search);
  if (params.wordType) qs.set('wordType', params.wordType);
  qs.set('page', String(params.page || 1));
  qs.set('pageSize', String(params.pageSize || 20));
  return api(`/vocabulary?${qs}`);
}

/**
 * @param {string} id
 * @returns {Promise<any>} Vocabulary
 */
export async function getVocabularyById(id) {
  return api(`/vocabulary/${id}`);
}

/**
 * Kanji qidirish (sahifalangan).
 * @param {SearchParams} [params]
 * @returns {Promise<any>} { items, total, page, pageSize }
 */
export async function searchKanji(params = {}) {
  const qs = new URLSearchParams();
  if (params.level) qs.set('level', params.level);
  if (params.search) qs.set('search', params.search);
  qs.set('page', String(params.page || 1));
  qs.set('pageSize', String(params.pageSize || 50));
  return api(`/kanji?${qs}`);
}

/**
 * @param {string} id
 * @returns {Promise<any>} Kanji (ochiq endpoint)
 */
export async function getKanjiById(id) {
  return api(`/kanji/${id}`, { auth: false });
}

/**
 * §7.1 — hiragana jadvali.
 * @returns {Promise<KanaList>}
 */
export async function getHiragana() {
  return api('/kana/hiragana');
}

/**
 * §7.2 — katakana jadvali.
 * @returns {Promise<KanaList>}
 */
export async function getKatakana() {
  return api('/kana/katakana');
}

/**
 * §7.3 — bitta kana belgisining to'liq tafsiloti (stroke order, audio).
 * @param {string} id
 * @returns {Promise<any>} KanaCharacter
 */
export async function getKanaById(id) {
  return api(`/kana/${id}`);
}

/**
 * Umumiy qidiruv — so'z, kanji va grammatika bo'yicha.
 * @param {string} query
 * @returns {Promise<DictionarySearchResult>} Bo'sh so'rovda bo'sh natija (so'rov yuborilmaydi)
 */
export async function searchDictionary(query) {
  if (!query || query.length < 1) return { vocabulary: [], kanji: [], grammar: [] };
  return api(`/dictionary/search?q=${encodeURIComponent(query)}`);
}

/**
 * Grammatika ro'yxati.
 * @param {JlptLevelName | number} [level] Daraja filtri (query'da NOM)
 * @returns {Promise<any>} Grammar[] yoki { items }
 */
export async function getGrammarList(level) {
  const qs = level ? `?level=${level}` : '';
  return api(`/grammar${qs}`);
}

/**
 * @param {string} id
 * @returns {Promise<any>} Grammar
 */
export async function getGrammarById(id) {
  return api(`/grammar/${id}`);
}
