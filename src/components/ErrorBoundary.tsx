import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';
import { errorService } from '../services/errorService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log error to error service
    try {
      errorService.createError(
        'react/error-boundary',
        error.message,
        {
          error: error.toString(),
          errorInfo: errorInfo.componentStack,
          stack: error.stack,
        },
        {
          component: 'ErrorBoundary',
          action: 'componentDidCatch',
        }
      );
    } catch (serviceError) {
      console.error('Failed to log error to service:', serviceError);
    }

    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4'>
          <div className='max-w-md w-full bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <AlertTriangle className='w-8 h-8 text-red-600' />
            </div>

            <h1 className='text-2xl font-bold text-gray-900 mb-4'>¡Oops! Algo salió mal</h1>

            <p className='text-gray-600 mb-6'>
              Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y está trabajando para solucionarlo.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className='mb-6 p-4 bg-gray-100 rounded-lg text-left'>
                <h3 className='font-medium text-gray-900 mb-2'>Detalles del error:</h3>
                <pre className='text-xs text-gray-600 overflow-auto'>{this.state.error.toString()}</pre>
              </div>
            )}

            <div className='space-y-3'>
              <button
                onClick={this.handleRetry}
                className='w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors'
              >
                <RefreshCw className='w-4 h-4' />
                <span>Intentar de nuevo</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className='w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors'
              >
                <Home className='w-4 h-4' />
                <span>Ir al inicio</span>
              </button>
            </div>

            <div className='mt-6 pt-6 border-t border-gray-200'>
              <p className='text-sm text-gray-500'>Si el problema persiste, por favor contacta a soporte técnico.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
