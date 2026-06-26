const CACHE_NAME = 'tola-quotes-portal-v2';
const PORTAL_ASSETS = [
  '/quotes-portal/login',
  '/quotes-portal/quotes',
  '/images/logo.png',
  '/images/logo.webp',
];

// Install event - cache portal assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PORTAL_ASSETS);
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
          .filter((name) => name.startsWith('tola-quotes-portal-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Only handle quotes-portal routes
  if (!event.request.url.includes('/quotes-portal')) {
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
            return caches.match('/quotes-portal/login');
          }

          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Push notification event handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();

    const options = {
      body: data.body || data.message || 'New notification',
      icon: data.icon || '/images/logo.png',
      badge: data.badge || '/images/logo.png',
      tag: data.tag || 'notification-' + Date.now(),
      data: data.data || {},
      requireInteraction: data.requireInteraction || false,
      vibrate: data.vibrate || [200, 100, 200],
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'TolaTiles Quotes', options)
    );
  } catch (e) {
    console.error('Error parsing push notification:', e);
  }
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || '/quotes-portal/quotes';

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/quotes-portal') && 'focus' in client) {
          client.focus();
          if (data.url) client.navigate(data.url);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
