import React from 'react';
import ReactDOM from 'react-dom/client';
import AppClean from './AppClean';
import './index.css';

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <AppClean />
  </React.StrictMode>
);
