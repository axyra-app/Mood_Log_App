import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Initialize Firebase first
import './lib/firebase';

// Initialize monitoring after Firebase
import { initAnalytics } from './lib/analytics';
import { initSentry } from './lib/sentry';

// Initialize monitoring
try {
  initSentry();
  initAnalytics();
} catch (error) {
  console.warn('Failed to initialize monitoring:', error);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
