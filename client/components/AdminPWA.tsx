'use client';

import { useEffect } from 'react';

export default function AdminPWA() {
  useEffect(() => {
    // Never register the service worker outside production: its cache-on-fetch-failure
    // strategy will serve stale JS chunks after every dev-server recompile hiccup, since
    // chunk URLs for /admin/* routes match its "/admin" substring filter too.
    if (process.env.NODE_ENV !== 'production') return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/admin-sw.js', { scope: '/admin' })
        .then((registration) => {
          console.log('Admin PWA Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.error('Admin PWA Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
