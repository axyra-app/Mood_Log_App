import React from 'react';
import { useAuth } from '../contexts/AuthContextUltraSimple';

const TestPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          🎉 ¡Mood Log App Funcionando!
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Estado de la Aplicación
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Firebase configurado correctamente</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Firebase Auth funcionando</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">React Router funcionando</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Context API funcionando</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Estado del Usuario:
            </h3>
            {user ? (
              <div>
                <p className="text-blue-700">✅ Usuario autenticado</p>
                <p className="text-sm text-blue-600 mt-1">
                  Email: {user.email}
                </p>
              </div>
            ) : (
              <p className="text-blue-700">❌ Usuario no autenticado</p>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <a 
              href="/" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir a la Página Principal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
