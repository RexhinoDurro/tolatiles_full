const CACHE_NAME = 'tola-admin-v5';
const ADMIN_ASSETS = [
  '/admin/login',
  '/admin/dashboard',
  '/admin/blog',
  '/admin/blog/calendar',
  '/images/logo.png',
  '/images/logo.webp',
  '/images/badge-72.png',
  '/sounds/notification.wav',
];

// Install event - cache admin assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ADMIN_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('tola-admin-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Only handle admin routes
  if (!event.request.url.includes('/admin')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response for caching
        const responseClone = response.clone();

        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // If the request is for an HTML page, return the login page
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/admin/login');
          }

          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Push notification event handler
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push event received but no data');
    return;
  }

  try {
    const data = event.data.json();

    const options = {
      body: data.body || data.message || 'New notification',
      icon: data.icon || '/images/logo.png',
      badge: data.badge || '/images/badge-72.png',
      tag: data.tag || 'notification-' + Date.now(),
      data: data.data || {},
      requireInteraction: data.requireInteraction || false,
      vibrate: data.vibrate || [200, 100, 200],
      actions: [
        {
          action: 'view',
          title: 'View',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Tola Tiles Admin', options)
    );
  } catch (e) {
    console.error('Error parsing push notification:', e);
  }
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || '/admin/notifications';

  if (event.action === 'dismiss') {
    return;
  }

  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to find an existing admin window
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          client.focus();
          // Navigate to the notification URL
          if (data.url) {
            client.navigate(data.url);
          }
          return;
        }
      }

      // No existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Notification close event handler
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});
