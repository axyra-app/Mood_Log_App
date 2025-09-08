import React from 'react';
import { useAuth } from '../contexts/AuthContextMock';

const TestPageMock: React.FC = () => {
  const { user, loading, signIn, signOut } = useAuth();

  const handleTestLogin = async () => {
    try {
      await signIn('test@example.com', 'password123');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleTestLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          🎉 ¡Mood Log App - Versión Mock!
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Estado de la Aplicación (Sin Firebase)
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">React funcionando correctamente</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">React Router funcionando</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Context API funcionando</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700">Firebase temporalmente deshabilitado</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Estado del Usuario (Mock):
            </h3>
            {loading ? (
              <p className="text-blue-700">⏳ Cargando...</p>
            ) : user ? (
              <div>
                <p className="text-blue-700">✅ Usuario autenticado (Mock)</p>
                <p className="text-sm text-blue-600 mt-1">
                  Email: {user.email}
                </p>
                <p className="text-sm text-blue-600">
                  Nombre: {user.displayName}
                </p>
              </div>
            ) : (
              <p className="text-blue-700">❌ Usuario no autenticado</p>
            )}
          </div>
          
          <div className="mt-8 flex space-x-4">
            {!user ? (
              <button 
                onClick={handleTestLogin}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                🔐 Probar Login Mock
              </button>
            ) : (
              <button 
                onClick={handleTestLogout}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                🚪 Cerrar Sesión
              </button>
            )}
            
            <a 
              href="/" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🏠 Ir a la Página Principal
            </a>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              📝 Nota Importante:
            </h3>
            <p className="text-yellow-700">
              Esta es una versión de prueba que funciona sin Firebase para verificar que el resto de la aplicación funciona correctamente. 
              Una vez que confirmemos que React y el routing funcionan, podremos solucionar el problema de Firebase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPageMock;
