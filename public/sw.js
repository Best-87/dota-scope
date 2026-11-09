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
  './icons/badge-96.png',
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
// Handles incoming push messages (background or simulated push).
self.addEventListener('push', (event) => {
  let data = { title: 'DotaScope', body: 'Tienes una actualización táctica disponible.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const targetUrl = data.url || (data.matchId ? `#/match/${data.matchId}` : './');

  event.waitUntil(
    self.registration.showNotification(data.title || 'DotaScope', {
      body: data.body,
      icon: './icons/icon-192.png',
      badge: './icons/badge-96.png',
      tag: data.tag || `dotascope-${Date.now()}`,
      renotify: true,
      data: { url: targetUrl, matchId: data.matchId, accountId: data.accountId },
      // WhatsApp-style vibration: buzz-pause-buzz
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: 'Ver Partida' }
      ]
    })
  );
});

// ─── Notification Click ────────────────────────────────────────
// Opens or brings to front the app when the user taps a mobile notification.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Resolve destination relative to registration scope to prevent loading sw.js as a page
  const rawPath = event.notification.data?.url || './';
  let targetUrl;
  try {
    targetUrl = new URL(rawPath, self.registration.scope).href;
  } catch {
    targetUrl = self.registration.scope;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open under this origin/scope, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window pointing to the app
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
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
