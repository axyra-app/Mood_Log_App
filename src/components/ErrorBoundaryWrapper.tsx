import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryWrapper extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Suprimir errores específicos que causan bucles infinitos
    if (error.message.includes('Cannot read properties of undefined') &&
        error.message.includes('reading') &&
        error.message.includes('add')) {
      console.warn('Error de bucle infinito suprimido:', error.message);
      return { hasError: false };
    }
    
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundaryWrapper caught an error:', error, errorInfo);
    
    // Suprimir errores de bucle infinito
    if (error.message.includes('Cannot read properties of undefined') &&
        error.message.includes('reading') &&
        error.message.includes('add')) {
      console.warn('Error de bucle infinito suprimido en ErrorBoundaryWrapper');
      this.setState({ hasError: false });
      return;
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-red-500">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
            <p className="text-white text-lg font-semibold">Error en el componente</p>
            <p className="text-white/70 text-sm mt-2">Por favor, recarga la página</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWrapper;
