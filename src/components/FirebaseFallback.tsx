import React from 'react';
import { Link } from 'react-router-dom';

const FirebaseFallback: React.FC = () => {
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
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Configuración Pendiente</h2>
            <p className="text-white/80 mb-6">
              La aplicación necesita configuración de Firebase para funcionar completamente.
            </p>
            
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Pasos para completar la configuración:
              </h3>
              <ol className="text-sm text-yellow-700 text-left space-y-1">
                <li>1. Ve a Vercel Dashboard</li>
                <li>2. Configura las variables de Firebase</li>
                <li>3. Habilita Authentication en Firebase</li>
                <li>4. Crea una base de datos Firestore</li>
              </ol>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-white/90 transition-all duration-200"
              >
                Reintentar
              </button>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white/20 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 inline-block"
              >
                Configurar Firebase
              </a>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm mb-4">Características disponibles:</p>
          <div className="flex justify-center space-x-6 text-white/60 text-sm">
            <span>📊 Análisis IA</span>
            <span>💬 Chat</span>
            <span>📱 PWA</span>
            <span>🏆 Logros</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseFallback;
