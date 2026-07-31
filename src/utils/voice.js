// Boy/girl audio ovoz tanlovi — localStorage'da saqlanadi, sozlamalar bo'ylab bir xil.
const KEY = 'senpai_voice';

// R2/S3 audio bazasi. Audio URL runtime'da so'zdan quriladi: {BASE}/{so'z}_b.mp3 (boy) / _g.mp3 (girl).
const AUDIO_BASE = (import.meta.env.VITE_AUDIO_BASE || '').replace(/\/+$/, '');

export function getVoice() {
  return localStorage.getItem(KEY) === 'girl' ? 'girl' : 'boy';
}

export function setVoice(v) {
  localStorage.setItem(KEY, v === 'girl' ? 'girl' : 'boy');
}

// So'zdan audio URL quradi — yaponcha so'z URL uchun percent-encode qilinadi. BASE yo'q bo'lsa null.
function builtUrl(word, suffix) {
  return AUDIO_BASE && word ? `${AUDIO_BASE}/${encodeURIComponent(word)}_${suffix}.mp3` : null;
}

// Tanlangan ovozga mos audio URL'ni qaytaradi. Avval DB'dagi aniq URL (bo'lsa override),
// bo'lmasa so'zdan quriladi; tanlangan ovoz topilmasa ikkinchisiga tushadi.
export function pickAudio(item, voice) {
  if (!item) return null;
  const v = voice || getVoice();
  const boy = item.audioUrlBoy || builtUrl(item.word, 'b');
  const girl = item.audioUrlGirl || builtUrl(item.word, 'g');
  return v === 'girl' ? (girl || boy || null) : (boy || girl || null);
}
