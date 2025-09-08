import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Contexts
import { AuthProvider } from './contexts/AuthContext-debug';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedDashboard from './components/RoleBasedDashboard';

// Pages (solo las que existen)
import DashboardSimple from './pages/DashboardSimple';
import DashboardPsychologist from './pages/DashboardPsychologist';
import ForgotPassword from './pages/ForgotPassword';
import HomeSimple from './pages/HomeSimple';
import LoginSimple from './pages/LoginSimple';
import MoodFlowSimple from './pages/MoodFlowSimple';
import PrivacySimple from './pages/PrivacySimple';
import RegisterSimple from './pages/RegisterSimple';
import TermsSimple from './pages/TermsSimple';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className='App'>
          <Routes>
            {/* Public routes */}
            <Route path='/' element={<HomeSimple />} />
            <Route path='/login' element={<LoginSimple />} />
            <Route path='/register' element={<RegisterSimple />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/terms' element={<TermsSimple />} />
            <Route path='/privacy' element={<PrivacySimple />} />

            {/* Protected routes */}
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <RoleBasedDashboard />
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
  );
}

export default App;
