import { describe, it, expect } from 'vitest';
import {
  shuffle, buildChoices, accuracyPercent, maskSentence, buildGrammarQuestions,
} from './practice';

// Bu funksiyalar tasodifiylikka tayanadi — shuning uchun bir nechta xossa
// (property) bir necha yuz marta tekshiriladi, bitta natija emas.

describe('buildChoices', () => {
  const pool = ['ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so', 'ta', 'chi'];

  it('har doim 4 ta takrorlanmas variant qaytaradi va to‘g‘ri javob ichida bo‘ladi', () => {
    for (let i = 0; i < 300; i++) {
      const options = buildChoices('a', pool, 4);
      expect(options).toHaveLength(4);
      expect(options).toContain('a');
      expect(new Set(options).size).toBe(4);
    }
  });

  it('manba kichik bo‘lsa kamroq variant beradi, lekin takrorlamaydi', () => {
    const options = buildChoices('a', ['ka'], 4);
    expect(options).toHaveLength(2);
    expect(new Set(options).size).toBe(2);
    expect(options).toContain('a');
  });

  it('manba bo‘sh bo‘lsa faqat to‘g‘ri javobni qaytaradi', () => {
    expect(buildChoices('a', [], 4)).toEqual(['a']);
  });

  it('manbada to‘g‘ri javob bo‘lsa uni ikki marta qo‘shmaydi', () => {
    const options = buildChoices('a', ['a', 'a', 'ki', 'ku', 'ke'], 4);
    expect(options.filter(o => o === 'a')).toHaveLength(1);
    expect(new Set(options).size).toBe(4);
  });
});

describe('shuffle', () => {
  it('kiruvchi massivni o‘zgartirmaydi', () => {
    const src = [1, 2, 3, 4, 5];
    shuffle(src);
    expect(src).toEqual([1, 2, 3, 4, 5]);
  });

  it('barcha elementlarni saqlaydi', () => {
    expect([...shuffle([1, 2, 3, 4, 5])].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('null/undefined bilan yiqilmaydi', () => {
    expect(shuffle(null)).toEqual([]);
    expect(shuffle(undefined)).toEqual([]);
  });
});

describe('accuracyPercent', () => {
  it('foizni hisoblaydi', () => {
    expect(accuracyPercent(7, 10)).toBe(70);
  });

  it('nolga bo‘lishdan himoyalangan', () => {
    expect(accuracyPercent(0, 0)).toBe(0);
  });

  it('butun songa yaxlitlaydi', () => {
    expect(accuracyPercent(2, 3)).toBe(67);
  });
});

describe('maskSentence', () => {
  it('tilda bilan yozilgan grammatika nuqtasini bekitadi', () => {
    const { text, masked } = maskSentence('ここに座ってもいいです。', '〜てもいい');
    expect(masked).toBe(true);
    expect(text).toContain('＿＿');
    expect(text).not.toContain('てもいい');
  });

  // Regressiya: te-shakl ulanish nuqtasida jaranglashadi (食べて… ↔ 読んで…),
  // shuning uchun oddiy substring qidiruvi misollarning katta qismini topa olmasdi.
  it('jarangli te-shaklni ham topadi (読ん+でもいい)', () => {
    const { text, masked } = maskSentence('本を読んでもいいですか。', '〜てもいい');
    expect(masked).toBe(true);
    // 読ん — fe'l o'zagi, joyida qoladi; faqat でもいい bekitiladi.
    expect(text).toBe('本を読ん＿＿ですか。');
  });

  it('jarangli ta-shaklni ham topadi (読ん+だことがある)', () => {
    const { masked } = maskSentence('その本を読んだことがある。', '〜たことがある');
    expect(masked).toBe(true);
  });

  it('gapdagi barcha uchrashuvni bekitadi', () => {
    const { text } = maskSentence('食べてもいいし、飲んでもいい。', '～てもいい');
    expect(text.split('＿＿')).toHaveLength(3);
  });

  it('topilmasa asl gapni qaytaradi', () => {
    const { text, masked } = maskSentence('全然わかりません。', '〜てもいい');
    expect(masked).toBe(false);
    expect(text).toBe('全然わかりません。');
  });

  it('bo‘sh qiymatlar bilan yiqilmaydi', () => {
    expect(maskSentence(null, '〜た').masked).toBe(false);
    expect(maskSentence('文', null).masked).toBe(false);
  });
});

describe('buildGrammarQuestions', () => {
  /** @type {import('../types/models').Grammar} */
  const grammar = {
    id: 'g1', title: '〜てもいい', level: 'N5',
    examples: [
      { japanese: '本を読んでもいいですか。', reading: 'ほんをよんでも…', meaning: 'Kitob o‘qisam bo‘ladimi?' },
      { japanese: 'ここに座ってもいいです。', meaning: 'Bu yerga o‘tirsa bo‘ladi.' },
      { japanese: '帰ってもいいよ。', meaning: 'Uyga ketsang bo‘ladi.' },
    ],
  };
  const siblings = ['〜なければならない', '〜たことがある', '〜ながら', '〜てはいけない', '〜てもいい'];

  it('har bir misoldan savol quradi', () => {
    expect(buildGrammarQuestions(grammar, siblings)).toHaveLength(3);
  });

  it('savollar to‘g‘ri tuzilgan', () => {
    for (const q of buildGrammarQuestions(grammar, siblings)) {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.answer);
      expect(q.answer).toBe('〜てもいい');
      expect(new Set(q.options).size).toBe(4);
      // O'zi o'ziga chalg'ituvchi bo'lmasligi kerak
      expect(q.options.filter(o => o === '〜てもいい')).toHaveLength(1);
      expect(q.masked).toBe(true);
      expect(q.sentence).toContain('＿＿');
    }
  });

  it('savollar soni 5 tadan oshmaydi', () => {
    const many = {
      id: 'g', title: '〜た',
      examples: Array.from({ length: 9 }, (_, i) => ({ japanese: `文${i}を見た。` })),
    };
    expect(buildGrammarQuestions(many, siblings)).toHaveLength(5);
  });

  describe('ma’lumot yetarli bo‘lmaganda test taklif qilinmaydi', () => {
    it('chalg‘ituvchilar 2 tadan kam', () => {
      expect(buildGrammarQuestions(grammar, ['〜ながら'])).toEqual([]);
    });

    it('yagona "sibling" — o‘zi', () => {
      expect(buildGrammarQuestions(grammar, ['〜てもいい'])).toEqual([]);
    });

    it('misollar yo‘q', () => {
      expect(buildGrammarQuestions({ id: 'g', title: 'x', examples: [] }, siblings)).toEqual([]);
    });

    it('grammatika null', () => {
      expect(buildGrammarQuestions(null, siblings)).toEqual([]);
    });

    it('misolda yapon gapi yo‘q', () => {
      // Ataylab noto'g'ri shakl — funksiya bunday misollarni filtrlashi kerak.
      // @ts-expect-error — `japanese` yo'q (test maqsadi shu)
      expect(buildGrammarQuestions({ id: 'g', title: '〜た', examples: [{ meaning: 'x' }] }, siblings)).toEqual([]);
    });
  });
});
