// src/App.tsx - FIXED VERSION WITH PAGE TRACKING INSIDE ROUTER
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

import Analytics from './components/Analytics';
import WebVitalsReporter from './components/WebVitalsReporter';
import { usePageTracking } from './hooks/usePageTracking';
import './App.css';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FAQsPage = lazy(() => import('./pages/FAQsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Component that uses page tracking - must be inside Router
const AppContent: React.FC = () => {
  // ✅ FIXED: Now usePageTracking is called inside Router context
  usePageTracking();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main role="main">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/gallery/:category" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faqs" element={<FAQsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <ErrorBoundary>
        {/* ✅ Analytics & Performance Tracking */}
        <Analytics 
          gtmId={import.meta.env.VITE_GOOGLE_TAG_MANAGER_ID}
          gaId={import.meta.env.VITE_GOOGLE_ANALYTICS_ID}
        />
        <WebVitalsReporter />
        
        {/* ✅ FIXED: AppContent with page tracking is now inside Router */}
        <AppContent />
      </ErrorBoundary>
    </Router>
  );
};

export default App;