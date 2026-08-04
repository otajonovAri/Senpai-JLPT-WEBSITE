// Boy/girl audio ovoz tanlovi — localStorage'da saqlanadi, sozlamalar bo'ylab bir xil.
const KEY = 'senpai_voice';

// R2/S3 audio bazasi. Audio URL runtime'da so'zdan quriladi: {BASE}/{so'z}_b.mp3 (boy) / _g.mp3 (girl).
const AUDIO_BASE = (import.meta.env.VITE_AUDIO_BASE || '').replace(/\/+$/, '');

/** @typedef {import('../types/models').VoiceId} VoiceId */

/**
 * Saqlangan ovoz tanlovi (default: 'boy').
 * @returns {VoiceId}
 */
export function getVoice() {
  return localStorage.getItem(KEY) === 'girl' ? 'girl' : 'boy';
}

/**
 * Ovoz tanlovini saqlaydi.
 * @param {VoiceId | string} v
 * @returns {void}
 */
export function setVoice(v) {
  localStorage.setItem(KEY, v === 'girl' ? 'girl' : 'boy');
}

/**
 * So'zdan audio URL quradi — yaponcha so'z URL uchun percent-encode qilinadi.
 * @param {string | null | undefined} word
 * @param {'b' | 'g'} suffix
 * @returns {string | null} BASE sozlanmagan bo'lsa null
 */
function builtUrl(word, suffix) {
  return AUDIO_BASE && word ? `${AUDIO_BASE}/${encodeURIComponent(word)}_${suffix}.mp3` : null;
}

/**
 * Tanlangan ovozga mos audio URL'ni so'zdan quradi (R2'dagi {word}_b.mp3 / _g.mp3).
 * DB'dagi audioUrl* ishlatilmaydi — u eski/noto'g'ri prefiks bo'lishi mumkin
 * (seeder olib tashlangan). Tanlangan ovoz topilmasa ikkinchisiga tushadi.
 *
 * @param {{ word?: string | null } | null | undefined} item
 * @param {VoiceId} [voice] Berilmasa saqlangan tanlov ishlatiladi
 * @returns {string | null}
 */
export function pickAudio(item, voice) {
  if (!item) return null;
  const v = voice || getVoice();
  const boy = builtUrl(item.word, 'b');
  const girl = builtUrl(item.word, 'g');
  return v === 'girl' ? (girl || boy || null) : (boy || girl || null);
}
