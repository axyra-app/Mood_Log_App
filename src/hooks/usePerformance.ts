import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Hook para debounce
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para throttle
export const useThrottle = <T extends (...args: any[]) => any>(callback: T, delay: number): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Hook para memoización de cálculos costosos
export const useMemoizedCalculation = <T>(calculation: () => T, dependencies: React.DependencyList): T => {
  return useMemo(calculation, dependencies);
};

// Hook para optimizar re-renders
export const useStableCallback = <T extends (...args: any[]) => any>(callback: T): T => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(((...args) => callbackRef.current(...args)) as T, []);
};

// Hook para lazy loading de imágenes
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };

    img.onerror = () => {
      setIsError(true);
    };

    img.src = src;
  }, [src]);

  return { imageSrc, isLoaded, isError };
};

// Hook para virtualización de listas
export const useVirtualization = (itemCount: number, itemHeight: number, containerHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(visibleStart + Math.ceil(containerHeight / itemHeight) + 1, itemCount);

  const totalHeight = itemCount * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const visibleItems = Array.from({ length: visibleEnd - visibleStart }, (_, index) => visibleStart + index);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
};

// Hook para optimizar consultas a Firestore
export const useFirestoreOptimization = () => {
  const queryCache = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  const getCachedQuery = useCallback((queryKey: string) => {
    const cached = queryCache.current.get(queryKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  const setCachedQuery = useCallback((queryKey: string, data: any) => {
    queryCache.current.set(queryKey, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  const clearCache = useCallback(() => {
    queryCache.current.clear();
  }, []);

  return {
    getCachedQuery,
    setCachedQuery,
    clearCache,
  };
};

// Hook para optimizar el estado del componente
export const useOptimizedState = <T>(initialState: T) => {
  const [state, setState] = React.useState(initialState);
  const stateRef = useRef(state);

  const setOptimizedState = useCallback((newState: T | ((prev: T) => T)) => {
    const nextState = typeof newState === 'function' ? (newState as (prev: T) => T)(stateRef.current) : newState;

    if (nextState !== stateRef.current) {
      stateRef.current = nextState;
      setState(nextState);
    }
  }, []);

  return [state, setOptimizedState] as const;
};

// Hook para detectar cambios en el rendimiento
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    isSlow: false,
  });

  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Detectar si el render fue lento (>16ms para 60fps)
      const isSlow = renderTime > 16;

      setMetrics({
        renderTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        isSlow,
      });
    };
  });

  return metrics;
};

// Hook para optimizar re-renders con React.memo
export const useMemoizedComponent = <P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.useMemo(() => React.memo(Component, areEqual), [Component, areEqual]);
};

// Hook para batch updates
export const useBatchedUpdates = () => {
  const [updates, setUpdates] = useState<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback(
    (update: () => void) => {
      setUpdates((prev) => [...prev, update]);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        updates.forEach((update) => update());
        setUpdates([]);
      }, 0);
    },
    [updates]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};
