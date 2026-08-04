/**
 * SenpaiJLPT domen modellari.
 *
 * Bu maydonlar backend DTO'laridan olingan (API_REFERENCE_FULL.md) va
 * frontend'da haqiqatda ishlatilayotgan nomlarga mos. Yangi endpoint qo'shilsa,
 * shu yerga model qo'shing — shunda `npm run typecheck` chaqiruv joylarini tekshiradi.
 *
 * ESLATMA (§2.2): so'rov BODY'sida enum'lar RAQAM, query/route'da NOM.
 * Javoblarda aralash keladi — shuning uchun ko'p joyda `number | string`.
 */

/** JLPT darajasi nomi. Backend int'i teskari: N5=5 … N1=1 (qarang: api/enums.js). */
export type JlptLevelName = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

/** Javoblarda daraja int yoki nom sifatida kelishi mumkin. */
export type JlptLevelValue = JlptLevelName | number;

/** /exercises/result uchun ruxsat etilgan mashq turlari (server validatori whitelist'i). */
export type ExerciseType =
  | 'MultipleChoice' | 'FillInBlank' | 'Matching' | 'Listening' | 'Reading';

/** O'rganish birligi turi. Body'da int (LearningItemType), answers[] ichida matn. */
export type LearningItemTypeName =
  | 'Vocabulary' | 'Kanji' | 'Grammar' | 'Reading' | 'Listening' | 'Kana';

export type UserRole = 'Student' | 'Admin' | 'SuperAdmin';

/** Interfeys tili. */
export type LangCode = 'uz' | 'en' | 'ru';

/** Audio ovozi (R2'dagi {word}_b.mp3 / _g.mp3). */
export type VoiceId = 'boy' | 'girl';

// ── Foydalanuvchi ──────────────────────────────────────────────────────

/**
 * AuthContext birlashtirgan foydalanuvchi shakli — login javobi (AuthResponseDto),
 * /auth/me (UserStatsDto) va /profile/stats'dan yig'iladi.
 */
export interface User {
  id: string | null;
  fullName: string;
  username: string;
  bio: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  currentLevel: JlptLevelName;
  xp: number;
  coins: number;
  currentStreak: number;
  streakDays: number;
  vocabLearned: number;
  kanjiLearned: number;
  grammarLearned: number;
  tier: string;
  plan: string;
  dueReviewCount: number;
  referralCode: string | null;
  isEmailVerified: boolean;
  requiresPhoneVerification: boolean;
}

// ── Lug'at ─────────────────────────────────────────────────────────────

export interface VocabularyExample {
  japanese: string;
  reading?: string;
  meaning?: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  reading?: string;
  romaji?: string;
  /** Inglizcha ma'nolar — har doim to'ldirilgan. */
  meanings?: string[];
  /** O'zbekcha ma'nolar — N5'da bor, N4–N1'da hozircha bo'sh (UI inglizchaga qaytadi). */
  meaningsUz?: string[];
  level?: JlptLevelValue;
  wordType?: string;
  wordTypeUz?: string;
  isLearned?: boolean;
  examples?: VocabularyExample[];
  kanjiBreakdown?: unknown[];
  usedKanji?: unknown[];
}

export interface Kanji {
  id: string;
  character: string;
  onyomi?: string[] | string;
  kunyomi?: string[] | string;
  meaning?: string;
  meaningUz?: string;
  jlptLevel?: JlptLevelValue;
  strokeCount?: number;
  strokeOrderUrl?: string | null;
  examples?: VocabularyExample[];
  isLearned?: boolean;
}

/** Bitta kana belgisi (§7.1–7.3). */
export interface KanaCharacter {
  id: string;
  character: string;
  romaji: string;
  order?: number;
  strokeOrderUrl?: string | null;
  audioUrl?: string | null;
}

export interface KanaRow {
  rowGroup: string;
  characters: KanaCharacter[];
}

/** GET /kana/hiragana | /kana/katakana javobi. */
export interface KanaList {
  type?: string;
  rows: KanaRow[];
}

export interface GrammarExample {
  japanese: string;
  reading?: string;
  meaning?: string;
}

export interface Grammar {
  id: string;
  title: string;
  level: JlptLevelValue;
  explanation?: string;
  structure?: string;
  examples?: GrammarExample[];
  notes?: string[];
}

/** GET /dictionary/search javobi. */
export interface DictionarySearchResult {
  vocabulary: Vocabulary[];
  kanji: Kanji[];
  grammar: Grammar[];
}

// ── Mashq / natija ─────────────────────────────────────────────────────

/** /exercises/result body'sidagi bitta javob. */
export interface ExerciseAnswer {
  itemId: string;
  itemType: LearningItemTypeName;
  isCorrect: boolean;
}

/** POST /exercises/result so'rovi. */
export interface ExerciseResultRequest {
  /** Darsga bog'liq bo'lmagan mashqlar uchun GAME_LESSON_ID (validator NotEmpty talab qiladi). */
  lessonId: string;
  exerciseType: ExerciseType;
  answers: ExerciseAnswer[];
  timeSpentSeconds: number;
}

/** POST /exercises/result javobi. Maydonlar mashq turiga qarab kelmasligi mumkin. */
export interface ExerciseResultResponse {
  xpEarned?: number;
  score?: number;
  learned?: number;
  justLearned?: unknown;
  previousBest?: number;
  /** Server bilan aloqa bo'lmaganda klient qo'yadigan bayroq (backend qaytarmaydi). */
  localOnly?: boolean;
}

// ── Test (quiz) savollari — utils/practice.js ──────────────────────────

/** Grammatika mini testining bitta savoli. */
export interface GrammarQuestion {
  /** Grammatika nuqtasi ＿＿ bilan bekitilgan gap (bekitilmagan bo'lishi ham mumkin). */
  sentence: string;
  /** Gapda grammatika nuqtasi topilib bekitildimi. */
  masked: boolean;
  reading?: string;
  meaning?: string;
  /** To'g'ri javob — grammatikaning o'z nomi. */
  answer: string;
  options: string[];
}
