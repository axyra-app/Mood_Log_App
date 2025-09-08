import React from 'react';
import Modal from './Modal';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  icon = '✅'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        {/* Icon */}
        <div className="text-8xl mb-6 animate-bounce">
          {icon}
        </div>
        
        {/* Title */}
        <h2 className="text-3xl font-black text-gray-900 mb-4">
          {title}
        </h2>
        
        {/* Message */}
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>
        
        {/* Success Animation */}
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-bold text-green-800">
              ¡OPERACIÓN EXITOSA!
            </span>
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-8 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
        >
          ¡PERFECTO!
        </button>
      </div>
    </Modal>
  );
};

export default SuccessModal;
