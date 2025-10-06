import React from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDarkMode: boolean;
  loading?: boolean;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDarkMode,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`relative w-full max-w-md mx-auto transform transition-all duration-300 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Modal Content */}
        <div className={`relative rounded-3xl shadow-2xl border-2 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className="p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
              <span className="text-4xl">🚪</span>
            </div>
            
            {/* Title */}
            <h2 className={`text-2xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ¿Cerrar Sesión?
            </h2>
            
            {/* Message */}
            <p className={`text-lg ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              ¿Estás seguro de que quieres cerrar sesión?<br />
              <span className="text-sm opacity-75">
                Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Cancel Button */}
              <button
                onClick={onClose}
                disabled={loading}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancelar
              </button>
              
              {/* Confirm Button */}
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/25 ${
                  loading ? 'animate-pulse' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Cerrando...</span>
                  </div>
                ) : (
                  'Sí, Cerrar Sesión'
                )}
              </button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
