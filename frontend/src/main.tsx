import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './utils/consoleFilter'; // Aplicar filtro de consola

const preloadReloadKey = 'mood-log-preload-reload';

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();

  const lastReload = Number(sessionStorage.getItem(preloadReloadKey));
  if (!lastReload || Date.now() - lastReload > 30_000) {
    sessionStorage.setItem(preloadReloadKey, String(Date.now()));
    window.location.reload();
  }
});

window.addEventListener('load', () => {
  window.setTimeout(() => sessionStorage.removeItem(preloadReloadKey), 30_000);
}, { once: true });

// Render the app sin validaciones de entorno que puedan causar errores
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
