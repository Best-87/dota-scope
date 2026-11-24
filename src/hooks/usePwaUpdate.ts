import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to automatically apply Service Worker updates silently without manual cache clearing.
 *
 * Capabilities:
 * - Checks for updates every 30 seconds and when the tab regains focus or network reconnects.
 * - Automatically purges stale caches and activates the new worker immediately.
 * - Provides `isUpdateAvailable`, `updateApp`, and `isUpdating` for UI feedback.
 */
export function usePwaUpdate() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const purgeCachesAndActivate = useCallback(async (workerToActivate?: ServiceWorker | null) => {
    setIsUpdating(true);
    try {
      // 1. Purge all CacheStorage caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // 2. Clear volatile API caches from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('dotascope_constants') || key.startsWith('ds_cache_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // 3. Command the waiting worker to skip waiting
      const targetWorker = workerToActivate || waitingWorker;
      if (targetWorker) {
        targetWorker.postMessage({ type: 'SKIP_WAITING' });
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.warn('[PWA AutoUpdate] Error during cache purge:', err);
      window.location.reload();
    }
  }, [waitingWorker]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const handleWaitingWorker = (worker: ServiceWorker) => {
      setWaitingWorker(worker);
      setIsUpdateAvailable(true);
      // Auto-apply update seamlessly if tab has just loaded or user is idle
      console.log('[PWA] Nueva versión detectada, aplicando actualización automática...');
      purgeCachesAndActivate(worker);
    };

    const trackWaiting = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        handleWaitingWorker(reg.waiting);
      }
    };

    const onUpdateFound = () => {
      if (!registration) return;
      const installing = registration.installing;
      if (!installing) return;

      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          handleWaitingWorker(installing);
        }
      });
    };

    // Controller change means the new SW took over
    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    // Broadcast messages from Service Worker
    const onSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_ACTIVATED') {
        console.log('[PWA] Service Worker actualizado a versión:', event.data.version);
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    navigator.serviceWorker.addEventListener('message', onSwMessage);

    navigator.serviceWorker.ready
      .then((reg) => {
        registration = reg;
        trackWaiting(reg);
        reg.addEventListener('updatefound', onUpdateFound);

        // Immediate check on start
        reg.update().catch(() => {});

        // Check for updates periodically (every 30 seconds)
        const interval = setInterval(() => {
          reg.update().catch(() => {});
        }, 30_000);

        // Also check whenever user returns to the tab or comes back online
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            reg.update().catch(() => {});
          }
        };
        const handleOnline = () => {
          reg.update().catch(() => {});
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('online', handleOnline);

        return () => {
          clearInterval(interval);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('online', handleOnline);
        };
      })
      .catch((err) => {
        console.warn('[PWA Update] Setup error:', err);
      });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      navigator.serviceWorker.removeEventListener('message', onSwMessage);
    };
  }, [purgeCachesAndActivate]);

  const updateApp = useCallback(async () => {
    await purgeCachesAndActivate();
  }, [purgeCachesAndActivate]);

  return { isUpdateAvailable, updateApp, isUpdating };
}
