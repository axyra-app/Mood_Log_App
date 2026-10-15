import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import FloatingChatBubble from './components/FloatingChatBubble';
import ProtectedRoute from './components/ProtectedRoute';

const AdvancedReports = lazy(() => import('./components/AdvancedReports'));
const AIChat = lazy(() => import('./pages/AIChat'));
const ChatSelection = lazy(() => import('./pages/ChatSelection'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const DashboardSimple = lazy(() => import('./pages/DashboardSimple'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Home = lazy(() => import('./pages/Home'));
const Journal = lazy(() => import('./pages/Journal'));
const LoginSimple = lazy(() => import('./pages/LoginSimple'));
const MoodFlowSimple = lazy(() => import('./pages/MoodFlowSimple'));
const PrivacySimple = lazy(() => import('./pages/PrivacySimple'));
const Profile = lazy(() => import('./pages/Profile'));
const RegisterSimple = lazy(() => import('./pages/RegisterSimple'));
const Settings = lazy(() => import('./pages/Settings'));
const Statistics = lazy(() => import('./pages/Statistics'));
const TermsSimple = lazy(() => import('./pages/TermsSimple'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className='App'>
              <Suspense
                fallback={
                  <div className='min-h-screen flex items-center justify-center text-gray-600'>
                    Cargando...
                  </div>
                }
              >
                <Routes>
                {/* Public routes */}
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<LoginSimple />} />
                <Route path='/register' element={<RegisterSimple />} />
                <Route path='/complete-profile' element={<CompleteProfile />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/terms' element={<TermsSimple />} />
                <Route path='/privacy' element={<PrivacySimple />} />

                {/* Protected routes */}
                <Route
                  path='/dashboard'
                  element={
                    <ProtectedRoute>
                      <DashboardSimple />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/mood-flow'
                  element={
                    <ProtectedRoute>
                      <MoodFlowSimple />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/journal'
                  element={
                    <ProtectedRoute>
                      <Journal />
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
                  path='/reports'
                  element={
                    <ProtectedRoute>
                      <AdvancedReports />
                    </ProtectedRoute>
                  }
                />

                {/* Rutas de conversación de autorreflexión */}
                <Route
                  path='/chat/assistant/:assistantId'
                  element={
                    <ProtectedRoute>
                      <AIChat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/chat'
                  element={
                    <ProtectedRoute>
                      <ChatSelection />
                    </ProtectedRoute>
                  }
                />

                {/* Configuración y Perfil */}
                <Route
                  path='/profile'
                  element={
                    <ProtectedRoute>
                      <Profile />
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
              </Suspense>

              {/* Burbuja flotante de chat IA */}
              <FloatingChatBubble />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
