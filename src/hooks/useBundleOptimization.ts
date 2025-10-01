import { ComponentType, lazy } from 'react';

// Componente de loading personalizable
interface LoadingFallbackProps {
  message?: string;
  isDarkMode?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = 'Cargando...', 
  isDarkMode = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center justify-center p-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className={`animate-spin rounded-full border-b-2 border-purple-600 ${sizeClasses[size]}`}></div>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

// Hook para lazy loading con preload
export const useLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallbackMessage?: string,
  preloadOnHover: boolean = true
) => {
  const LazyComponent = lazy(importFunc);
  
  const Component = React.useMemo(() => {
    return (props: React.ComponentProps<T> & { isDarkMode?: boolean }) => (
      <Suspense fallback={<LoadingFallback message={fallbackMessage} isDarkMode={props.isDarkMode} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  }, [LazyComponent, fallbackMessage]);

  // Preload en hover si está habilitado
  const preloadComponent = React.useCallback(() => {
    if (preloadOnHover) {
      importFunc();
    }
  }, [importFunc, preloadOnHover]);

  return { Component, preloadComponent };
};

// Componentes lazy para páginas principales
export const LazyPages = {
  // Páginas de autenticación
  Login: lazy(() => import('../pages/LoginSimple')),
  Register: lazy(() => import('../pages/RegisterSimple')),
  CompleteProfile: lazy(() => import('../pages/CompleteProfile')),
  ForgotPassword: lazy(() => import('../pages/ForgotPassword')),

  // Páginas principales
  Home: lazy(() => import('../pages/HomeSimple')),
  Dashboard: lazy(() => import('../pages/DashboardSimple')),
  DashboardPsychologist: lazy(() => import('../pages/DashboardPsychologist')),
  MoodFlow: lazy(() => import('../pages/MoodFlowSimple')),
  Chat: lazy(() => import('../pages/Chat')),
  Statistics: lazy(() => import('../pages/Statistics')),
  Settings: lazy(() => import('../pages/Settings')),

  // Páginas legales
  Terms: lazy(() => import('../pages/TermsSimple')),
  Privacy: lazy(() => import('../pages/PrivacySimple')),
};

// Componentes lazy para componentes específicos
export const LazyComponents = {
  // Componentes de mood
  MoodAnalysisPanel: lazy(() => import('../components/mood/MoodAnalysisPanel')),
  
  // Componentes de psicólogo
  PatientManagement: lazy(() => import('../components/psychologist/PatientManagement')),
  CrisisAlertsPanel: lazy(() => import('../components/psychologist/CrisisAlertsPanel')),
  PatientStatsPanel: lazy(() => import('../components/psychologist/PatientStatsPanel')),
  
  // Componentes de analytics
  AnalyticsDashboard: lazy(() => import('../components/analytics/AnalyticsDashboard')),
  
  // Componentes de notificaciones
  NotificationCenter: lazy(() => import('../components/NotificationCenter')),
  NotificationIndicator: lazy(() => import('../components/NotificationIndicator')),
  
  // Componentes de UI
  UserSettingsModal: lazy(() => import('../components/UserSettingsModal')),
  CrisisAlert: lazy(() => import('../components/CrisisAlert')),
  LogoutModal: lazy(() => import('../components/LogoutModal')),
};

// Hook para precargar componentes críticos
export const useCriticalPreload = () => {
  const [preloadedComponents, setPreloadedComponents] = useState<Set<string>>(new Set());

  const preloadCriticalComponents = React.useCallback(async () => {
    const criticalComponents = [
      () => import('../pages/DashboardSimple'),
      () => import('../pages/MoodFlowSimple'),
      () => import('../components/CrisisAlert'),
    ];

    const promises = criticalComponents.map(async (importFunc, index) => {
      try {
        await importFunc();
        setPreloadedComponents(prev => new Set([...prev, `critical-${index}`]));
      } catch (error) {
        console.warn(`Failed to preload critical component ${index}:`, error);
      }
    });

    await Promise.all(promises);
  }, []);

  const preloadOnIdle = React.useCallback(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        preloadCriticalComponents();
      });
    } else {
      // Fallback para navegadores que no soportan requestIdleCallback
      setTimeout(() => {
        preloadCriticalComponents();
      }, 100);
    }
  }, [preloadCriticalComponents]);

  return {
    preloadCriticalComponents,
    preloadOnIdle,
    preloadedComponents,
  };
};

// Hook para precargar componentes en hover
export const useHoverPreload = () => {
  const preloadOnHover = React.useCallback((importFunc: () => Promise<any>) => {
    let timeoutId: NodeJS.Timeout;
    
    const handleMouseEnter = () => {
      timeoutId = setTimeout(() => {
        importFunc();
      }, 200); // Preload después de 200ms de hover
    };

    const handleMouseLeave = () => {
      clearTimeout(timeoutId);
    };

    return { handleMouseEnter, handleMouseLeave };
  }, []);

  return { preloadOnHover };
};

// Hook para detectar conexión lenta y ajustar estrategia de carga
export const useConnectionAwareLoading = () => {
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  React.useEffect(() => {
    const updateConnectionInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setConnectionType(connection.effectiveType || 'unknown');
        setIsSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
      }
    };

    updateConnectionInfo();

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateConnectionInfo);
      
      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, []);

  const shouldPreload = React.useCallback(() => {
    return !isSlowConnection;
  }, [isSlowConnection]);

  const getLoadingStrategy = React.useCallback(() => {
    if (isSlowConnection) {
      return {
        lazy: true,
        preload: false,
        priority: 'low',
        compression: 'high'
      };
    }

    return {
      lazy: false,
      preload: true,
      priority: 'high',
      compression: 'medium'
    };
  }, [isSlowConnection]);

  return {
    connectionType,
    isSlowConnection,
    shouldPreload,
    getLoadingStrategy,
  };
};

// Hook para optimizar el bundle size
export const useBundleOptimization = () => {
  const [bundleSize, setBundleSize] = useState<number>(0);
  const [loadedChunks, setLoadedChunks] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    // Monitorear el tamaño del bundle si está disponible
    if ('performance' in window && 'getEntriesByType' in performance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            if (resource.name.includes('.js') || resource.name.includes('.css')) {
              setBundleSize(prev => prev + resource.transferSize);
            }
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });

      return () => observer.disconnect();
    }
  }, []);

  const trackChunkLoad = React.useCallback((chunkName: string) => {
    setLoadedChunks(prev => new Set([...prev, chunkName]));
  }, []);

  const getBundleStats = React.useCallback(() => {
    return {
      totalSize: bundleSize,
      loadedChunks: loadedChunks.size,
      averageChunkSize: loadedChunks.size > 0 ? bundleSize / loadedChunks.size : 0,
    };
  }, [bundleSize, loadedChunks]);

  return {
    bundleSize,
    loadedChunks,
    trackChunkLoad,
    getBundleStats,
  };
};

// Componente wrapper para lazy loading con optimizaciones
export const OptimizedLazyWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  preloadOnHover?: boolean;
  preloadOnIntersection?: boolean;
  threshold?: number;
}> = ({ 
  children, 
  fallback = <LoadingFallback />, 
  preloadOnHover = false,
  preloadOnIntersection = true,
  threshold = 0.1
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!preloadOnIntersection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsLoaded(true);
          setIsIntersecting(true);
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
  }, [threshold, preloadOnIntersection, isLoaded]);

  const handleMouseEnter = React.useCallback(() => {
    if (preloadOnHover && !isLoaded) {
      setIsLoaded(true);
    }
  }, [preloadOnHover, isLoaded]);

  return (
    <div 
      ref={ref}
      onMouseEnter={handleMouseEnter}
    >
      {isLoaded ? children : fallback}
    </div>
  );
};

// Utilidades para optimización de bundle
export const bundleOptimization = {
  // Dividir imports grandes en chunks más pequeños
  createChunkedImport: <T>(importFunc: () => Promise<T>, chunkName: string) => {
    return async () => {
      const startTime = performance.now();
      const result = await importFunc();
      const endTime = performance.now();
      
      console.log(`Chunk ${chunkName} loaded in ${endTime - startTime}ms`);
      return result;
    };
  },

  // Detectar imports duplicados
  detectDuplicateImports: () => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsFiles = resources.filter(r => r.name.includes('.js'));
      
      const duplicates = jsFiles.reduce((acc, file) => {
        const name = file.name.split('/').pop();
        if (name) {
          acc[name] = (acc[name] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(duplicates).filter(([_, count]) => count > 1);
    }
    
    return [];
  },

  // Optimizar imports dinámicos
  optimizeDynamicImport: <T>(importFunc: () => Promise<T>) => {
    let promise: Promise<T> | null = null;
    
    return () => {
      if (!promise) {
        promise = importFunc();
      }
      return promise;
    };
  },
};

export default bundleOptimization;
