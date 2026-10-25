import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { PlayerProvider } from './context/PlayerContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </HashRouter>
  </React.StrictMode>,
)

// Register PWA Service Worker with auto-update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registrado:', reg.scope);
        // Force check for updates every time app opens
        reg.update();
      })
      .catch((err) => {
        console.warn('[PWA] Error al registrar Service Worker:', err);
      });
  });
}
