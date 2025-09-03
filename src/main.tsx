import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Initialize Sentry first
import { initSentry } from './lib/sentry';
initSentry();

// Initialize Firebase with error handling
try {
  import('./lib/firebase').then(() => {
    console.log('Firebase module loaded successfully');
  }).catch((error) => {
    console.error('Failed to load Firebase module:', error);
  });
} catch (error) {
  console.error('Error importing Firebase:', error);
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
