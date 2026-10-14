import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import AdvancedReports from './components/AdvancedReports';
import ErrorBoundary from './components/ErrorBoundary';
import FloatingChatBubble from './components/FloatingChatBubble';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import AIChat from './pages/AIChat';
import ChatSelection from './pages/ChatSelection';
import CompleteProfile from './pages/CompleteProfile';
import DashboardSimple from './pages/DashboardSimple';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Journal from './pages/Journal';
import LoginSimple from './pages/LoginSimple';
import MoodFlowSimple from './pages/MoodFlowSimple';
import PrivacySimple from './pages/PrivacySimple';
import Profile from './pages/Profile';
import RegisterSimple from './pages/RegisterSimple';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';
import TermsSimple from './pages/TermsSimple';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className='App'>
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

                {/* Rutas específicas de Confidente IA */}
                <Route
                  path='/chat/dr-mia'
                  element={
                    <ProtectedRoute>
                      <AIChat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/chat/dr-bryan'
                  element={
                    <ProtectedRoute>
                      <AIChat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/chat/ai/:doctorType'
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
