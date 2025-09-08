import React from 'react';
import Modal from './Modal';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon: string;
  features?: string[];
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  features = []
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center max-h-[50vh] overflow-y-auto">
        {/* Icon */}
        <div className="text-6xl mb-4 animate-pulse">
          {icon}
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-black text-gray-900 mb-3">
          {title}
        </h2>
        
        {/* Description */}
        <p className="text-base text-gray-600 mb-4 leading-relaxed">
          {description}
        </p>
        
        {/* Features */}
        {features.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              🚀 Próximas características:
            </h3>
            <ul className="text-left space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-600 text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Status */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-base font-bold text-gray-800">
              EN DESARROLLO
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Estamos trabajando duro para traerte esta funcionalidad
          </p>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
        >
          ¡ENTENDIDO!
        </button>
      </div>
    </Modal>
  );
};

export default ComingSoonModal;
