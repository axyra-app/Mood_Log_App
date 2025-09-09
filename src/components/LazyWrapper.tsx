import React, { ComponentType, Suspense, lazy } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// Componente wrapper para lazy loading
export const LazyWrapper: React.FC<LazyWrapperProps> = ({ fallback = <LoadingSpinner />, children }) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

// Función helper para crear componentes lazy con fallback personalizado
export const createLazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc);

  return React.forwardRef<any, P>((props, ref) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} ref={ref} />
    </LazyWrapper>
  ));
};

// Componentes lazy específicos
export const LazyAdvancedAIInsights = createLazyComponent(
  () => import('./AdvancedAIInsights'),
  <div className='flex items-center justify-center p-8'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
    <span className='ml-2 text-gray-600'>Cargando análisis de IA...</span>
  </div>
);

export const LazyAdvancedAnalytics = createLazyComponent(
  () => import('./AdvancedAnalytics'),
  <div className='flex items-center justify-center p-8'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
    <span className='ml-2 text-gray-600'>Cargando analytics...</span>
  </div>
);

export const LazyChatInterface = createLazyComponent(
  () => import('./ChatInterface'),
  <div className='flex items-center justify-center p-8'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
    <span className='ml-2 text-gray-600'>Cargando chat...</span>
  </div>
);

export const LazyReminderManager = createLazyComponent(
  () => import('./ReminderManager'),
  <div className='flex items-center justify-center p-8'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
    <span className='ml-2 text-gray-600'>Cargando recordatorios...</span>
  </div>
);

export const LazyConfigurationModal = createLazyComponent(
  () => import('./ConfigurationModal'),
  <div className='flex items-center justify-center p-8'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
    <span className='ml-2 text-gray-600'>Cargando configuración...</span>
  </div>
);

// Hook para lazy loading con intersection observer
export const useLazyLoad = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, hasLoaded]);

  return { ref, isVisible, hasLoaded };
};

// Componente para lazy loading con intersection observer
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  height?: string;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  fallback = <LoadingSpinner />,
  threshold = 0.1,
  height = '200px',
}) => {
  const { ref, isVisible } = useLazyLoad(threshold);

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {isVisible ? children : fallback}
    </div>
  );
};
