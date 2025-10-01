import { useCallback, useEffect, useState } from 'react';

// Tipos para PWA
interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWACapabilities {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  hasServiceWorker: boolean;
  hasOfflineSupport: boolean;
}

// Hook principal para PWA
export const usePWA = () => {
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasServiceWorker, setHasServiceWorker] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Detectar si la app está instalada
  useEffect(() => {
    const checkInstallation = () => {
      // Detectar si está en modo standalone
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');

      setIsStandalone(standalone);
      setIsInstalled(standalone);
    };

    checkInstallation();
    window.addEventListener('resize', checkInstallation);

    return () => window.removeEventListener('resize', checkInstallation);
  }, []);

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Detectar prompt de instalación
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as any);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Detectar instalación exitosa
  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Detectar Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        setHasServiceWorker(!!registration);
      });
    }
  }, []);

  // Instalar PWA
  const installPWA = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallPrompt(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }, [installPrompt]);

  // Ocultar prompt de instalación
  const dismissInstallPrompt = useCallback(() => {
    setShowInstallPrompt(false);
  }, []);

  // Obtener capacidades de PWA
  const getCapabilities = useCallback((): PWACapabilities => {
    return {
      canInstall: !!installPrompt && !isInstalled,
      isInstalled,
      isStandalone,
      hasServiceWorker,
      hasOfflineSupport: hasServiceWorker && !isOnline,
    };
  }, [installPrompt, isInstalled, isStandalone, hasServiceWorker, isOnline]);

  return {
    installPrompt,
    isInstalled,
    isStandalone,
    hasServiceWorker,
    isOnline,
    showInstallPrompt,
    installPWA,
    dismissInstallPrompt,
    getCapabilities,
  };
};

// Hook para manejo offline
export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Procesar cola offline cuando vuelve la conexión
  const processOfflineQueue = useCallback(async () => {
    if (isProcessingQueue || offlineQueue.length === 0) return;

    setIsProcessingQueue(true);

    try {
      for (const action of offlineQueue) {
        await action();
      }
      setOfflineQueue([]);
    } catch (error) {
      console.error('Error processing offline queue:', error);
    } finally {
      setIsProcessingQueue(false);
    }
  }, [offlineQueue, isProcessingQueue]);

  // Agregar acción a la cola offline
  const queueOfflineAction = useCallback(
    (action: () => Promise<void>) => {
      if (isOnline) {
        action();
      } else {
        setOfflineQueue((prev) => [...prev, action]);
      }
    },
    [isOnline]
  );

  return {
    isOnline,
    offlineQueue,
    isProcessingQueue,
    queueOfflineAction,
    processOfflineQueue,
  };
};

// Hook para notificaciones push
export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (permission !== 'granted' || !isSupported) return false;

      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.showNotification(title, options);
            return true;
          }
        }

        // Fallback a notificación básica
        new Notification(title, options);
        return true;
      } catch (error) {
        console.error('Error sending notification:', error);
        return false;
      }
    },
    [permission, isSupported]
  );

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
  };
};

// Hook para cache de recursos
export const useResourceCache = () => {
  const [cacheSize, setCacheSize] = useState(0);
  const [cachedResources, setCachedResources] = useState<string[]>([]);

  const addToCache = useCallback(async (url: string, response?: Response) => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('mood-log-v1');

        if (response) {
          await cache.put(url, response);
        } else {
          const res = await fetch(url);
          await cache.put(url, res);
        }

        setCachedResources((prev) => [...prev, url]);
        updateCacheSize();
      } catch (error) {
        console.error('Error caching resource:', error);
      }
    }
  }, []);

  const getFromCache = useCallback(async (url: string): Promise<Response | undefined> => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('mood-log-v1');
        return await cache.match(url);
      } catch (error) {
        console.error('Error getting from cache:', error);
        return undefined;
      }
    }
    return undefined;
  }, []);

  const clearCache = useCallback(async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        setCachedResources([]);
        setCacheSize(0);
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
    }
  }, []);

  const updateCacheSize = useCallback(async () => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('mood-log-v1');
        const keys = await cache.keys();
        setCacheSize(keys.length);
      } catch (error) {
        console.error('Error updating cache size:', error);
      }
    }
  }, []);

  useEffect(() => {
    updateCacheSize();
  }, [updateCacheSize]);

  return {
    cacheSize,
    cachedResources,
    addToCache,
    getFromCache,
    clearCache,
    updateCacheSize,
  };
};

// Hook para métricas de PWA
export const usePWAMetrics = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
  });

  useEffect(() => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'navigation':
              const navEntry = entry as PerformanceNavigationTiming;
              setMetrics((prev) => ({
                ...prev,
                loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              }));
              break;
            case 'paint':
              const paintEntry = entry as PerformancePaintTiming;
              if (paintEntry.name === 'first-contentful-paint') {
                setMetrics((prev) => ({
                  ...prev,
                  firstContentfulPaint: paintEntry.startTime,
                }));
              }
              break;
            case 'largest-contentful-paint':
              const lcpEntry = entry as PerformanceEntry;
              setMetrics((prev) => ({
                ...prev,
                largestContentfulPaint: lcpEntry.startTime,
              }));
              break;
            case 'layout-shift':
              const clsEntry = entry as any;
              if (!clsEntry.hadRecentInput) {
                setMetrics((prev) => ({
                  ...prev,
                  cumulativeLayoutShift: prev.cumulativeLayoutShift + clsEntry.value,
                }));
              }
              break;
            case 'first-input':
              const fidEntry = entry as any;
              setMetrics((prev) => ({
                ...prev,
                firstInputDelay: fidEntry.processingStart - fidEntry.startTime,
              }));
              break;
          }
        }
      });

      observer.observe({
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'layout-shift', 'first-input'],
      });

      return () => observer.disconnect();
    }
  }, []);

  const getPerformanceScore = useCallback(() => {
    const scores = {
      loadTime: metrics.loadTime < 2000 ? 100 : metrics.loadTime < 4000 ? 75 : 50,
      firstContentfulPaint: metrics.firstContentfulPaint < 1500 ? 100 : metrics.firstContentfulPaint < 2500 ? 75 : 50,
      largestContentfulPaint:
        metrics.largestContentfulPaint < 2500 ? 100 : metrics.largestContentfulPaint < 4000 ? 75 : 50,
      cumulativeLayoutShift: metrics.cumulativeLayoutShift < 0.1 ? 100 : metrics.cumulativeLayoutShift < 0.25 ? 75 : 50,
      firstInputDelay: metrics.firstInputDelay < 100 ? 100 : metrics.firstInputDelay < 300 ? 75 : 50,
    };

    const averageScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

    return {
      overall: Math.round(averageScore),
      breakdown: scores,
    };
  }, [metrics]);

  return {
    metrics,
    getPerformanceScore,
  };
};

// Utilidades para PWA
export const pwaUtils = {
  // Generar manifest dinámico
  generateManifest: (config: {
    name: string;
    shortName: string;
    description: string;
    themeColor: string;
    backgroundColor: string;
    icons: Array<{ src: string; sizes: string; type: string }>;
  }) => {
    return {
      name: config.name,
      short_name: config.shortName,
      description: config.description,
      start_url: '/',
      display: 'standalone',
      theme_color: config.themeColor,
      background_color: config.backgroundColor,
      icons: config.icons,
      categories: ['health', 'lifestyle', 'productivity'],
      lang: 'es',
      orientation: 'portrait',
    };
  },

  // Detectar dispositivo móvil
  isMobile: (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Detectar iOS
  isIOS: (): boolean => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  // Detectar Android
  isAndroid: (): boolean => {
    return /Android/.test(navigator.userAgent);
  },

  // Obtener información del dispositivo
  getDeviceInfo: () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
    };
  },
};

export default pwaUtils;
