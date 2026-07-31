import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import OfflineBanner from './components/OfflineBanner';
import RateLimitOverlay from './components/RateLimitOverlay';
import ScrollToTop from './components/ScrollToTop';
import PageLoader from './components/PageLoader';

// Entry & public pages — eager for instant first paint
import Splash from './pages/auth/Splash';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import ForSchools from './pages/public/ForSchools';
import ForDevelopers from './pages/public/ForDevelopers';
import Partnership from './pages/public/Partnership';
import InfoPage, { INFO_SLUGS } from './pages/public/InfoPage';

// Everything behind auth is code-split into its own chunk (loaded on demand)
const Onboarding = lazy(() => import('./pages/auth/Onboarding'));
const PlacementTest = lazy(() => import('./pages/auth/PlacementTest'));
const GoalSetup = lazy(() => import('./pages/auth/GoalSetup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LessonsList = lazy(() => import('./pages/lessons/LessonsList'));
const LessonDetail = lazy(() => import('./pages/lessons/LessonDetail'));
const Roadmap = lazy(() => import('./pages/lessons/Roadmap'));
const HiraganaTable = lazy(() => import('./pages/lessons/HiraganaTable'));
const GrammarExplanation = lazy(() => import('./pages/lessons/GrammarExplanation'));
const LevelComplete = lazy(() => import('./pages/lessons/LevelComplete'));
const LessonResults = lazy(() => import('./pages/lessons/LessonResults'));
const ListeningExercise = lazy(() => import('./pages/exercises/ListeningExercise'));
const FillBlank = lazy(() => import('./pages/exercises/FillBlank'));
const WordMatching = lazy(() => import('./pages/exercises/WordMatching'));
const Pronunciation = lazy(() => import('./pages/exercises/Pronunciation'));
const PronunciationPractice = lazy(() => import('./pages/exercises/PronunciationPractice'));
const KanjiWriting = lazy(() => import('./pages/exercises/KanjiWriting'));
const KanjiStrokeViewer = lazy(() => import('./pages/exercises/KanjiStrokeViewer'));
const GamesHub = lazy(() => import('./pages/games/GamesHub'));
const KanaNinja = lazy(() => import('./pages/games/KanaNinja'));
const ReadingReview = lazy(() => import('./pages/games/ReadingReview'));
const GrammarGame = lazy(() => import('./pages/games/GrammarGame'));
const SrsReview = lazy(() => import('./pages/review/SrsReview'));
const ReviewForecast = lazy(() => import('./pages/review/ReviewForecast'));
const WeakWords = lazy(() => import('./pages/review/WeakWords'));
const FlashcardPractice = lazy(() => import('./pages/review/FlashcardPractice'));
const JlptMockTest = lazy(() => import('./pages/review/JlptMockTest'));
const Dictionary = lazy(() => import('./pages/dictionary/Dictionary'));
const WordDetail = lazy(() => import('./pages/dictionary/WordDetail'));
const KanjiList = lazy(() => import('./pages/dictionary/KanjiList'));
const KanjiDetail = lazy(() => import('./pages/dictionary/KanjiDetail'));
const SavedItems = lazy(() => import('./pages/dictionary/SavedItems'));
const Leaderboard = lazy(() => import('./pages/gamification/Leaderboard'));
const Leagues = lazy(() => import('./pages/gamification/Leagues'));
const DailyQuests = lazy(() => import('./pages/gamification/DailyQuests'));
const Achievements = lazy(() => import('./pages/gamification/Achievements'));
const Friends = lazy(() => import('./pages/gamification/Friends'));
const FriendProfile = lazy(() => import('./pages/gamification/FriendProfile'));
const Referral = lazy(() => import('./pages/gamification/Referral'));
const StudyGroups = lazy(() => import('./pages/gamification/StudyGroups'));
const StudyGroupDetail = lazy(() => import('./pages/gamification/StudyGroupDetail'));
const Shop = lazy(() => import('./pages/shop/Shop'));
const MascotCustomize = lazy(() => import('./pages/shop/MascotCustomize'));
const Premium = lazy(() => import('./pages/shop/Premium'));
const SubscriptionManage = lazy(() => import('./pages/shop/SubscriptionManage'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const ProfileEdit = lazy(() => import('./pages/profile/ProfileEdit'));
const SettingsPage = lazy(() => import('./pages/profile/Settings'));
const Notifications = lazy(() => import('./pages/profile/Notifications'));
const HelpFaq = lazy(() => import('./pages/profile/HelpFaq'));
const Permissions = lazy(() => import('./pages/profile/Permissions'));
const PodcastList = lazy(() => import('./pages/listening/PodcastList'));
const PodcastDetail = lazy(() => import('./pages/listening/PodcastDetail'));
const EpisodePlayer = lazy(() => import('./pages/listening/EpisodePlayer'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminVocabulary = lazy(() => import('./pages/admin/AdminVocabulary'));
const AdminKanji = lazy(() => import('./pages/admin/AdminKanji'));
const AdminGrammar = lazy(() => import('./pages/admin/AdminGrammar'));
const AdminLessons = lazy(() => import('./pages/admin/AdminLessons'));
const AdminShopItems = lazy(() => import('./pages/admin/AdminShopItems'));
const AdminFaq = lazy(() => import('./pages/admin/AdminFaq'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAchievements = lazy(() => import('./pages/admin/AdminAchievements'));
const AdminSubscriptionPlans = lazy(() => import('./pages/admin/AdminSubscriptionPlans'));
const AdminPodcasts = lazy(() => import('./pages/admin/AdminPodcasts'));
const AdminMockTests = lazy(() => import('./pages/admin/AdminMockTests'));
const AdminStudyGroups = lazy(() => import('./pages/admin/AdminStudyGroups'));
const AdminDailyQuests = lazy(() => import('./pages/admin/AdminDailyQuests'));

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';
  const homePath = isAdmin ? '/admin' : '/dashboard';

  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/splash" element={<Splash />} />
      <Route path="/login" element={user ? <Navigate to={homePath} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={homePath} /> : <Register />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/placement-test" element={<PlacementTest />} />
      <Route path="/goal-setup" element={<GoalSetup />} />

      {/* Public landing at root — logged-in users go straight to their home */}
      <Route path="/" element={user ? <Navigate to={homePath} replace /> : <Landing />} />

      {/* Ochiq marketing/huquqiy sahifalar (footer havolalari) */}
      <Route path="/for-schools" element={<ForSchools />} />
      <Route path="/for-developers" element={<ForDevelopers />} />
      <Route path="/partnership" element={<Partnership />} />
      {INFO_SLUGS.map(slug => (
        <Route key={slug} path={`/${slug}`} element={<InfoPage slug={slug} />} />
      ))}

      {/* App shell — protected */}
      <Route element={
        <ProtectedRoute><Layout /></ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="lessons" element={<LessonsList />} />
        <Route path="lessons/:id" element={<LessonDetail />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="hiragana" element={<HiraganaTable />} />
        <Route path="grammar/:id" element={<GrammarExplanation />} />
        <Route path="exercise/listening/:id" element={<ListeningExercise />} />
        <Route path="exercise/fill-blank/:id" element={<FillBlank />} />
        <Route path="exercise/matching/:id" element={<WordMatching />} />
        <Route path="exercise/pronunciation/:id" element={<Pronunciation />} />
        <Route path="review" element={<SrsReview />} />
        <Route path="review/forecast" element={<ReviewForecast />} />
        <Route path="review/weak-words" element={<WeakWords />} />
        <Route path="review/flashcards" element={<FlashcardPractice />} />
        <Route path="games" element={<GamesHub />} />
        <Route path="games/kana-ninja" element={<KanaNinja />} />
        <Route path="games/reading" element={<ReadingReview />} />
        <Route path="games/grammar" element={<GrammarGame />} />
        <Route path="mock-test" element={<JlptMockTest />} />
        <Route path="pronunciation" element={<PronunciationPractice />} />
        <Route path="dictionary" element={<Dictionary />} />
        <Route path="word/:id" element={<WordDetail />} />
        <Route path="kanji" element={<KanjiList />} />
        <Route path="saved" element={<SavedItems />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="leagues" element={<Leagues />} />
        <Route path="daily-quests" element={<DailyQuests />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="friends" element={<Friends />} />
        <Route path="friends/:id" element={<FriendProfile />} />
        <Route path="referral" element={<Referral />} />
        <Route path="study-groups" element={<StudyGroups />} />
        <Route path="study-groups/:id" element={<StudyGroupDetail />} />
        <Route path="podcasts" element={<PodcastList />} />
        <Route path="podcasts/:id" element={<PodcastDetail />} />
        <Route path="podcasts/episodes/:id" element={<EpisodePlayer />} />
        <Route path="shop" element={<Shop />} />
        <Route path="mascot" element={<MascotCustomize />} />
        <Route path="premium" element={<Premium />} />
        <Route path="subscription" element={<SubscriptionManage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/edit" element={<ProfileEdit />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="help" element={<HelpFaq />} />
        <Route path="kanji/:id" element={<KanjiDetail />} />
        <Route path="kanji-writing/:id" element={<KanjiWriting />} />
        <Route path="kanji-stroke/:id" element={<KanjiStrokeViewer />} />
        <Route path="level-complete" element={<LevelComplete />} />
        <Route path="lesson-results" element={<LessonResults />} />
        <Route path="permissions" element={<Permissions />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/vocabulary" element={<AdminVocabulary />} />
        <Route path="admin/kanji" element={<AdminKanji />} />
        <Route path="admin/grammar" element={<AdminGrammar />} />
        <Route path="admin/lessons" element={<AdminLessons />} />
        <Route path="admin/shop-items" element={<AdminShopItems />} />
        <Route path="admin/faq" element={<AdminFaq />} />
        <Route path="admin/users" element={<AdminUsers />} />
        <Route path="admin/achievements" element={<AdminAchievements />} />
        <Route path="admin/subscription-plans" element={<AdminSubscriptionPlans />} />
        <Route path="admin/podcasts" element={<AdminPodcasts />} />
        <Route path="admin/mock-tests" element={<AdminMockTests />} />
        <Route path="admin/study-groups" element={<AdminStudyGroups />} />
        <Route path="admin/daily-quests" element={<AdminDailyQuests />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
              <ToastProvider>
                <OfflineBanner />
                <RateLimitOverlay />
                <AppRoutes />
              </ToastProvider>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
