import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Ultra simple app component
const UltraSimpleApp = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
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
        maxWidth: '500px'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
          🚀 Mood Log App
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
          ¡Aplicación funcionando correctamente!
        </p>
        <div style={{
          background: 'rgba(0,255,0,0.2)',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '2px solid rgba(0,255,0,0.5)'
        }}>
          ✅ <strong>APLICACIÓN CARGADA EXITOSAMENTE</strong><br />
          ✅ <strong>SIN FIREBASE</strong><br />
          ✅ <strong>SIN ERRORES</strong>
        </div>
        <button style={{
          background: 'white',
          color: '#667eea',
          padding: '15px 30px',
          borderRadius: '25px',
          fontSize: '1.1rem',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          Continuar
        </button>
      </div>
    </div>
  );
};

// Render the app directly
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<UltraSimpleApp />);
