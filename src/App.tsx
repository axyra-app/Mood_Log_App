import React, { Suspense, useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRoutePsychologist from './components/ProtectedRoutePsychologist';
import UserDebugInfo from './components/UserDebugInfo';

// Lazy loading de páginas para optimizar bundle
import { LazyPages } from './hooks/useBundleOptimization';

// Analytics
import { analyticsEvents, initializeAnalytics } from './services/analytics';

// Debug (solo en desarrollo)
import DebugInfo from './components/DebugInfo';

// Componente de loading para lazy components
const PageLoadingFallback: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = false }) => (
  <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
    <div className='flex flex-col items-center space-y-4'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
      <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando página...</p>
    </div>
  </div>
);

// Componente para trackear cambios de ruta
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Trackear cada cambio de página
    const pageName = location.pathname === '/' ? 'Home' : location.pathname.substring(1);
    analyticsEvents.pageView(pageName, location.pathname);
  }, [location]);

  return null;
};
function App() {
  useEffect(() => {
    // Inicializar analytics cuando la app se carga
    initializeAnalytics();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className='App'>
            <AnalyticsTracker />
            <UserDebugInfo />
            <Routes>
              {/* Public routes */}
              <Route
                path='/'
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <LazyPages.Home />
                  </Suspense>
                }
              />
              <Route
                path='/login'
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <LazyPages.Login />
                  </Suspense>
                }
              />
              <Route
                path='/register'
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <LazyPages.Register />
                  </Suspense>
                }
              />
              <Route
                path='/complete-profile'
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <LazyPages.CompleteProfile />
                  </Suspense>
                }
              />
              <Route
                path='/forgot-password'
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <LazyPages.ForgotPassword />
                  </Suspense>
                }
              />
              <Route
                path='/terms'
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <LazyPages.Terms />
                  </Suspense>
                }
              />
              <Route
                path='/privacy'
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <LazyPages.Privacy />
                  </Suspense>
                }
              />

              {/* Protected routes */}
              <Route
                path='/dashboard'
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <LazyPages.Dashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/dashboard-psychologist'
                element={
                  <ProtectedRoutePsychologist>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <LazyPages.DashboardPsychologist />
                    </Suspense>
                  </ProtectedRoutePsychologist>
                }
              />
              <Route
                path='/mood-flow'
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <LazyPages.MoodFlow />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/statistics'
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <LazyPages.Statistics />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/chat'
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <LazyPages.Chat />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/settings'
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <LazyPages.Settings />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route
                path='*'
                element={
                  <div className='min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center'>
                    <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center'>
                      <div className='text-6xl mb-4'>🔍</div>
                      <h1 className='text-2xl font-bold text-white mb-4'>Página no encontrada</h1>
                      <p className='text-white/80 mb-6'>La página que buscas no existe</p>
                      <a
                        href='/'
                        className='bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-white/90 transition-all duration-200'
                      >
                        Volver al inicio
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
