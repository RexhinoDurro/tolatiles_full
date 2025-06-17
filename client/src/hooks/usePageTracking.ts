// src/hooks/usePageTracking.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views with Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
        page_title: document.title,
        page_location: window.location.href,
      });
    }

    // Track page views with Google Tag Manager
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'page_view',
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname,
      });
    }
  }, [location]);
};