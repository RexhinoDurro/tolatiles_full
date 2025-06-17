// src/App.tsx - FIXED VERSION WITH ANALYTICS ACTIVE
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

const App: React.FC = () => {
  // ✅ NEW: Enable automatic page tracking
  usePageTracking();

  return (
    <Router>
      <ScrollToTop />
      <ErrorBoundary>
        {/* ✅ NEW: Google Analytics & Performance Tracking */}
        <Analytics 
          gtmId={import.meta.env.VITE_GOOGLE_TAG_MANAGER_ID}
          gaId={import.meta.env.VITE_GOOGLE_ANALYTICS_ID}
        />
        <WebVitalsReporter />
        
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
      </ErrorBoundary>
    </Router>
  );
};

export default App;