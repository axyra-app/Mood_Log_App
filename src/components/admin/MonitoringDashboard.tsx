import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  monitoringUtils,
  useErrorReporting,
  useLogging,
  usePerformanceMonitoring,
  useUserAnalytics,
} from '../hooks/useMonitoring';

interface MonitoringDashboardProps {
  isDarkMode: boolean;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const { logs, getLogs, loading: logsLoading } = useLogging();
  const { metrics, loading: metricsLoading } = usePerformanceMonitoring();
  const { errors, getErrors, loading: errorsLoading } = useErrorReporting();
  const { analytics, loading: analyticsLoading } = useUserAnalytics();

  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'performance' | 'errors' | 'analytics'>('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    if (user?.uid) {
      getLogs({ userId: user.uid, limit: 100 });
      getErrors({ userId: user.uid, limit: 50 });
    }
  }, [user?.uid, getLogs, getErrors]);

  const getTimeRangeFilter = () => {
    const now = new Date();
    const ranges = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
    return ranges[timeRange];
  };

  const filteredLogs = logs.filter((log) => log.timestamp >= getTimeRangeFilter());
  const filteredMetrics = metrics.filter((metric) => metric.timestamp >= getTimeRangeFilter());
  const filteredErrors = errors.filter((error) => error.timestamp >= getTimeRangeFilter());
  const filteredAnalytics = analytics.filter((analytic) => analytic.timestamp >= getTimeRangeFilter());

  const logStats = monitoringUtils.getLogStats(filteredLogs);
  const perfStats = monitoringUtils.getPerformanceStats(filteredMetrics);
  const healthReport = monitoringUtils.generateHealthReport(filteredLogs, filteredMetrics, filteredErrors);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'debug':
        return 'text-gray-600 bg-gray-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      case 'warn':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'critical':
        return 'text-red-800 bg-red-200';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className='mb-6'>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          📊 Dashboard de Monitoreo
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Monitorea el rendimiento y salud del sistema
        </p>
      </div>

      {/* Time Range Selector */}
      <div className='mb-6'>
        <div className={`flex space-x-2 p-1 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? isDarkMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-purple-600 shadow-sm'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === '1h' ? '1 hora' : range === '24h' ? '24 horas' : range === '7d' ? '7 días' : '30 días'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className={`mb-6 rounded-xl p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div className='flex space-x-1'>
          {[
            { id: 'overview', label: 'Resumen', icon: '📈' },
            { id: 'logs', label: 'Logs', icon: '📝' },
            { id: 'performance', label: 'Rendimiento', icon: '⚡' },
            { id: 'errors', label: 'Errores', icon: '🚨' },
            { id: 'analytics', label: 'Analytics', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? isDarkMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-purple-600 shadow-sm'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className='mr-2'>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className='space-y-6'>
          {/* Health Status */}
          <div
            className={`p-6 rounded-xl border-2 ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🏥 Estado de Salud del Sistema
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(healthReport.status)}`}>
                {healthReport.status.toUpperCase()}
              </div>
            </div>

            <div className='mb-4'>
              <div className='flex items-center justify-between mb-2'>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Puntuación de Salud
                </span>
                <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {healthReport.healthScore}/100
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    healthReport.healthScore > 80
                      ? 'bg-green-500'
                      : healthReport.healthScore > 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${healthReport.healthScore}%` }}
                />
              </div>
            </div>

            {healthReport.issues.length > 0 && (
              <div className='mb-4'>
                <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Problemas Detectados:
                </h4>
                <ul className='space-y-1'>
                  {healthReport.issues.map((issue, index) => (
                    <li key={index} className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      • {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {healthReport.recommendations.length > 0 && (
              <div>
                <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Recomendaciones:
                </h4>
                <ul className='space-y-1'>
                  {healthReport.recommendations.map((rec, index) => (
                    <li key={index} className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className='flex items-center justify-between'>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Logs</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {logStats.total}
                  </p>
                </div>
                <div className='text-2xl'>📝</div>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className='flex items-center justify-between'>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Errores Recientes
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {logStats.recentErrors}
                  </p>
                </div>
                <div className='text-2xl'>🚨</div>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className='flex items-center justify-between'>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Métricas de Rendimiento
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {perfStats.total}
                  </p>
                </div>
                <div className='text-2xl'>⚡</div>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className='flex items-center justify-between'>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Eventos de Usuario
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {filteredAnalytics.length}
                  </p>
                </div>
                <div className='text-2xl'>📊</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className='space-y-4'>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📝 Logs del Sistema
          </h3>

          {logsLoading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto'></div>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cargando logs...</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center space-x-3'>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      {log.component && (
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {log.component}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {log.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{log.message}</p>
                  {log.metadata && (
                    <pre
                      className={`mt-2 text-xs p-2 rounded ${
                        isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className='space-y-4'>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ⚡ Métricas de Rendimiento
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {Object.entries(perfStats.byName).map(([name, stats]) => (
              <div key={name} className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {name.replace(/_/g, ' ').toUpperCase()}
                </h4>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Promedio:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.avg.toFixed(2)}ms
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mínimo:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.min.toFixed(2)}ms
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Máximo:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.max.toFixed(2)}ms
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'errors' && (
        <div className='space-y-4'>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🚨 Reportes de Errores
          </h3>

          {errorsLoading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto'></div>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cargando errores...</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {filteredErrors.map((error, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center space-x-3'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          error.resolved ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                        }`}
                      >
                        {error.resolved ? 'RESUELTO' : 'PENDIENTE'}
                      </span>
                      {error.component && (
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {error.component}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {error.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{error.error}</h4>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{error.message}</p>
                  {error.stack && (
                    <details className='mt-2'>
                      <summary className={`text-sm cursor-pointer ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Ver Stack Trace
                      </summary>
                      <pre
                        className={`mt-2 text-xs p-2 rounded ${
                          isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className='space-y-4'>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Analytics de Usuario
          </h3>

          {analyticsLoading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto'></div>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cargando analytics...</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {filteredAnalytics.map((analytic, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center space-x-3'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isDarkMode ? 'bg-purple-100 text-purple-800' : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {analytic.category.toUpperCase()}
                      </span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {analytic.name}
                      </span>
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {analytic.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {analytic.action}
                    </span>
                    {analytic.value && (
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Valor: {analytic.value}
                      </span>
                    )}
                  </div>
                  {analytic.label && (
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{analytic.label}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonitoringDashboard;
