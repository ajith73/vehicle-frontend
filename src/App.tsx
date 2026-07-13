import { BrowserRouter as Router, Routes, Route, Navigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { trackPage } from './utils/analytics';

import AdminLayout from './components/AdminLayout';

import { Wrench, MessageSquare, Heart, Sun, Moon, Home, Map as MapIcon, List, ShieldCheck } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { LocationProvider } from './contexts/LocationContext';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const ListPage = lazy(() => import('./pages/ListPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const MapCNPage = lazy(() => import('./pages/MapCNPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const DonationPage = lazy(() => import('./pages/DonationPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminMechanics = lazy(() => import('./pages/AdminMechanics'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const MechanicForm = lazy(() => import('./pages/MechanicForm'));
const AdminBulkUpload = lazy(() => import('./pages/AdminBulkUpload'));
const AdminUpdateRequests = lazy(() => import('./pages/AdminUpdateRequests'));
const AdminFeedback = lazy(() => import('./pages/AdminFeedback'));
const AdminDonations = lazy(() => import('./pages/AdminDonations'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPage();
  }, [location]);

  return null;
}

function RouteLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <span className="text-sm font-medium text-muted-foreground">Loading page...</span>
      </div>
    </div>
  );
}

function App() {
  // Default to system preference
  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(getSystemTheme());

  // Sync theme to document body and listen to system changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Layout for public pages
  const PublicLayout = () => {
    const location = useLocation();
    
    return (
      <LocationProvider>
        <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/20 pb-[72px] sm:pb-0">
        <header className="hidden sm:block sticky top-0 z-50 p-4 border-b border-border bg-background/80 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
            <Link to="/" className="flex items-center gap-2 text-xl font-black text-primary hover:scale-105 transition-transform">
              <Wrench className="w-6 h-6" /> RoadResQ
            </Link>
            <div className="flex gap-2 sm:gap-6 items-center">
              <Link to="/" className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                <Home className="w-4 h-4" /> Home
              </Link>
              <Link to="/about" className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                <ShieldCheck className="w-4 h-4" /> About
              </Link>
              <Link to="/map" className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                <MapIcon className="w-4 h-4" /> Map
              </Link>
              <Link to="/list" className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                <List className="w-4 h-4" /> List
              </Link>
              <Link to="/feedback" className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                <MessageSquare className="w-4 h-4" /> Feedback
              </Link>
              <Link to="/donate" className="hidden sm:flex items-center gap-1 text-sm font-bold text-pink-500 hover:text-pink-400 transition-colors">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500/50 animate-pulse drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" /> Donate
              </Link>

              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col w-full relative">
          {/* Subtle background gradient for public pages */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 -z-10" />
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
          <div className="flex justify-around items-center h-[72px]">
            <Link to="/" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Home className={`w-6 h-6 ${location.pathname === '/' ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-bold">Home</span>
            </Link>
            <Link to="/map" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/map' ? 'text-primary' : 'text-muted-foreground'}`}>
              <MapIcon className={`w-6 h-6 ${location.pathname === '/map' ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-bold">Map</span>
            </Link>
            <Link to="/list" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/list' ? 'text-primary' : 'text-muted-foreground hover:text-primary transition-colors'}`}>
              <List className="w-6 h-6" />
              <span className="text-[10px] font-bold">List</span>
            </Link>
            <Link to="/feedback" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/feedback' ? 'text-primary' : 'text-muted-foreground'}`}>
              <MessageSquare className={`w-6 h-6 ${location.pathname === '/feedback' ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-bold">Feedback</span>
            </Link>
            <Link to="/donate" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/donate' ? 'text-pink-500' : 'text-pink-500/80 hover:text-pink-500 transition-colors'}`}>
              <Heart className={`w-6 h-6 text-pink-500 fill-pink-500/50 animate-pulse drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]`} />
              <span className="text-[10px] font-bold">Donate</span>
            </Link>
          </div>
        </nav>
      </div>
      </LocationProvider>
    );
  };

  return (
    <Router>
      <AnalyticsTracker />
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} toastOptions={{ className: 'dark:bg-card dark:text-foreground dark:border dark:border-border' }} />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Public Routes with Header */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/list" element={<ListPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/mapcn" element={<MapCNPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/donate" element={<DonationPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Route>
          
          {/* Admin Login (No Layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Protected Routes with Sidebar Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="mechanics" element={<AdminMechanics />} />
            <Route path="mechanics/new" element={<MechanicForm />} />
            <Route path="mechanics/:id/edit" element={<MechanicForm />} />
            <Route path="mechanics/bulk-upload" element={<AdminBulkUpload />} />
            <Route path="update-requests" element={<AdminUpdateRequests />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="donations" element={<AdminDonations />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
