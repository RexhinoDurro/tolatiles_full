'use client';

import { useEffect } from 'react';

export default function QuotesPortalPWA() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/quotes-portal-sw.js', { scope: '/quotes-portal' })
        .then((registration) => {
          console.log('Quotes Portal PWA Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.error('Quotes Portal PWA Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
