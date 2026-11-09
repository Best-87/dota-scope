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

// ─── Active Account & Background Monitoring State ─────────────
let monitoredAccountId = null;
let lastKnownMatchId = null;
let knownParsedMatches = [];

// Hero Name Mapping for standalone notifications when app is closed
const HERO_NAMES = {
  1: "Anti-Mage", 2: "Axe", 3: "Bane", 4: "Bloodseeker", 5: "Crystal Maiden", 6: "Drow Ranger",
  7: "Earthshaker", 8: "Juggernaut", 9: "Mirana", 10: "Morphling", 11: "Shadow Fiend",
  12: "Phantom Lancer", 13: "Puck", 14: "Pudge", 15: "Razor", 16: "Sand King", 17: "Storm Spirit",
  18: "Sven", 19: "Tiny", 20: "Vengeful Spirit", 21: "Windranger", 22: "Zeus", 23: "Kunkka",
  25: "Lina", 26: "Lion", 27: "Shadow Shaman", 28: "Slardar", 29: "Tidehunter", 30: "Witch Doctor",
  31: "Lich", 32: "Riki", 33: "Enigma", 34: "Tinker", 35: "Sniper", 36: "Necrophos", 37: "Warlock",
  38: "Beastmaster", 39: "Queen of Pain", 40: "Venomancer", 41: "Faceless Void", 42: "Wraith King",
  43: "Death Prophet", 44: "Phantom Assassin", 45: "Pugna", 46: "Templar Assassin", 47: "Viper",
  48: "Luna", 49: "Dragon Knight", 50: "Dazzle", 51: "Clockwerk", 52: "Leshrac", 53: "Nature's Prophet",
  54: "Lifestealer", 55: "Dark Seer", 56: "Clinkz", 57: "Omniknight", 58: "Enchantress", 59: "Huskar",
  60: "Night Stalker", 61: "Broodmother", 62: "Bounty Hunter", 63: "Weaver", 64: "Jakiro", 65: "Batrider",
  66: "Chen", 67: "Spectre", 68: "Ancient Apparition", 69: "Doom", 70: "Ursa", 71: "Spirit Breaker",
  72: "Gyrocopter", 73: "Alchemist", 74: "Invoker", 75: "Silencer", 76: "Outworld Destroyer", 77: "Lycan",
  78: "Brewmaster", 79: "Shadow Demon", 80: "Lone Druid", 81: "Chaos Knight", 82: "Meepo", 83: "Treant Protector",
  84: "Ogre Magi", 85: "Undying", 86: "Rubick", 87: "Disruptor", 88: "Nyx Assassin", 89: "Naga Siren",
  90: "Keeper of the Light", 91: "Io", 92: "Visage", 93: "Slark", 94: "Medusa", 95: "Troll Warlord",
  96: "Centaur Warrunner", 97: "Magnus", 98: "Timbersaw", 99: "Bristleback", 100: "Tusk", 101: "Skywrath Mage",
  102: "Abaddon", 103: "Elder Titan", 104: "Legion Commander", 105: "Techies", 106: "Ember Spirit",
  107: "Earth Spirit", 108: "Underlord", 109: "Terrorblade", 110: "Phoenix", 111: "Oracle",
  112: "Winter Wyvern", 113: "Arc Warden", 114: "Monkey King", 119: "Dark Willow", 120: "Pangolier",
  121: "Grimstroke", 123: "Hoodwink", 126: "Void Spirit", 128: "Snapfire", 129: "Mars", 131: "Ringmaster",
  135: "Dawnbreaker", 136: "Marci", 137: "Primal Beast", 138: "Muerta", 145: "Kez"
};

function getHeroName(id) {
  return HERO_NAMES[id] || (id ? 'Héroe #' + id : 'Héroe');
}

// Background poller that checks OpenDota directly from the Service Worker
async function checkMatchesInBackground() {
  if (!monitoredAccountId) return;
  try {
    const res = await fetch(`https://api.opendota.com/api/players/${monitoredAccountId}/recentMatches`);
    if (!res.ok) return;
    const matches = await res.json();
    if (!Array.isArray(matches) || matches.length === 0) return;

    const newest = matches[0];

    // Seed state if first run
    if (!lastKnownMatchId) {
      lastKnownMatchId = newest.match_id;
      matches.slice(0, 10).forEach((m) => {
        if (m.version && m.version > 0) knownParsedMatches.push(m.match_id);
      });
      return;
    }

    // Check for newly finished matches
    if (newest.match_id !== lastKnownMatchId) {
      const newMatches = matches.filter((m) => m.match_id > lastKnownMatchId);
      for (const m of newMatches) {
        const hero = getHeroName(m.hero_id);
        const won = (m.player_slot < 128) === Boolean(m.radiant_win);
        const resultText = won ? '✅ Victoria' : '❌ Derrota';
        
        const appUrl = new URL(`#/match/${m.match_id}`, self.registration.scope).href;
        await self.registration.showNotification(`⚔️ Nueva Partida: ${hero}`, {
          body: `Match #${m.match_id} con ${hero} finalizada — ${resultText}. Toca para ver la autopsia.`,
          icon: './icons/icon-192.png',
          badge: './icons/badge-96.png',
          tag: `bg_new_match_${m.match_id}`,
          renotify: true,
          data: { url: appUrl, matchId: m.match_id, accountId: monitoredAccountId },
          vibrate: [200, 100, 200],
          actions: [{ action: 'open', title: 'Ver Análisis' }],
        });
      }
      lastKnownMatchId = newest.match_id;
    }

    // Check for newly parsed matches
    for (const m of matches.slice(0, 8)) {
      if (m.version && m.version > 0 && !knownParsedMatches.includes(m.match_id)) {
        knownParsedMatches.push(m.match_id);
        const hero = getHeroName(m.hero_id);
        const appUrl = new URL(`#/match/${m.match_id}`, self.registration.scope).href;
        await self.registration.showNotification(`🔬 Análisis Listo: ${hero}`, {
          body: `El análisis de wards, laning y economía de la partida #${m.match_id} ya está disponible.`,
          icon: './icons/icon-192.png',
          badge: './icons/badge-96.png',
          tag: `bg_parsed_${m.match_id}`,
          renotify: true,
          data: { url: appUrl, matchId: m.match_id, accountId: monitoredAccountId },
          vibrate: [200, 100, 200],
          actions: [{ action: 'open', title: 'Abrir Partida' }],
        });
      }
    }
  } catch (e) {
    // Silent fail in background network glitches
  }
}

// Keep an autonomous interval running in SW execution context
let backgroundTimer = null;
function startSwPolling() {
  if (backgroundTimer) clearInterval(backgroundTimer);
  backgroundTimer = setInterval(checkMatchesInBackground, 50 * 1000);
}

// ─── Message listener ─────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'SET_ACTIVE_ACCOUNT') {
    monitoredAccountId = event.data.accountId;
    if (event.data.lastMatchId) lastKnownMatchId = event.data.lastMatchId;
    if (monitoredAccountId) {
      startSwPolling();
      checkMatchesInBackground();
    }
  }
});

// Periodic Background Sync (Native PWA Android Chrome / WebView)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-dota-matches') {
    event.waitUntil(checkMatchesInBackground());
  }
});

// Regular Background Sync (Triggered when network returns or OS wakes SW)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-dota-matches') {
    event.waitUntil(checkMatchesInBackground());
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
