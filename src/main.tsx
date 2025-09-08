import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { logEnvironmentInfo, validateEnvironment } from './utils/env';

// Validar configuración de entorno
if (!validateEnvironment()) {
  console.error('❌ La aplicación no puede iniciar debido a configuración inválida');
}

// Mostrar información del entorno en desarrollo
logEnvironmentInfo();

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
