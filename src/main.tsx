import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './AppDebug';
import './index.css';

// Render the app sin validaciones de entorno que puedan causar errores
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
