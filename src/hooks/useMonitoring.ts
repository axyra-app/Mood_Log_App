import { Timestamp, addDoc, collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../services/firebase';

// Tipos para el sistema de logs
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  id?: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: any;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
}

export interface PerformanceMetric {
  id?: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  metadata?: any;
}

export interface ErrorReport {
  id?: string;
  error: string;
  message: string;
  stack: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  component?: string;
  userAgent?: string;
  url?: string;
  resolved?: boolean;
}

// Hook principal para logging
export const useLogging = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generar ID de sesión único
  const sessionId = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)[0];

  // Crear log entry
  const log = useCallback(
    async (entry: Omit<LogEntry, 'id' | 'timestamp' | 'sessionId'>) => {
      try {
        const logEntry: LogEntry = {
          ...entry,
          timestamp: new Date(),
          sessionId,
          userAgent: navigator.userAgent,
          url: window.location.href,
        };

        // Agregar a Firestore
        await addDoc(collection(db, 'logs'), {
          ...logEntry,
          timestamp: Timestamp.fromDate(logEntry.timestamp),
        });

        // Agregar al estado local
        setLogs((prev) => [logEntry, ...prev.slice(0, 99)]); // Mantener solo los últimos 100 logs

        // Log a consola en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console[entry.level === 'critical' ? 'error' : entry.level](
            `[${entry.level.toUpperCase()}] ${entry.message}`,
            entry.metadata
          );
        }
      } catch (err: any) {
        console.error('Error logging entry:', err);
      }
    },
    [sessionId]
  );

  // Métodos de conveniencia
  const debug = useCallback(
    (message: string, metadata?: any, component?: string) => {
      log({ level: 'debug', message, metadata, component });
    },
    [log]
  );

  const info = useCallback(
    (message: string, metadata?: any, component?: string) => {
      log({ level: 'info', message, metadata, component });
    },
    [log]
  );

  const warn = useCallback(
    (message: string, metadata?: any, component?: string) => {
      log({ level: 'warn', message, metadata, component });
    },
    [log]
  );

  const error = useCallback(
    (message: string, metadata?: any, component?: string, stackTrace?: string) => {
      log({ level: 'error', message, metadata, component, stackTrace });
    },
    [log]
  );

  const critical = useCallback(
    (message: string, metadata?: any, component?: string, stackTrace?: string) => {
      log({ level: 'critical', message, metadata, component, stackTrace });
    },
    [log]
  );

  // Obtener logs
  const getLogs = useCallback(
    async (filters?: {
      level?: LogLevel;
      userId?: string;
      component?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }) => {
      try {
        setLoading(true);
        setError(null);

        let q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'));

        if (filters?.level) {
          q = query(q, where('level', '==', filters.level));
        }
        if (filters?.userId) {
          q = query(q, where('userId', '==', filters.userId));
        }
        if (filters?.component) {
          q = query(q, where('component', '==', filters.component));
        }
        if (filters?.limit) {
          q = query(q, limit(filters.limit));
        }

        const snapshot = await getDocs(q);
        const logsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as LogEntry[];

        setLogs(logsData);
        return logsData;
      } catch (err: any) {
        setError(err.message);
        console.error('Error getting logs:', err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    logs,
    loading,
    error,
    sessionId,
    log,
    debug,
    info,
    warn,
    error: error,
    critical,
    getLogs,
  };
};

// Hook para métricas de rendimiento
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registrar métrica
  const recordMetric = useCallback(async (metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) => {
    try {
      const metricEntry: PerformanceMetric = {
        ...metric,
        timestamp: new Date(),
      };

      await addDoc(collection(db, 'performanceMetrics'), {
        ...metricEntry,
        timestamp: Timestamp.fromDate(metricEntry.timestamp),
      });

      setMetrics((prev) => [metricEntry, ...prev.slice(0, 99)]);
    } catch (err: any) {
      console.error('Error recording metric:', err);
    }
  }, []);

  // Métricas comunes
  const recordPageLoadTime = useCallback(
    (loadTime: number, page: string) => {
      recordMetric({
        name: 'page_load_time',
        value: loadTime,
        unit: 'ms',
        metadata: { page },
      });
    },
    [recordMetric]
  );

  const recordApiResponseTime = useCallback(
    (responseTime: number, endpoint: string) => {
      recordMetric({
        name: 'api_response_time',
        value: responseTime,
        unit: 'ms',
        metadata: { endpoint },
      });
    },
    [recordMetric]
  );

  const recordMemoryUsage = useCallback(
    (memoryUsage: number) => {
      recordMetric({
        name: 'memory_usage',
        value: memoryUsage,
        unit: 'bytes',
      });
    },
    [recordMetric]
  );

  const recordUserInteraction = useCallback(
    (action: string, component: string, duration?: number) => {
      recordMetric({
        name: 'user_interaction',
        value: duration || 0,
        unit: 'ms',
        metadata: { action, component },
      });
    },
    [recordMetric]
  );

  // Monitorear rendimiento automáticamente
  useEffect(() => {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'navigation':
              const navEntry = entry as PerformanceNavigationTiming;
              recordPageLoadTime(navEntry.loadEventEnd - navEntry.loadEventStart, window.location.pathname);
              break;
            case 'measure':
              recordMetric({
                name: 'custom_measure',
                value: entry.duration,
                unit: 'ms',
                metadata: { name: entry.name },
              });
              break;
          }
        }
      });

      observer.observe({ entryTypes: ['navigation', 'measure'] });

      return () => observer.disconnect();
    }
  }, [recordPageLoadTime, recordMetric]);

  return {
    metrics,
    loading,
    error,
    recordMetric,
    recordPageLoadTime,
    recordApiResponseTime,
    recordMemoryUsage,
    recordUserInteraction,
  };
};

// Hook para reportes de errores
export const useErrorReporting = () => {
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reportar error
  const reportError = useCallback(async (errorReport: Omit<ErrorReport, 'id' | 'timestamp'>) => {
    try {
      const report: ErrorReport = {
        ...errorReport,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      await addDoc(collection(db, 'errorReports'), {
        ...report,
        timestamp: Timestamp.fromDate(report.timestamp),
      });

      setErrors((prev) => [report, ...prev.slice(0, 49)]); // Mantener solo los últimos 50 errores
    } catch (err: any) {
      console.error('Error reporting error:', err);
    }
  }, []);

  // Capturar errores de JavaScript
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reportError({
        error: event.error?.name || 'Unknown Error',
        message: event.message,
        stack: event.error?.stack || '',
        component: 'JavaScript',
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError({
        error: 'Unhandled Promise Rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack || '',
        component: 'Promise',
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [reportError]);

  // Obtener errores
  const getErrors = useCallback(
    async (filters?: { resolved?: boolean; userId?: string; component?: string; limit?: number }) => {
      try {
        setLoading(true);
        setError(null);

        let q = query(collection(db, 'errorReports'), orderBy('timestamp', 'desc'));

        if (filters?.resolved !== undefined) {
          q = query(q, where('resolved', '==', filters.resolved));
        }
        if (filters?.userId) {
          q = query(q, where('userId', '==', filters.userId));
        }
        if (filters?.component) {
          q = query(q, where('component', '==', filters.component));
        }
        if (filters?.limit) {
          q = query(q, limit(filters.limit));
        }

        const snapshot = await getDocs(q);
        const errorsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as ErrorReport[];

        setErrors(errorsData);
        return errorsData;
      } catch (err: any) {
        setError(err.message);
        console.error('Error getting errors:', err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [reportError]
  );

  return {
    errors,
    loading,
    error,
    reportError,
    getErrors,
  };
};

// Hook para analytics de usuario
export const useUserAnalytics = () => {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registrar evento de usuario
  const trackEvent = useCallback(
    async (event: {
      name: string;
      category: string;
      action: string;
      label?: string;
      value?: number;
      metadata?: any;
    }) => {
      try {
        const analyticsEntry = {
          ...event,
          timestamp: new Date(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        await addDoc(collection(db, 'userAnalytics'), {
          ...analyticsEntry,
          timestamp: Timestamp.fromDate(analyticsEntry.timestamp),
        });

        setAnalytics((prev) => [analyticsEntry, ...prev.slice(0, 99)]);
      } catch (err: any) {
        console.error('Error tracking event:', err);
      }
    },
    []
  );

  // Eventos comunes
  const trackPageView = useCallback(
    (page: string) => {
      trackEvent({
        name: 'page_view',
        category: 'navigation',
        action: 'view',
        label: page,
      });
    },
    [trackEvent]
  );

  const trackButtonClick = useCallback(
    (buttonName: string, component: string) => {
      trackEvent({
        name: 'button_click',
        category: 'interaction',
        action: 'click',
        label: buttonName,
        metadata: { component },
      });
    },
    [trackEvent]
  );

  const trackFormSubmit = useCallback(
    (formName: string, success: boolean) => {
      trackEvent({
        name: 'form_submit',
        category: 'form',
        action: 'submit',
        label: formName,
        value: success ? 1 : 0,
      });
    },
    [trackEvent]
  );

  const trackMoodLog = useCallback(
    (mood: number, method: string) => {
      trackEvent({
        name: 'mood_log',
        category: 'mood',
        action: 'log',
        label: method,
        value: mood,
      });
    },
    [trackEvent]
  );

  return {
    analytics,
    loading,
    error,
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackFormSubmit,
    trackMoodLog,
  };
};

// Utilidades para monitoreo
export const monitoringUtils = {
  // Obtener estadísticas de logs
  getLogStats: (logs: LogEntry[]) => {
    const stats = {
      total: logs.length,
      byLevel: {} as Record<LogLevel, number>,
      byComponent: {} as Record<string, number>,
      recentErrors: logs.filter((log) => log.level === 'error' || log.level === 'critical').length,
    };

    logs.forEach((log) => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      if (log.component) {
        stats.byComponent[log.component] = (stats.byComponent[log.component] || 0) + 1;
      }
    });

    return stats;
  },

  // Obtener estadísticas de rendimiento
  getPerformanceStats: (metrics: PerformanceMetric[]) => {
    const stats = {
      total: metrics.length,
      byName: {} as Record<string, { count: number; avg: number; min: number; max: number }>,
    };

    metrics.forEach((metric) => {
      if (!stats.byName[metric.name]) {
        stats.byName[metric.name] = { count: 0, avg: 0, min: Infinity, max: -Infinity };
      }

      const stat = stats.byName[metric.name];
      stat.count++;
      stat.min = Math.min(stat.min, metric.value);
      stat.max = Math.max(stat.max, metric.value);
      stat.avg = (stat.avg * (stat.count - 1) + metric.value) / stat.count;
    });

    return stats;
  },

  // Generar reporte de salud del sistema
  generateHealthReport: (logs: LogEntry[], metrics: PerformanceMetric[], errors: ErrorReport[]) => {
    const logStats = monitoringUtils.getLogStats(logs);
    const perfStats = monitoringUtils.getPerformanceStats(metrics);

    const healthScore = Math.max(
      0,
      100 -
        (logStats.recentErrors * 10 + // -10 por cada error reciente
          errors.length * 5 + // -5 por cada error no resuelto
          (perfStats.byName['page_load_time']?.avg > 3000 ? 20 : 0)) // -20 si carga lenta
    );

    return {
      healthScore,
      status: healthScore > 80 ? 'healthy' : healthScore > 60 ? 'warning' : 'critical',
      issues: [
        ...(logStats.recentErrors > 0 ? [`${logStats.recentErrors} errores recientes`] : []),
        ...(errors.length > 0 ? [`${errors.length} errores sin resolver`] : []),
        ...(perfStats.byName['page_load_time']?.avg > 3000 ? ['Tiempo de carga lento'] : []),
      ],
      recommendations: [
        ...(logStats.recentErrors > 0 ? ['Revisar logs de error recientes'] : []),
        ...(errors.length > 0 ? ['Resolver errores pendientes'] : []),
        ...(perfStats.byName['page_load_time']?.avg > 3000 ? ['Optimizar tiempo de carga'] : []),
      ],
    };
  },
};

export default monitoringUtils;
