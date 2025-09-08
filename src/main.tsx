import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { logEnvironmentInfo, validateEnvironment } from './utils/env';

// Validar configuración de entorno (no bloquear la aplicación)
try {
  const isValid = validateEnvironment();
  if (!isValid) {
    console.warn('⚠️ Algunas variables de entorno no están configuradas, pero la aplicación continuará');
  }
} catch (error) {
  console.warn('⚠️ Error al validar configuración:', error);
}

// Mostrar información del entorno en desarrollo
try {
  logEnvironmentInfo();
} catch (error) {
  console.warn('⚠️ Error al mostrar información del entorno:', error);
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
