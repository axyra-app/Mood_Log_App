import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Home: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y título principal */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">😊</div>
          <h1 className="text-4xl font-bold text-white mb-2">Mood Log App</h1>
          <p className="text-white/90 text-lg">Rastrea tus emociones, mejora tu bienestar</p>
        </div>

        {/* Card principal */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {!showLogin && !showRegister && (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-6">¡Bienvenido!</h2>
              <p className="text-white/80 mb-8">¿Ya tienes una cuenta o quieres crear una nueva?</p>
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>🔑</span>
                  <span>Iniciar Sesión</span>
                </button>
                
                <button
                  onClick={() => setShowRegister(true)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>✨</span>
                  <span>Crear Cuenta</span>
                </button>
              </div>
            </div>
          )}

          {/* Formulario de Login */}
          {showLogin && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Iniciar Sesión</h2>
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-white/70 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="📧 Correo electrónico"
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="🔒 Contraseña"
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-white/90 transition-all duration-200"
                >
                  Iniciar Sesión
                </button>
              </form>
              
              <p className="text-center text-white/70 mt-4">
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                  }}
                  className="text-white font-semibold hover:underline"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          )}

          {/* Formulario de Registro */}
          {showRegister && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Crear Cuenta</h2>
                <button
                  onClick={() => setShowRegister(false)}
                  className="text-white/70 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="👤 Nombre completo"
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="📧 Correo electrónico"
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="🔒 Contraseña"
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="🔒 Confirmar contraseña"
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-white/90 transition-all duration-200"
                >
                  Crear Cuenta
                </button>
              </form>
              
              <p className="text-center text-white/70 mt-4">
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                  }}
                  className="text-white font-semibold hover:underline"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Características */}
        <div className="mt-8 text-center">
          <p className="text-white/80 text-sm mb-4">Características principales:</p>
          <div className="flex justify-center space-x-6 text-white/70">
            <span className="flex items-center space-x-1">
              <span>📊</span>
              <span className="text-sm">Seguimiento</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>🧠</span>
              <span className="text-sm">IA Insights</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>👨‍⚕️</span>
              <span className="text-sm">Profesionales</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;