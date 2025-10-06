/**
 * Performance configuration for Mood Log App
 * Optimizes bundle size and runtime performance
 */

// Lazy loading configuration
export const LAZY_LOADING_CONFIG = {
  // Components to lazy load
  lazyComponents: [
    'AdvancedAnalytics',
    'AdvancedAIInsights',
    'ChatInterface',
    'AnalyticsDashboard',
    'PatientManagement',
    'SessionNotes',
    'TreatmentPlans',
    'AppointmentsCalendar',
  ],
  
  // Delay for lazy loading (ms)
  loadingDelay: 200,
  
  // Fallback component for loading states
  fallbackComponent: 'LoadingSpinner',
};

// Bundle optimization
export const BUNDLE_CONFIG = {
  // Chunk size limits
  maxChunkSize: 250000, // 250KB
  
  // Preload critical resources
  preloadResources: [
    '/manifest.json',
    '/pwa-192x192.png',
    '/pwa-512x512.png',
  ],
  
  // Critical CSS classes
  criticalCSS: [
    'bg-gradient-to-br',
    'from-purple-400',
    'via-pink-500',
    'to-red-500',
    'min-h-screen',
    'flex',
    'items-center',
    'justify-center',
  ],
};

// Performance monitoring
export const PERFORMANCE_CONFIG = {
  // Metrics to track
  metrics: {
    renderTime: true,
    memoryUsage: true,
    networkRequests: true,
    bundleSize: true,
  },
  
  // Performance thresholds
  thresholds: {
    renderTime: 16, // ms (60fps)
    memoryUsage: 50 * 1024 * 1024, // 50MB
    networkTimeout: 5000, // 5s
  },
  
  // Performance reporting
  reporting: {
    enabled: true,
    endpoint: '/api/performance',
    batchSize: 10,
    flushInterval: 30000, // 30s
  },
};

// Cache configuration
export const CACHE_CONFIG = {
  // Service worker cache
  swCache: {
    maxAge: 86400, // 24 hours
    maxEntries: 100,
    strategy: 'cacheFirst',
  },
  
  // Memory cache
  memoryCache: {
    maxSize: 50, // MB
    ttl: 300000, // 5 minutes
  },
  
  // Local storage cache
  localStorageCache: {
    maxSize: 10, // MB
    ttl: 3600000, // 1 hour
  },
};

// Optimization flags
export const OPTIMIZATION_FLAGS = {
  // Enable/disable optimizations
  enableLazyLoading: true,
  enableCodeSplitting: true,
  enableTreeShaking: true,
  enableMinification: true,
  enableCompression: true,
  
  // Development optimizations
  enableHotReload: import.meta.env.DEV,
  enableSourceMaps: import.meta.env.DEV,
  enableDebugInfo: import.meta.env.DEV,
};
