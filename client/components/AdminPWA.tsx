'use client';

import { useEffect } from 'react';

export default function AdminPWA() {
  useEffect(() => {
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
