import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Cargando...</p>
        </div>
      </div>
    );
  }

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
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-6">¡Bienvenido!</h2>
            <p className="text-white/80 mb-8">¿Ya tienes una cuenta o quieres crear una nueva?</p>
            
            <div className="space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-white/90 transition-all duration-200"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-white/20 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm mb-4">Características principales:</p>
          <div className="flex justify-center space-x-6 text-white/60 text-sm">
            <span>📊 Análisis IA</span>
            <span>💬 Chat</span>
            <span>📱 PWA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
