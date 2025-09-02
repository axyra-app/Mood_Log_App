import { useCallback, useEffect } from 'react';

// Performance monitoring hook
export const usePerformance = () => {
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);

    // Send to analytics if available
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'timing_complete', {
        name: name,
        value: Math.round(end - start),
      });
    }
  }, []);

  const measureAsyncPerformance = useCallback(async (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);

    // Send to analytics if available
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'timing_complete', {
        name: name,
        value: Math.round(end - start),
      });
    }

    return result;
  }, []);

  // Monitor Core Web Vitals
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'web_vitals', {
              name: 'LCP',
              value: Math.round(entry.startTime),
            });
          }
        }

        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime);
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(entry.processingStart - entry.startTime),
            });
          }
        }

        if (entry.entryType === 'layout-shift') {
          if (!(entry as any).hadRecentInput) {
            console.log('CLS:', (entry as any).value);
            if (typeof window.gtag === 'function') {
              window.gtag('event', 'web_vitals', {
                name: 'CLS',
                value: Math.round((entry as any).value * 1000),
              });
            }
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      console.warn('Performance Observer not supported');
    }

    return () => observer.disconnect();
  }, []);

  return {
    measurePerformance,
    measureAsyncPerformance,
  };
};

// Image optimization hook
export const useImageOptimization = () => {
  const preloadImage = useCallback((src: string) => {
    const img = new Image();
    img.src = src;
    return new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  }, []);

  const lazyLoadImage = useCallback((src: string, placeholder?: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    });
  }, []);

  return {
    preloadImage,
    lazyLoadImage,
  };
};

// Memory usage monitoring
export const useMemoryMonitoring = () => {
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
        });

        // Alert if memory usage is high
        if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
          console.warn('High memory usage detected');
        }
      }
    };

    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);
};
