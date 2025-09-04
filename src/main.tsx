import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import AppSimple from './AppSimple.tsx';
import AppNoFirebase from './AppNoFirebase.tsx';
import './index.css';

// Initialize Firebase (with error handling)
try {
  import('./lib/firebase');
  console.log('Firebase import initiated');
} catch (error) {
  console.error('Firebase import failed:', error);
}

// Use no-firebase app for debugging
const USE_NO_FIREBASE_APP = true;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {USE_NO_FIREBASE_APP ? <AppNoFirebase /> : <AppSimple />}
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
