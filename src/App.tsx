import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Pages (solo las que existen)
import ForgotPassword from './pages/ForgotPassword';
import HomeSimple from './pages/HomeSimple';
import LoginSimple from './pages/LoginSimple';
import Privacy from './pages/Privacy';
import RegisterSimple from './pages/RegisterSimple';
import Terms from './pages/Terms';

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
          <Route path='/terms' element={<Terms />} />
          <Route path='/privacy' element={<Privacy />} />

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
