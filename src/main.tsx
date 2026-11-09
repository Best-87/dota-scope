import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { PlayerProvider } from './context/PlayerContext'
import { NotificationProvider } from './context/NotificationContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <NotificationProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </NotificationProvider>
    </HashRouter>
  </React.StrictMode>,
)

// Register PWA Service Worker with auto-update & Periodic Background Sync
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      console.log('[PWA] Service Worker registrado:', reg.scope);
      reg.update();

      // Register Periodic Background Sync if supported (Android Chrome/Edge/PWA)
      if ('periodicSync' in reg) {
        try {
          const status = await (navigator as any).permissions.query({
            name: 'periodic-background-sync',
          });
          if (status.state === 'granted') {
            await (reg as any).periodicSync.register('check-dota-matches', {
              minInterval: 10 * 60 * 1000, // 10 minutes minimum
            });
            console.log('[PWA] Periodic Background Sync registrado');
          }
        } catch {
          // Ignored if not permitted by user browser settings
        }
      }

      // Sync active player to Service Worker for background notifications
      const storedId = localStorage.getItem('dotascope_account_id');
      if (storedId && reg.active) {
        reg.active.postMessage({
          type: 'SET_ACTIVE_ACCOUNT',
          accountId: Number(storedId),
        });
      }
    } catch (err) {
      console.warn('[PWA] Error al registrar Service Worker:', err);
    }
  });
}
