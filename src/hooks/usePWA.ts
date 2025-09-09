import { useCallback, useEffect, useState } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check if app is already installed
  const checkIfInstalled = useCallback(() => {
    // Check if running in standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isInStandaloneMode = (window.navigator as any).standalone === true;
    const isInApp =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode || isInStandaloneMode || isInApp);
    setIsInstalled(isStandaloneMode || isInStandaloneMode || isInApp);
  }, []);

  // Check if app is installable
  const checkInstallability = useCallback(() => {
    // Check if beforeinstallprompt event is supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // Check if app meets installability criteria
      const hasServiceWorker = navigator.serviceWorker.controller !== null;
      const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
      const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';

      return hasServiceWorker && hasManifest && isHTTPS;
    }
    return false;
  }, []);

  // Install the app
  const installApp = useCallback(async () => {
    if (!installPrompt) {
      throw new Error('App is not installable');
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error installing app:', error);
      throw error;
    }
  }, [installPrompt]);

  // Check online status
  const checkOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Check initial state
    checkIfInstalled();
    setIsInstallable(checkInstallability());

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as any);
      setIsInstallable(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkIfInstalled, checkInstallability]);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    } else {
      throw new Error('Service Workers are not supported in this browser');
    }
  }, []);

  // Unregister service worker
  const unregisterServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
        console.log('Service Workers unregistered successfully');
      } catch (error) {
        console.error('Error unregistering Service Workers:', error);
        throw error;
      }
    }
  }, []);

  // Check if app can be updated
  const checkForUpdate = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error checking for update:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Get app info
  const getAppInfo = useCallback(() => {
    return {
      isInstallable,
      isInstalled,
      isStandalone,
      isOnline,
      hasInstallPrompt: installPrompt !== null,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: (typeof navigator !== 'undefined' && navigator.language) || 'es',
    };
  }, [isInstallable, isInstalled, isStandalone, isOnline, installPrompt]);

  // Show install prompt
  const showInstallPrompt = useCallback(() => {
    if (installPrompt) {
      return installApp();
    }
    return Promise.resolve(false);
  }, [installPrompt, installApp]);

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    isOnline,
    installPrompt,
    installApp,
    showInstallPrompt,
    registerServiceWorker,
    unregisterServiceWorker,
    checkForUpdate,
    getAppInfo,
    checkIfInstalled,
    checkInstallability,
  };
};
