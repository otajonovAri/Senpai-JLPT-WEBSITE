// Kana ↔ romaji yordamchilari.
// Flashcard "romaji" rejimlari va Kana Ninja o'yini uchun ishlatiladi.
// (Japanese-Flash-Card-Game manbasidan portlangan va tozalangan.)

const KANA_ROMAJI_MAP = (() => {
  const base = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'ゐ': 'i', 'ゑ': 'e', 'を': 'wo', 'ん': 'n',
    'ー': '-',
    'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o',
  };
  const yoon = {
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo', 'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho', 'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho', 'ぢゃ': 'ja', 'ぢゅ': 'ju', 'ぢょ': 'jo',
    'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo', 'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
    'ふぁ': 'fa', 'ふぃ': 'fi', 'ふぇ': 'fe', 'ふぉ': 'fo',
    'ゔぁ': 'va', 'ゔぃ': 'vi', 'ゔ': 'vu', 'ゔぇ': 've', 'ゔぉ': 'vo',
    'てぃ': 'ti', 'でぃ': 'di', 'とぅ': 'tou', 'どぅ': 'du',
    'ちぇ': 'che', 'じぇ': 'je', 'しぇ': 'she',
  };
  const map = { ...yoon };
  for (const k in base) map[k] = base[k];
  return { map, yoon };
})();

export function katakanaToHiragana(s) {
  return (s || '').replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

// Kana matnini romaji'ga o'giradi. Tanilmagan belgilar (kanji, tinish) o'z holicha o'tadi.
export function kanaToRomaji(kana) {
  if (!kana) return '';
  const s = katakanaToHiragana(kana);
  const { map, yoon } = KANA_ROMAJI_MAP;
  let out = '';
  let i = 0;
  while (i < s.length) {
    const two = s.slice(i, i + 2);
    if (yoon[two]) { out += yoon[two]; i += 2; continue; }
    const ch = s[i];
    if (ch === 'っ') {                       // kichik tsu — keyingi undoshni ikkilantiradi
      const nextRomaji = yoon[s.slice(i + 1, i + 3)] || map[s[i + 1]] || '';
      out += nextRomaji.replace(/^ch/, 't')[0] || '';
      i += 1;
      continue;
    }
    if (ch === 'ん') {                        // unlidan oldin n' bo'ladi
      const next = s[i + 1];
      out += (next && /[あいうえおやゆよ]/.test(next)) ? "n'" : 'n';
      i += 1;
      continue;
    }
    if (map[ch] !== undefined) { out += map[ch]; i += 1; continue; }
    out += ch;                                // tanilmagan — o'z holicha
    i += 1;
  }
  return out;
}
