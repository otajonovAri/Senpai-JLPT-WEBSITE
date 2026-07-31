// Boy/girl audio ovoz tanlovi — localStorage'da saqlanadi, sozlamalar bo'ylab bir xil.
const KEY = 'senpai_voice';

export function getVoice() {
  return localStorage.getItem(KEY) === 'girl' ? 'girl' : 'boy';
}

export function setVoice(v) {
  localStorage.setItem(KEY, v === 'girl' ? 'girl' : 'boy');
}

// Vocab elementidan tanlangan ovozga mos audio URL'ni qaytaradi (yo'q bo'lsa ikkinchisiga tushadi).
export function pickAudio(item, voice) {
  if (!item) return null;
  const v = voice || getVoice();
  const boy = item.audioUrlBoy;
  const girl = item.audioUrlGirl;
  return v === 'girl' ? (girl || boy || null) : (boy || girl || null);
}
