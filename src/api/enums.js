// Enum maps — from API_REFERENCE_FULL.md §21.
// RULE (§2.2): request BODY enums must be sent as int; query/route params use the name.
// Some responses return the enum as int (JlptLevel, TestSection, LeagueTier, language…),
// others as string — normalize at the edges.

export const LearningItemType = { Vocabulary: 0, Kanji: 1, Grammar: 2, Reading: 3, Listening: 4, Kana: 5 };
export const AppLanguage = { Uzbek: 0, English: 1, Russian: 2 };
export const PaymentProvider = { AppStore: 0, GooglePlay: 1, Payme: 2, Click: 3 };
export const DevicePlatform = { Android: 0, Ios: 1 };
export const LeagueTier = { Bronze: 0, Silver: 1, Gold: 2, Platinum: 3, Diamond: 4 };
export const TestSection = { Vocabulary: 0, Grammar: 1, Reading: 2, Listening: 3 };

// TestSection int -> o'zbekcha yorliq (mock test bo'limlari)
/** @type {Record<number, string>} */
export const TestSectionLabels = { 0: "Lug'at", 1: 'Grammatika', 2: "O'qish", 3: 'Tinglash' };

/**
 * TestSection qiymatini (int yoki nom) o'zbekcha yorliqqa o'giradi.
 * @param {number | string | null | undefined} value
 * @returns {string}
 */
export function sectionLabel(value) {
  if (typeof value === 'number') return TestSectionLabels[value] || "Lug'at";
  if (value == null) return "Lug'at";
  const int = TestSection[/** @type {keyof typeof TestSection} */ (value)];
  return TestSectionLabels[int] ?? value ?? "Lug'at";
}

// JlptLevel is REVERSED (§2.2): N5=5 … N1=1
export const JlptLevelToInt = { N5: 5, N4: 4, N3: 3, N2: 2, N1: 1 };
/** @type {Record<number, import('../types/models').JlptLevelName>} */
export const JlptIntToName = { 5: 'N5', 4: 'N4', 3: 'N3', 2: 'N2', 1: 'N1' };

// UI language code (uz/en/ru) <-> AppLanguage int
export const LangCodeToInt = { uz: 0, en: 1, ru: 2 };
/** @type {Record<number, import('../types/models').LangCode>} */
export const LangIntToCode = { 0: 'uz', 1: 'en', 2: 'ru' };

/**
 * Coerce an enum value to its int for a request body.
 * Accepts an int (passed through), or a case-insensitive name ("Vocabulary", "vocabulary").
 *
 * @param {Record<string, number>} map Enum xaritasi (masalan `LearningItemType`)
 * @param {number | string | null | undefined} value
 * @param {number} [fallback] Topilmasa qaytariladigan qiymat
 * @returns {number | undefined}
 */
export function toEnumInt(map, value, fallback = undefined) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') return value;
  const key = Object.keys(map).find(k => k.toLowerCase() === String(value).toLowerCase());
  return key !== undefined ? map[key] : fallback;
}

/**
 * JlptLevel response value (int or name) -> display name ("N5").
 * @param {number | string | null | undefined} value
 * @returns {import('../types/models').JlptLevelName}
 */
export function jlptName(value) {
  if (value === null || value === undefined) return 'N5';
  if (typeof value === 'number') return JlptIntToName[value] || 'N5';
  // Nomlar bo'yicha tekshiramiz — noma'lum qiymat UI'ga o'tib ketmasin
  // (int tarmog'idagi 'N5' fallback bilan bir xil mantiq).
  return value in JlptLevelToInt
    ? /** @type {import('../types/models').JlptLevelName} */ (value)
    : 'N5';
}
