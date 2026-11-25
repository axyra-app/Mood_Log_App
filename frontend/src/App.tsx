import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import FloatingChatBubble from './components/FloatingChatBubble';
import MobileBottomNav from './components/MobileBottomNav';
import InstallNotice from './components/InstallNotice';
import ProtectedRoute from './components/ProtectedRoute';
import { AI_FEATURES_ENABLED } from './services/aiApi';

const AdvancedReports = lazy(() => import('./components/AdvancedReports'));
const AgeConfirmation = lazy(() => import('./pages/AgeConfirmation'));
const AiPaused = lazy(() => import('./pages/AiPaused'));
const AIChat = lazy(() => import('./pages/AIChat'));
const ChatSelection = lazy(() => import('./pages/ChatSelection'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const DashboardSimple = lazy(() => import('./pages/DashboardSimple'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AccountAction = lazy(() => import('./pages/AccountAction'));
const Home = lazy(() => import('./pages/Home'));
const Journal = lazy(() => import('./pages/Journal'));
const LegalAcceptance = lazy(() => import('./pages/LegalAcceptance'));
const LoginSimple = lazy(() => import('./pages/LoginSimple'));
const MoodFlowSimple = lazy(() => import('./pages/MoodFlowSimple'));
const PrivacySimple = lazy(() => import('./pages/PrivacySimple'));
const Profile = lazy(() => import('./pages/Profile'));
const RegisterSimple = lazy(() => import('./pages/RegisterSimple'));
const Settings = lazy(() => import('./pages/Settings'));
const Statistics = lazy(() => import('./pages/Statistics'));
const SensitiveDataConsent = lazy(() => import('./pages/SensitiveDataConsent'));
const TermsSimple = lazy(() => import('./pages/TermsSimple'));
const HealthContextPrototype = import.meta.env.DEV
  ? lazy(() => import('./pages/dev/HealthContextPrototype'))
  : null;

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
                {HealthContextPrototype && (
                  <Route path='/__dev/health-context' element={<HealthContextPrototype />} />
                )}
                {/* Public routes */}
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<LoginSimple />} />
                <Route path='/register' element={<RegisterSimple />} />
                <Route path='/age-confirmation' element={<AgeConfirmation />} />
                <Route path='/legal-acceptance' element={<LegalAcceptance />} />
                <Route path='/sensitive-data-consent' element={<SensitiveDataConsent />} />
                <Route path='/complete-profile' element={
                  <ProtectedRoute allowIncompleteProfile>
                    <CompleteProfile />
                  </ProtectedRoute>
                } />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/account-action' element={<AccountAction />} />
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
                      {AI_FEATURES_ENABLED ? <AdvancedReports /> : <AiPaused />}
                    </ProtectedRoute>
                  }
                />

                {/* Rutas de conversación de autorreflexión */}
                <Route
                  path='/chat/assistant/:assistantId'
                  element={
                    <ProtectedRoute>
                      {AI_FEATURES_ENABLED ? <AIChat /> : <AiPaused />}
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/chat'
                  element={
                    <ProtectedRoute>
                      {AI_FEATURES_ENABLED ? <ChatSelection /> : <AiPaused />}
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

              <Toaster position='top-center' toastOptions={{
                duration: 6000,
                style: { background: 'var(--mood-surface)', color: 'var(--mood-text)', border: '1px solid var(--mood-border)', maxWidth: 'min(420px, calc(100vw - 32px))' },
              }} />
              <MobileBottomNav />
              <InstallNotice />

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
