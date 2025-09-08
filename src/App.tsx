import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Contexts
import { AuthProvider } from './contexts/AuthContextSimple';

// Pages (solo las que existen)
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import HomeSimple from './pages/HomeSimple';
import Login from './pages/Login';
import MoodFlow from './pages/MoodFlow';
import Privacy from './pages/Privacy';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';
import Terms from './pages/Terms';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 1 * 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className='App'>
              <Routes>
              {/* Public routes */}
              <Route path='/' element={<HomeSimple />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/terms' element={<Terms />} />
              <Route path='/privacy' element={<Privacy />} />

              {/* Protected routes */}
              <Route
                path='/dashboard'
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/mood-flow'
                element={
                  <ProtectedRoute>
                    <MoodFlow />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/statistics'
                element={
                  <ProtectedRoute>
                    <Statistics />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/chat'
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/settings'
                element={
                  <ProtectedRoute>
                    <Settings />
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
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
