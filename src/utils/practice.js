// Mashq (quiz) uchun umumiy, UI'siz mantiq — sof funksiyalar, test qilish oson.
// Kana testi, grammatika mini testi va o'yinlar shu yerdan foydalanadi.
// Testlar: practice.test.js (`npm test`).

/**
 * @typedef {import('../types/models').Grammar} Grammar
 * @typedef {import('../types/models').GrammarQuestion} GrammarQuestion
 */

/**
 * Darsga bog'liq bo'lmagan mashqlar uchun sentinel LessonId.
 * Server LessonId'ni ishlatmaydi, lekin validator uni NotEmpty talab qiladi
 * (qarang: POST /exercises/result, §11.2).
 * @type {string}
 */
export const GAME_LESSON_ID = '11111111-1111-1111-1111-111111111111';

/**
 * Massivni nusxalab aralashtiradi (Fisher–Yates) — asl massiv o'zgarmaydi.
 * @template T
 * @param {readonly T[] | null | undefined} list
 * @returns {T[]}
 */
export function shuffle(list) {
  const out = [...(list || [])];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Ko'p variantli savol uchun javoblarni quradi: to'g'ri javob + `pool`dan
 * takrorlanmaydigan chalg'ituvchilar. Natija aralashtirilgan holda qaytadi.
 *
 * @param {string} correct  To'g'ri javob
 * @param {readonly (string | null | undefined)[]} pool
 *        Chalg'ituvchilar manbasi (to'g'ri javobning o'zi bo'lsa — filtrlanadi)
 * @param {number} [count=4] Umumiy variantlar soni
 * @returns {string[]} Kamida 1 ta (pool bo'sh bo'lsa), ko'pi bilan `count` ta variant
 */
export function buildChoices(correct, pool, count = 4) {
  const seen = new Set([correct]);
  /** @type {string[]} */
  const distractors = [];
  for (const item of shuffle(pool)) {
    if (distractors.length >= count - 1) break;
    if (item == null || seen.has(item)) continue;
    seen.add(item);
    distractors.push(item);
  }
  return shuffle([correct, ...distractors]);
}

/**
 * To'g'ri javoblar ulushi (0–100, butun son).
 * @param {number} correct
 * @param {number} total
 * @returns {number}
 */
export function accuracyPercent(correct, total) {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

// ── Grammatika mini testi ──────────────────────────────────────────────

const GRAMMAR_MAX_QUESTIONS = 5;
const BLANK = '＿＿';

/**
 * "〜てもいい" / "～ます" kabi nomlardagi tilda belgisi gapga mos kelmaydi.
 * @param {string | null | undefined} s
 * @returns {string}
 */
const stripTilde = (s) => (s || '').replace(/[〜~～]/g, '').trim();

// Te/ta-shakl ulanish nuqtasida jaranglashadi: 食べ|てもいい ↔ 読ん|でもいい,
// 見|た ↔ 読ん|だ. Shu sababli grammatika nomini gapdan to'g'ridan-to'g'ri
// qidirish ko'p hollarda topa olmaydi — birinchi bo'g'inni ikkala variantga moslaymiz.
/** @type {Record<string, string | undefined>} */
const VOICING_ALT = { 'て': '[てで]', 'で': '[てで]', 'た': '[ただ]', 'だ': '[ただ]' };

/**
 * Grammatika nomidan qidiruv shablonini quradi (jaranglilikni hisobga olib).
 * @param {string} needle
 * @returns {RegExp}
 */
function needlePattern(needle) {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // て/で/た/だ regexp uchun maxsus belgi emas — escaped[0] === needle[0], slice(1) xavfsiz.
  const alt = VOICING_ALT[needle[0]];
  return new RegExp(alt ? alt + escaped.slice(1) : escaped, 'g');
}

/**
 * Misol gapda grammatika nuqtasini bo'sh joy bilan almashtiradi (topilmasa — asl gap).
 * @param {string | null | undefined} sentence
 * @param {string | null | undefined} title
 * @returns {{ text: string, masked: boolean }}
 */
export function maskSentence(sentence, title) {
  const needle = stripTilde(title);
  if (!needle || !sentence) return { text: sentence || '', masked: false };
  const text = sentence.replace(needlePattern(needle), BLANK);
  return text === sentence ? { text: sentence, masked: false } : { text, masked: true };
}

/**
 * Grammatika mini testi savollarini quradi — dars misollaridan, chalg'ituvchilar
 * sifatida bir xil darajadagi boshqa grammatika nomlaridan foydalanadi.
 * Ma'lumot yetarli bo'lmasa bo'sh massiv qaytadi (test ko'rsatilmaydi).
 *
 * @param {Partial<Grammar> | null | undefined} grammar
 *        Faqat `title` va `examples` o'qiladi — to'liq Grammar shart emas.
 * @param {readonly (string | null | undefined)[]} [siblingTitles]
 *        Bir xil darajadagi boshqa grammatika nomlari
 * @param {number} [optionCount=4] Variantlar soni
 * @returns {GrammarQuestion[]}
 */
export function buildGrammarQuestions(grammar, siblingTitles = [], optionCount = 4) {
  const examples = (grammar?.examples || []).filter(ex => ex?.japanese);
  if (examples.length === 0 || !grammar?.title) return [];

  const title = grammar.title;
  const distractors = siblingTitles.filter(
    /** @returns {t is string} */
    (t) => !!t && t !== title
  );
  if (distractors.length < 2) return [];   // 3 tadan kam variantli test — ma'nosiz

  return shuffle(examples).slice(0, GRAMMAR_MAX_QUESTIONS).map(ex => {
    const { text, masked } = maskSentence(ex.japanese, title);
    return {
      sentence: text,
      masked,
      reading: ex.reading,
      meaning: ex.meaning,
      answer: title,
      options: buildChoices(title, distractors, optionCount),
    };
  });
}
