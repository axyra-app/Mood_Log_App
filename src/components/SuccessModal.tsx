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
      <div className="text-center max-h-[50vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-6xl mb-4 animate-bounce">
          {icon}
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-black text-gray-900 mb-3">
          {title}
        </h2>
        
        {/* Message */}
        <p className="text-base text-gray-600 mb-4 leading-relaxed">
          {message}
        </p>
        
        {/* Success Animation */}
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-base font-bold text-green-800">
              ¡OPERACIÓN EXITOSA!
            </span>
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-2 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
        >
          ¡PERFECTO!
        </button>
      </div>
    </Modal>
  );
};

export default SuccessModal;
