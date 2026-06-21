import React, { lazy, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AuthProvider } from './providers/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { ExitIntentModal } from './components/common/ExitIntentModal';
import { useExitIntent } from './hooks/useExitIntent';
import { useAnalytics } from './utils/analytics';
import { EnhancedAuthModal } from './components/auth/EnhancedAuthModal';

// Lazy load all page components
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const CareersPage = lazy(() => import('./pages/CareersPage').then(m => ({ default: m.CareersPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const HelpPage = lazy(() => import('./pages/HelpPage').then(m => ({ default: m.HelpPage })));
const SafetyPage = lazy(() => import('./pages/SafetyPage').then(m => ({ default: m.SafetyPage })));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const CreatorTripsPage = lazy(() => import('./pages/CreatorTripsPage').then(m => ({ default: m.CreatorTripsPage })));
const CreatorProfilePage = lazy(() => import('./pages/CreatorProfilePage').then(m => ({ default: m.CreatorProfilePage })));
const HostDashboard = lazy(() => import('./components/dashboard/HostDashboard').then(m => ({ default: m.HostDashboard })));
const TravelerDashboard = lazy(() => import('./components/dashboard/TravelerDashboard').then(m => ({ default: m.TravelerDashboard })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const TripsPage = lazy(() => import('./pages/TripsPage').then(m => ({ default: m.TripsPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage').then(m => ({ default: m.ReviewsPage })));
const StoriesPage = lazy(() => import('./pages/StoriesPage').then(m => ({ default: m.StoriesPage })));

// Loading component for pages
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { showExitModal, closeModal } = useExitIntent();
  const { appOpen } = useAnalytics();
  const [currentPage, setCurrentPage] = React.useState('home');
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'signup' | 'forgot'>('login');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Track app open event
  React.useEffect(() => {
    appOpen();
  }, []);

  // Listen for signup trigger from Hero component
  React.useEffect(() => {
    const handleSignupTrigger = () => {
      setAuthMode('signup');
      setShowAuthModal(true);
    };

    window.addEventListener('triggerSignup', handleSignupTrigger);
    return () => window.removeEventListener('triggerSignup', handleSignupTrigger);
  }, []);

  // Simple routing - in a real app you'd use React Router
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setCurrentPage(hash || 'home');
      setIsMenuOpen(false); // Auto-hide mobile menu on navigation
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Set initial page

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Simple routing based on user role and current view
  const getCurrentView = () => {
    // Explicitly render HomePage if the hash is 'home' or empty
    if (currentPage === 'home' || currentPage === '') {
      return (
        <Suspense fallback={<PageLoader />}>
          <HomePage />
        </Suspense>
      );
    }

    // Static pages available to everyone
    switch (currentPage) {
      case 'about': return <Suspense fallback={<PageLoader />}><AboutPage /></Suspense>;
      case 'how-it-works': return <Suspense fallback={<PageLoader />}><HowItWorksPage /></Suspense>;
      case 'careers': return <Suspense fallback={<PageLoader />}><CareersPage /></Suspense>;
      case 'terms': return <Suspense fallback={<PageLoader />}><TermsPage /></Suspense>;
      case 'privacy': return <Suspense fallback={<PageLoader />}><PrivacyPage /></Suspense>;
      case 'help': return <Suspense fallback={<PageLoader />}><HelpPage /></Suspense>;
      case 'safety': return <Suspense fallback={<PageLoader />}><SafetyPage /></Suspense>;
      case 'trips': return <Suspense fallback={<PageLoader />}><TripsPage /></Suspense>;
      case 'blog': return <Suspense fallback={<PageLoader />}><BlogPage /></Suspense>;
      case 'reviews': return <Suspense fallback={<PageLoader />}><ReviewsPage /></Suspense>;
      case 'stories': return <Suspense fallback={<PageLoader />}><StoriesPage /></Suspense>;
      case 'creator-profile': return <Suspense fallback={<PageLoader />}><CreatorProfilePage /></Suspense>;
      case 'creator-trips': return <Suspense fallback={<PageLoader />}><CreatorTripsPage /></Suspense>;
      case 'host-dashboard':
        return user?.role === 'host' ? (
          <Suspense fallback={<PageLoader />}><HostDashboard /></Suspense>
        ) : (
          <Suspense fallback={<PageLoader />}><HomePage /></Suspense>
        );
      case 'traveler-dashboard':
        return user?.role === 'traveler' ? (
          <Suspense fallback={<PageLoader />}><TravelerDashboard /></Suspense>
        ) : (
          <Suspense fallback={<PageLoader />}><HomePage /></Suspense>
        );
      case 'admin-dashboard':
        return user?.role === 'admin' ? (
          <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
        ) : (
          <Suspense fallback={<PageLoader />}><HomePage /></Suspense>
        );
      default:
        // If no specific page is requested and user is logged in, default to their dashboard
        if (user) {
          switch (user.role) {
            case 'host':
              return <Suspense fallback={<PageLoader />}><HostDashboard /></Suspense>;
            case 'admin':
              return <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>;
            default:
              return <Suspense fallback={<PageLoader />}><TravelerDashboard /></Suspense>;
          }
        }
        // Fallback to HomePage for unauthenticated users
        return (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <main>{getCurrentView()}</main>
        <Footer setIsMenuOpen={setIsMenuOpen} />
      </div>
      
      {/* Exit Intent Modal */}
      <ExitIntentModal
        isOpen={showExitModal}
        onClose={closeModal}
        onSignUp={(isExitIntentSignup = false) => {
          closeModal();
          setAuthMode('signup');
          setShowAuthModal(true);
          // Store the exit intent signup flag for the auth modal
          if (isExitIntentSignup) {
            sessionStorage.setItem('exitIntentSignup', 'true');
          }
        }}
      />
      
      {/* Auth Modal */}
      {showAuthModal && (
        <EnhancedAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onSwitchMode={setAuthMode}
          onSuccess={(user) => {
            setShowAuthModal(false);
            // Redirect based on user role
            if (user.role === 'host') {
              window.location.hash = 'host-dashboard';
            } else {
              window.location.hash = 'traveler-dashboard';
            }
          }}
        />
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      {/* Cloud Animation Background */}
      <div className="cloud-background">
        <div className="clouds"></div>
        <div className="airplane"></div>
      </div>
      {/* Animated Purple Bar - Global */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-purple-1800/10 to-transparent">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-purple-1800/10 to-transparent"></div>
        </div>
      </div>
      <AppContent />
    </AuthProvider>
  );
}

export default App;