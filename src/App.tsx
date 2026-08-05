import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { trackPage } from './utils/analytics';
import AdminLayout from './components/AdminLayout';
import PublicLayout from './components/layout/PublicLayout';
import AppProviders from './app/AppProviders';

import LandingPage from './pages/LandingPage';
import ListPage from './pages/ListPage';
import MapPage from './pages/MapPage';
const MapCNPage = lazy(() => import('./pages/MapCNPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const DonationPage = lazy(() => import('./pages/DonationPage'));
const SubmitMechanicPage = lazy(() => import('./pages/SubmitMechanicPage'));
const EmergencyHubPage = lazy(() => import('./pages/EmergencyHubPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const VerifyStartPage = lazy(() => import('./pages/VerifyStartPage'));
const CityLandingPage = lazy(() => import('./pages/CityLandingPage'));
const ServiceCityLandingPage = lazy(() => import('./pages/ServiceCityLandingPage'));
const MechanicProfile = lazy(() => import('./pages/MechanicProfile'));
const MechanicDashboard = lazy(() => import('./pages/MechanicDashboard'));
const VerifyFlowPage = lazy(() => import('./pages/VerifyFlowPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminMechanics = lazy(() => import('./pages/AdminMechanics'));
const AdminVerificationRequests = lazy(() => import('./pages/AdminVerificationRequests'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const MechanicForm = lazy(() => import('./pages/MechanicForm'));
const AdminBulkUpload = lazy(() => import('./pages/AdminBulkUpload'));
const AdminGMapsImport = lazy(() => import('./pages/AdminGMapsImport'));
const AdminUpdateRequests = lazy(() => import('./pages/AdminUpdateRequests'));
const UpdateRequestForm = lazy(() => import('./pages/UpdateRequestForm'));
const AdminFeedback = lazy(() => import('./pages/AdminFeedback'));
const AdminDonations = lazy(() => import('./pages/AdminDonations'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminReviews = lazy(() => import('./pages/AdminReviews'));

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPage();
    window.scrollTo(0, 0);
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

const publicRoutes = (
  <Route element={<PublicLayout />}>
    <Route path="/" element={<LandingPage />} />
    <Route path="/list" element={<ListPage />} />
    <Route path="/map" element={<MapPage />} />
    <Route path="/submit" element={<SubmitMechanicPage />} />
    <Route path="/emergency" element={<EmergencyHubPage />} />
    <Route path="/mapcn" element={<MapCNPage />} />
    <Route path="/feedback" element={<FeedbackPage />} />
    <Route path="/donate" element={<DonationPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />
    <Route path="/verify-start" element={<VerifyStartPage />} />
    <Route path="/cities/:citySlug" element={<CityLandingPage />} />
    <Route path="/services/:serviceSlug/in/:citySlug" element={<ServiceCityLandingPage />} />
    <Route path="/mechanic/:id" element={<MechanicProfile />} />
    <Route path="/mechanic-dashboard/:id" element={<Suspense fallback={<RouteLoader />}><MechanicDashboard /></Suspense>} />
    <Route path="/verify-flow/:id" element={<Suspense fallback={<RouteLoader />}><VerifyFlowPage /></Suspense>} />
  </Route>
);

function ClientToaster() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} toastOptions={{ className: 'dark:bg-card dark:text-foreground dark:border dark:border-border' }} />;
}

export function AppRoutes() {
  return (
    <>
      <AnalyticsTracker />
      <ClientToaster />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {publicRoutes}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="mechanics" element={<AdminMechanics />} />
              <Route path="mechanics/new" element={<MechanicForm />} />
              <Route path="mechanics/:id/edit" element={<MechanicForm />} />
              <Route path="mechanics/bulk-upload" element={<AdminBulkUpload />} />
              <Route path="mechanics/gmaps-import" element={<AdminGMapsImport />} />
              <Route path="verifications" element={<AdminVerificationRequests />} />
              <Route path="update-requests" element={<AdminUpdateRequests />} />
              <Route path="update-requests/:id/edit" element={<UpdateRequestForm />} />
              <Route path="feedback" element={<AdminFeedback />} />
              <Route path="donations" element={<AdminDonations />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}
