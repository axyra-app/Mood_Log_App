import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import AppFallback from './components/AppFallback';
import FirebaseStatus from './components/FirebaseStatus';

// Simple landing page component
const SimpleLandingPage = () => {
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
      <FirebaseStatus />
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
      </div>
    </div>
  );
};

function AppSimple() {
  return (
    <ErrorBoundary fallback={<AppFallback />}>
      <div className='min-h-screen'>
        <Routes>
          <Route path='/' element={<SimpleLandingPage />} />
          <Route path='*' element={<SimpleLandingPage />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default AppSimple;
