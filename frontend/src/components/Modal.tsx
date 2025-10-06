import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isDarkMode?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, isDarkMode = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-2xl rounded-3xl border-4 transition-all duration-300 transform ${
        isDarkMode
          ? 'bg-gray-900 border-purple-500 shadow-2xl shadow-purple-500/50'
          : 'bg-white border-purple-500 shadow-2xl shadow-purple-500/50'
      }`}>
        {/* Header */}
        <div className={`p-8 border-b-4 ${
          isDarkMode ? 'border-purple-500' : 'border-purple-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-3xl font-black transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                isDarkMode
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8">
          {children}
        </div>
        
        {/* Footer */}
        <div className={`p-8 border-t-4 ${
          isDarkMode ? 'border-purple-500' : 'border-purple-200'
        }`}>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xl uppercase tracking-wider py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
          >
            ACEPTAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
