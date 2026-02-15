import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { getFlashcardsByTopic } from './data/api';
import { Database } from './types/database.types';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import type { User } from '@supabase/supabase-js';

// Layout Components (loaded eagerly - always visible)
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Lazy-loaded Page Components (code splitting)
const HomePage = lazy(() => import('./components/HomePage').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() =>
  import('./components/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const AdminPage = lazy(() =>
  import('./components/AdminPage').then((m) => ({ default: m.AdminPage }))
);
const BlogList = lazy(() => import('./components/BlogList').then((m) => ({ default: m.BlogList })));
const BlogPost = lazy(() => import('./components/BlogPost').then((m) => ({ default: m.BlogPost })));
const FlashcardPractice = lazy(() =>
  import('./components/FlashcardPractice').then((m) => ({ default: m.FlashcardPractice }))
);
const AuthPage = lazy(() => import('./components/AuthPage').then((m) => ({ default: m.AuthPage })));
const Dashboard = lazy(() =>
  import('./components/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const LearningPathView = lazy(() =>
  import('./components/LearningPathView').then((m) => ({ default: m.LearningPathView }))
);
const LearningPathList = lazy(() =>
  import('./components/LearningPathList').then((m) => ({ default: m.LearningPathList }))
);
const PracticeHub = lazy(() =>
  import('./components/PracticeHub').then((m) => ({ default: m.PracticeHub }))
);
const CheatSheetList = lazy(() =>
  import('./components/CheatSheetList').then((m) => ({ default: m.CheatSheetList }))
);
const CheatSheetView = lazy(() =>
  import('./components/CheatSheetView').then((m) => ({ default: m.CheatSheetView }))
);
const QuizHub = lazy(() => import('./components/QuizHub').then((m) => ({ default: m.QuizHub })));

// PWA Components
import { PWAInstallPrompt, IOSInstallHint } from './components/PWAInstallPrompt';

type Flashcard = Database['public']['Tables']['flashcards']['Row'];

// Loading Spinner for lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const PageTransition = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

// Wrapper components that extract route params
function PracticeWrapper({
  practiceCards,
  currentTopicTitle,
  isLoadingCards,
  handleStartPractice,
}: {
  practiceCards: Flashcard[];
  currentTopicTitle: string;
  isLoadingCards: boolean;
  handleStartPractice: (slug: string, title: string) => void;
}) {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug && practiceCards.length === 0 && !isLoadingCards) {
      const title = slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      handleStartPractice(slug, title);
    }
  }, [slug]);

  if (isLoadingCards) return <PageLoader />;

  return (
    <PageTransition key="practice">
      <Suspense fallback={<PageLoader />}>
        <FlashcardPractice
          topicTitle={currentTopicTitle}
          topicSlug={slug}
          flashcards={practiceCards}
          onExit={() => navigate('/')}
          onComplete={() => {}}
        />
      </Suspense>
    </PageTransition>
  );
}

function PathsWrapper({ user }: { user: User | null }) {
  const { pathSlug } = useParams();
  const navigate = useNavigate();

  if (pathSlug) {
    return (
      <PageTransition key="path-view">
        <Suspense fallback={<PageLoader />}>
          <LearningPathView
            pathSlug={pathSlug}
            userId={user?.id || ''}
            onBack={() => navigate('/paths')}
            onNodeClick={(slug) => navigate(`/practice/${slug}`)}
          />
        </Suspense>
      </PageTransition>
    );
  }

  return (
    <PageTransition key="path-list">
      <Suspense fallback={<PageLoader />}>
        <LearningPathList
          onPathSelect={(slug) => {
            navigate(`/paths/${slug}`);
            window.scrollTo(0, 0);
          }}
        />
      </Suspense>
    </PageTransition>
  );
}

function App() {
  const { user, isAdmin, signOut } = useAuth();
  const [currentTopicTitle, setCurrentTopicTitle] = useState('');
  const [practiceCards, setPracticeCards] = useState<Flashcard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Universal navigate handler for components that still use onNavigate pattern
  const handleStartPractice = useCallback(
    async (topicSlug: string, topicTitle: string) => {
      setIsLoadingCards(true);
      setCurrentTopicTitle(topicTitle);
      const cards = await getFlashcardsByTopic(topicSlug);
      setPracticeCards(cards as Flashcard[]);
      setIsLoadingCards(false);
      navigate(`/practice/${topicSlug}`);
    },
    [navigate]
  );

  const handleNavigate = useCallback(
    (page: string, data?: Record<string, string>) => {
      if (page === 'admin') {
        if (!user || !isAdmin) {
          alert('⛔ Access Denied! Admins only.');
          return;
        }
      }

      const routeMap: Record<string, string> = {
        home: '/',
        blog: '/blog',
        about: '/about',
        auth: '/auth',
        dashboard: '/dashboard',
        admin: '/admin',
        paths: '/paths',
      };

      if (page === 'paths' && data?.selectedPath) {
        navigate(`/paths/${data.selectedPath}`);
      } else if (page === 'blog-post' && data?.slug) {
        navigate(`/blog/${data.slug}`);
      } else if (page === 'cheatsheets') {
        navigate('/cheatsheets');
      } else if (page === 'quiz' && data?.slug) {
        navigate(`/quiz/${data.slug}`);
      } else if (page === 'all-practice') {
        navigate('/practice');
      } else if (page === 'practice' && data?.slug) {
        handleStartPractice(data.slug, data.title || 'Practice');
      } else {
        navigate(routeMap[page] || '/');
      }
      window.scrollTo(0, 0);
    },
    [user, isAdmin, navigate, handleStartPractice]
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  // Derive currentPage from location for Header active state
  const getCurrentPage = (): string => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/practice') return 'all-practice';
    if (path.startsWith('/practice/')) return 'practice';
    if (path.startsWith('/quiz/')) return 'practice';
    if (path.startsWith('/cheatsheets')) return 'cheatsheets';
    if (path.startsWith('/paths')) return 'paths';
    if (path.startsWith('/blog')) return 'blog';
    if (path.startsWith('/about')) return 'about';
    if (path.startsWith('/auth')) return 'auth';
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/admin')) return 'admin';
    return 'home';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white flex flex-col font-sans">
      <Header
        currentPage={getCurrentPage()}
        isAuthenticated={!!user}
        isAdmin={isAdmin}
        onNavigate={handleNavigate}
      />

      <main id="main-content" className="flex-grow relative" role="main" aria-label="Page content">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route
                  path="/"
                  element={
                    <PageTransition key="home">
                      <HomePage onNavigate={handleNavigate} isAuthenticated={!!user} />
                    </PageTransition>
                  }
                />

                <Route
                  path="/about"
                  element={
                    <PageTransition key="about">
                      <AboutPage />
                    </PageTransition>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <AdminRoute user={user}>
                      <PageTransition key="admin">
                        <AdminPage />
                      </PageTransition>
                    </AdminRoute>
                  }
                />

                <Route
                  path="/paths"
                  element={
                    <PageTransition key="path-list">
                      <PathsWrapper user={user} />
                    </PageTransition>
                  }
                />
                <Route
                  path="/paths/:pathSlug"
                  element={
                    <PageTransition key="path-view">
                      <PathsWrapper user={user} />
                    </PageTransition>
                  }
                />

                <Route
                  path="/blog"
                  element={
                    <PageTransition key="blog-list">
                      <BlogList onNavigate={handleNavigate} />
                    </PageTransition>
                  }
                />

                <Route
                  path="/blog/:slug"
                  element={
                    <PageTransition key="blog-post">
                      <BlogPostWrapper />
                    </PageTransition>
                  }
                />

                <Route
                  path="/auth"
                  element={
                    <PageTransition key="auth">
                      <AuthPage onAuthenticated={() => navigate('/')} onNavigate={handleNavigate} />
                    </PageTransition>
                  }
                />

                <Route
                  path="/cheatsheets"
                  element={
                    <PageTransition key="cheatsheet-list">
                      <Suspense fallback={<PageLoader />}>
                        <CheatSheetList
                          onSelect={(slug) => {
                            navigate(`/cheatsheets/${slug}`);
                            window.scrollTo(0, 0);
                          }}
                        />
                      </Suspense>
                    </PageTransition>
                  }
                />

                <Route
                  path="/cheatsheets/:slug"
                  element={
                    <PageTransition key="cheatsheet-view">
                      <Suspense fallback={<PageLoader />}>
                        <CheatSheetViewWrapper />
                      </Suspense>
                    </PageTransition>
                  }
                />

                <Route
                  path="/practice"
                  element={
                    <PageTransition key="practice-hub">
                      <Suspense fallback={<PageLoader />}>
                        <PracticeHub
                          onChapterClick={(slug, title) => handleStartPractice(slug, title)}
                        />
                      </Suspense>
                    </PageTransition>
                  }
                />

                <Route
                  path="/practice/:slug"
                  element={
                    <ProtectedRoute user={user} redirectTo="/auth">
                      <PracticeWrapper
                        practiceCards={practiceCards}
                        currentTopicTitle={currentTopicTitle}
                        isLoadingCards={isLoadingCards}
                        handleStartPractice={handleStartPractice}
                      />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/quiz/:slug"
                  element={
                    <ProtectedRoute user={user} redirectTo="/auth">
                      <PageTransition key="quiz-hub">
                        <Suspense fallback={<PageLoader />}>
                          <QuizHub />
                        </Suspense>
                      </PageTransition>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute user={user} redirectTo="/auth">
                      <PageTransition key="dashboard">
                        <Dashboard
                          user={user!}
                          onNavigate={handleNavigate}
                          onSignOut={handleSignOut}
                        />
                      </PageTransition>
                    </ProtectedRoute>
                  }
                />

                {/* 404 fallback */}
                <Route
                  path="*"
                  element={
                    <PageTransition key="404">
                      <div className="flex items-center justify-center min-h-[60vh] text-center">
                        <div>
                          <h1 className="text-6xl font-bold text-purple-600 mb-4">404</h1>
                          <p className="text-xl text-muted-foreground mb-6">Page not found</p>
                          <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Go Home
                          </button>
                        </div>
                      </div>
                    </PageTransition>
                  }
                />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </main>

      {['/', '/about', '/paths', '/blog', '/practice', '/cheatsheets'].includes(
        location.pathname
      ) ||
      location.pathname.startsWith('/blog/') ||
      location.pathname.startsWith('/cheatsheets/') ? (
        <Footer onNavigate={handleNavigate} />
      ) : null}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      <IOSInstallHint />
    </div>
  );
}

// Small wrapper for blog post route
function BlogPostWrapper() {
  const { slug } = useParams();
  const navigate = useNavigate();
  if (!slug) return null;
  return (
    <PageTransition key="blog-post">
      <Suspense fallback={<PageLoader />}>
        <BlogPost slug={slug} onBack={() => navigate('/blog')} />
      </Suspense>
    </PageTransition>
  );
}

// Wrapper for cheat sheet detail view
function CheatSheetViewWrapper() {
  const { slug } = useParams();
  const navigate = useNavigate();
  if (!slug) return null;
  return <CheatSheetView slug={slug} onBack={() => navigate('/cheatsheets')} />;
}

export default App;
