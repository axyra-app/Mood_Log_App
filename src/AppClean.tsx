import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple pages without Firebase
const HomePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">🎉 Mood Log App</h1>
        <p className="text-gray-600 mb-6">Rastrea tus emociones, mejora tu bienestar</p>
        
        <div className="space-y-4">
          <a 
            href="/test-clean" 
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            🧪 Probar Aplicación
          </a>
          
          <a 
            href="/login-clean" 
            className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            🔐 Iniciar Sesión
          </a>
          
          <a 
            href="/register-clean" 
            className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
          >
            📝 Registrarse
          </a>
        </div>
      </div>
    </div>
  </div>
);

const TestPage = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        🎉 ¡Aplicación Funcionando!
      </h1>
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Estado de la Aplicación
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">✅ React funcionando correctamente</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">✅ React Router funcionando</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">✅ Tailwind CSS funcionando</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">✅ Vite build funcionando</span>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            🎯 ¡Éxito!
          </h3>
          <p className="text-green-700">
            La aplicación está funcionando correctamente. El problema era con Firebase, no con React.
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🏠 Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  </div>
);

const LoginPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Iniciar Sesión</h1>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tu@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input 
            type="password" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Iniciar Sesión
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <a href="/" className="text-blue-600 hover:text-blue-800">← Volver al inicio</a>
      </div>
    </div>
  </div>
);

const RegisterPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Registrarse</h1>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tu nombre"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tu@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input 
            type="password" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        
        <button 
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          Registrarse
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <a href="/" className="text-blue-600 hover:text-blue-800">← Volver al inicio</a>
      </div>
    </div>
  </div>
);

function AppClean() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test-clean" element={<TestPage />} />
          <Route path="/login-clean" element={<LoginPage />} />
          <Route path="/register-clean" element={<RegisterPage />} />
          
          {/* Catch all route */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600 mb-6">Página no encontrada</p>
                <a href="/" className="text-blue-600 hover:text-blue-800">← Volver al inicio</a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default AppClean;
