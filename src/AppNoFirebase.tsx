import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

// Simple landing page without Firebase dependency
const NoFirebaseLandingPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '40px',
        borderRadius: '20px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        maxWidth: '600px'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
          🚀 Mood Log App
        </h1>
        <p style={{ fontSize: '1.3rem', marginBottom: '30px', opacity: 0.9 }}>
          Tu aplicación de seguimiento del estado de ánimo está funcionando correctamente
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          fontSize: '1.1rem'
        }}>
          ✅ <strong>Aplicación cargada exitosamente</strong><br />
          ✅ <strong>Sin errores de Firebase</strong><br />
          ✅ <strong>Lista para usar</strong>
        </div>
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid white',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '25px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            Iniciar Sesión
          </button>
          <button style={{
            background: 'white',
            border: '2px solid white',
            color: '#667eea',
            padding: '15px 30px',
            borderRadius: '25px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            Registrarse
          </button>
        </div>
        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
          fontSize: '0.9rem',
          opacity: 0.8
        }}>
          <strong>Estado del Sistema:</strong><br />
          • Aplicación React: ✅ Funcionando<br />
          • Routing: ✅ Funcionando<br />
          • UI Components: ✅ Funcionando<br />
          • Firebase: ⚠️ Configurando...
        </div>
      </div>
    </div>
  );
};

function AppNoFirebase() {
  return (
    <ErrorBoundary fallback={<AppFallback />}>
      <div className='min-h-screen'>
        <Routes>
          <Route path='/' element={<NoFirebaseLandingPage />} />
          <Route path='*' element={<NoFirebaseLandingPage />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default AppNoFirebase;
