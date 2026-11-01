import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to detect service worker updates and provide an update function.
 *
 * Returns:
 * - isUpdateAvailable: true when a new SW is waiting to activate.
 * - updateApp: clears all caches, tells the waiting SW to skipWaiting,
 *   then reloads the page so the new version takes over.
 * - isUpdating: true while the update is in progress (for UI spinner).
 */
export function usePwaUpdate() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const trackWaiting = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setIsUpdateAvailable(true);
      }
    };

    const onUpdateFound = () => {
      if (!registration) return;
      const installing = registration.installing;
      if (!installing) return;

      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          // New SW installed but waiting — update available
          setWaitingWorker(installing);
          setIsUpdateAvailable(true);
        }
      });
    };

    // When the active controller changes (new SW took over) → reload
    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    navigator.serviceWorker.ready
      .then((reg) => {
        registration = reg;
        // Check if there's already a waiting SW
        trackWaiting(reg);
        reg.addEventListener('updatefound', onUpdateFound);

        // Periodically check for updates (every 60 seconds)
        const interval = setInterval(() => {
          reg.update().catch(() => {});
        }, 60_000);

        return () => clearInterval(interval);
      })
      .catch((err) => {
        console.warn('[PWA Update] Error:', err);
      });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  /**
   * Perform the update:
   * 1. Clear all caches
   * 2. Tell the waiting SW to skip waiting
   * 3. The controllerchange listener will reload the page
   */
  const updateApp = useCallback(async () => {
    if (!waitingWorker) return;
    setIsUpdating(true);

    try {
      // 1. Purge all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // 2. Clear localStorage caches for API data (hero/item constants, etc.)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('dotascope_') || key.startsWith('ds_cache_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // 3. Tell the waiting SW to take over
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });

      // The controllerchange listener in the useEffect will reload the page automatically
    } catch (err) {
      console.error('[PWA Update] Error updating:', err);
      // Fallback: force reload anyway
      window.location.reload();
    }
  }, [waitingWorker]);

  return { isUpdateAvailable, updateApp, isUpdating };
}
