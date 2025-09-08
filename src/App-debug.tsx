import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Pages (solo las que existen)
import HomeSimple from './pages/HomeSimple';
import LoginSimple from './pages/LoginSimple';
import RegisterSimple from './pages/RegisterSimple';
import ForgotPassword from './pages/ForgotPassword';
import TermsSimple from './pages/TermsSimple';
import PrivacySimple from './pages/PrivacySimple';

function App() {
  return (
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
          
          {/* Debug routes */}
          <Route path='/dashboard' element={
            <div className="min-h-screen bg-white flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard Debug</h1>
                <p className="text-gray-600">Esta es una versión de debug sin Firebase</p>
                <a href="/" className="text-purple-600 hover:underline">Volver al inicio</a>
              </div>
            </div>
          } />
          <Route path='/mood-flow' element={
            <div className="min-h-screen bg-white flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">MoodFlow Debug</h1>
                <p className="text-gray-600">Esta es una versión de debug sin Firebase</p>
                <a href="/" className="text-purple-600 hover:underline">Volver al inicio</a>
              </div>
            </div>
          } />

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
  );
}

export default App;
