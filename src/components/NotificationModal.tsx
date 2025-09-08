import React from 'react';
import Modal from './Modal';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  icon?: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, type, title, message, icon }) => {
  const getIcon = () => {
    if (icon) return icon;

    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='w-full max-w-md'>
        <div className={`p-6 rounded-2xl border-2 ${getBgColor()}`}>
          {/* Icon */}
          <div className='text-center mb-4'>
            <div className='text-6xl mb-2'>{getIcon()}</div>
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-black text-center mb-3 ${getTextColor()}`}>{title}</h2>

          {/* Message */}
          <p className={`text-center mb-6 ${getTextColor()}`}>{message}</p>

          {/* Button */}
          <div className='text-center'>
            <button
              onClick={onClose}
              className={`px-8 py-3 rounded-xl text-white font-bold transition-all duration-300 ${getButtonColor()}`}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationModal;
