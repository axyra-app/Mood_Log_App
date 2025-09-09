import { Download, Monitor, Smartphone, X } from 'lucide-react';
import React, { useState } from 'react';
import { usePWA } from '../hooks/usePWA';

interface PWAInstallPromptProps {
  isDarkMode?: boolean;
  onClose?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ isDarkMode = false, onClose }) => {
  const { canInstall, isInstalled, isStandalone, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        setShowPrompt(false);
        onClose?.();
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    onClose?.();
  };

  // Don't show if already installed or not installable
  if (!canInstall || isInstalled || isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className='fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto'>
      <div
        className={`p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-lg ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700 text-white' : 'bg-white/90 border-gray-200 text-gray-900'
        }`}
      >
        <div className='flex items-start space-x-3'>
          <div className='flex-shrink-0'>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-purple-600' : 'bg-purple-500'
              }`}
            >
              <Download className='w-6 h-6 text-white' />
            </div>
          </div>

          <div className='flex-1 min-w-0'>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Instalar Mood Log</h3>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Instala la app para un acceso más rápido y una mejor experiencia
            </p>

            <div className='flex items-center space-x-4 mt-3'>
              <div className='flex items-center space-x-1 text-xs'>
                <Smartphone className='w-4 h-4' />
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Acceso rápido</span>
              </div>
              <div className='flex items-center space-x-1 text-xs'>
                <Monitor className='w-4 h-4' />
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Funciona offline</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
              isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        <div className='flex items-center space-x-3 mt-4'>
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
              isInstalling
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : isDarkMode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            {isInstalling ? 'Instalando...' : 'Instalar App'}
          </button>

          <button
            onClick={handleClose}
            className={`py-2 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
              isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
