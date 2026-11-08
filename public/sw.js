// DotaScope Service Worker — v2.0.0
// The CACHE_VERSION is bumped at build time via sed in the build script.
// When a new SW is detected, the app shows an "Actualizar" button.
// On click, the app posts { type: 'SKIP_WAITING' } to this SW.
const CACHE_VERSION = '1794161013193';
const CACHE_NAME = 'dotascope-v' + CACHE_VERSION;

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// ─── Install ──────────────────────────────────────────────────
// Pre-cache the app shell and activate immediately so updates apply right away
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Could not pre-cache some assets:', err);
      });
    })
  );
});

// ─── Activate ─────────────────────────────────────────────────
// Delete ALL old caches and take control of all clients.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Message listener: SKIP_WAITING ───────────────────────────
// When the app says it's time to update, activate the new SW.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── Push Notifications ───────────────────────────────────────
// Handles incoming push messages (e.g. from a future backend).
self.addEventListener('push', (event) => {
  let data = { title: 'DotaScope', body: 'Tienes una actualización.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text() || data.body;
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'DotaScope', {
      body: data.body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: data.tag || 'dotascope-notif',
      data: data.url ? { url: data.url } : undefined,
      vibrate: [200, 100, 200],
    })
  );
});

// ─── Notification Click ────────────────────────────────────────
// Opens the app when the user taps a notification.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// ─── Fetch Strategy ───────────────────────────────────────────
// Navigation: Network-first (fresh content) → cache fallback
// APIs: Network-first → cache fallback (offline support)
// Static: Stale-while-revalidate
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;

  // 1. HTML Navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('./index.html') || caches.match('./');
        })
    );
    return;
  }

  // 2. External APIs
  if (url.origin.includes('opendota.com') || url.origin.includes('steamstatic.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Static Assets — Stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
