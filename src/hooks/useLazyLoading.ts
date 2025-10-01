import React, { ComponentType, lazy } from 'react';

// Componente de loading personalizable
interface LoadingFallbackProps {
  message?: string;
  isDarkMode?: boolean;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ message = 'Cargando...', isDarkMode = false }) => (
  <div className={`flex items-center justify-center p-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
    <div className='flex flex-col items-center space-y-4'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
      <p className='text-sm font-medium'>{message}</p>
    </div>
  </div>
);

// Hook para lazy loading de componentes
export const useLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallbackMessage?: string
) => {
  const LazyComponent = lazy(importFunc);

  return React.useMemo(() => {
    return (props: React.ComponentProps<T> & { isDarkMode?: boolean }) => (
      <Suspense fallback={<LoadingFallback message={fallbackMessage} isDarkMode={props.isDarkMode} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  }, [LazyComponent, fallbackMessage]);
};

// Componentes lazy comunes
export const LazyDashboard = useLazyComponent(() => import('../pages/DashboardSimple'), 'Cargando dashboard...');

export const LazyDashboardPsychologist = useLazyComponent(
  () => import('../pages/DashboardPsychologist'),
  'Cargando dashboard de psicólogo...'
);

export const LazyMoodFlow = useLazyComponent(() => import('../pages/MoodFlowSimple'), 'Cargando registro de mood...');

export const LazyChat = useLazyComponent(() => import('../pages/Chat'), 'Cargando chat...');

export const LazyStatistics = useLazyComponent(() => import('../pages/Statistics'), 'Cargando estadísticas...');

export const LazySettings = useLazyComponent(() => import('../pages/Settings'), 'Cargando configuración...');

export const LazyAnalyticsDashboard = useLazyComponent(
  () => import('../components/analytics/AnalyticsDashboard'),
  'Cargando analytics...'
);

export const LazyNotificationCenter = useLazyComponent(
  () => import('../components/NotificationCenter'),
  'Cargando notificaciones...'
);

export const LazyUserSettingsModal = useLazyComponent(
  () => import('../components/UserSettingsModal'),
  'Cargando configuración...'
);

// Hook para preload de componentes
export const usePreloadComponent = () => {
  const preloadComponent = React.useCallback((importFunc: () => Promise<any>) => {
    // Preload cuando el usuario está inactivo
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFunc();
      });
    } else {
      // Fallback para navegadores que no soportan requestIdleCallback
      setTimeout(() => {
        importFunc();
      }, 100);
    }
  }, []);

  return preloadComponent;
};

// Hook para detectar cuando el usuario está cerca de necesitar un componente
export const useIntersectionPreload = (threshold: number = 0.1) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
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
  }, [threshold]);

  return { ref, isIntersecting };
};

// Componente wrapper para lazy loading con intersection observer
export const LazyLoadWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}> = ({ children, fallback = <LoadingFallback />, threshold = 0.1, rootMargin = '50px' }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsLoaded(true);
          setIsIntersecting(true);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, isLoaded]);

  return <div ref={ref}>{isLoaded ? children : fallback}</div>;
};

// Hook para lazy loading de imágenes con intersection observer
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!isIntersecting) return;

    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };

    img.onerror = () => {
      setIsError(true);
    };

    img.src = src;
  }, [src, isIntersecting]);

  return {
    imageSrc,
    isLoaded,
    isError,
    imgRef,
    isIntersecting,
  };
};

// Componente de imagen lazy
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  isDarkMode?: boolean;
}> = ({ src, alt, placeholder, className = '', isDarkMode = false }) => {
  const { imageSrc, isLoaded, isError, imgRef } = useLazyImage(src, placeholder);

  if (isError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
        <span className='text-gray-500'>Error cargando imagen</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{
        backgroundImage: placeholder ? `url(${placeholder})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
};

export default {
  useLazyComponent,
  usePreloadComponent,
  useIntersectionPreload,
  LazyLoadWrapper,
  LazyImage,
  LoadingFallback,
};
