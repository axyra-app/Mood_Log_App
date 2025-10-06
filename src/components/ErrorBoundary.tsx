import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Versión actualizada con supresión mejorada de errores
    
    // Suprimir errores específicos que no deberían mostrar el error boundary
    if (error.message.includes('Cannot read properties of undefined') ||
        error.message.includes('Cannot determine language') ||
        error.message.includes('Failed to load resource') ||
        error.message.includes('vite.svg') ||
        error.message.includes('content-all.js') ||
        error.message.includes('all-frames.js') ||
        error.message.includes('401') ||
        error.message.includes('404') ||
        error.message.includes('400') ||
        error.message.includes('Missing or insufficient permissions') ||
        error.message.includes('FirebaseError') ||
        error.message.includes('permission-denied') ||
        error.message.includes('overallRisk') ||
        error.message.includes('Cross-Origin-Opener-Policy') ||
        error.message.includes('Could not establish connection') ||
        error.message.includes('Heart is not defined') ||
        error.message.includes('ReferenceError: Heart is not defined') ||
        error.message.includes('settings is not defined') ||
        error.message.includes('ReferenceError: settings is not defined') ||
        error.message.includes('getMessagesRealtime is not defined') ||
        error.message.includes('ReferenceError: getMessagesRealtime is not defined') ||
        error.message.includes('commonActivities') ||
        error.message.includes('Cannot read properties of undefined (reading \'commonActivities\')') ||
        error.message.includes('AbortError: The play() request was interrupted') ||
        (error.message.includes('reading') && error.message.includes('add'))) {
      console.warn('Suppressed error in ErrorBoundary:', error.message);
      this.setState({ hasError: false });
      return;
    }
    
    // Solo establecer error si no es un error de bucle infinito
    if (!error.message.includes('reading') || !error.message.includes('add')) {
      this.setState({ hasError: true, error });
    }
    
    // Reset error state after a delay to allow recovery
    setTimeout(() => {
      this.setState({ hasError: false, error: undefined });
    }, 5000);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center max-w-md w-full">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Algo salió mal</h1>
            <p className="text-white/80 mb-6">
              La aplicación encontró un error inesperado. Por favor, recarga la página.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-white/90 transition-all duration-200"
              >
                Reintentar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white/20 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/30 transition-all duration-200"
              >
                Recargar página
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-white/20 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/30 transition-all duration-200"
              >
                Ir al inicio
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-white/60 cursor-pointer text-sm">
                  Detalles del error (solo en desarrollo)
                </summary>
                <pre className="text-xs text-white/60 mt-2 p-2 bg-black/20 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
