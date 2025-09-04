import React from 'react';
import ReactDOM from 'react-dom/client';
import MinimalApp from './AppMinimal.tsx';
import './index.css';

// Simple error boundary
class SimpleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f0f0',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ color: '#e74c3c' }}>Error en la aplicación</h1>
            <p>Por favor recarga la página</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: '#3498db',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <SimpleErrorBoundary>
    <MinimalApp />
  </SimpleErrorBoundary>
);
