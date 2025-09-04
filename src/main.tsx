import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import AppSimple from './AppSimple.tsx';
import './index.css';

// Initialize Firebase
import './lib/firebase';

// Use simple app for debugging
const USE_SIMPLE_APP = true;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {USE_SIMPLE_APP ? <AppSimple /> : <App />}
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
