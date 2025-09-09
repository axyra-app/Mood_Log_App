import { WifiOff } from 'lucide-react';
import React, { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface ConnectionStatusProps {
  isDarkMode?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isDarkMode = false }) => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const { showSuccess, showWarning } = useNotifications();

  useEffect(() => {
    if (wasOffline && isOnline) {
      showSuccess('Conexión restaurada', 'Ya estás conectado nuevamente');
    } else if (!isOnline) {
      showWarning('Sin conexión', 'Algunas funciones pueden estar limitadas');
    }
  }, [isOnline, wasOffline, showSuccess, showWarning]);

  if (isOnline) {
    return null;
  }

  return (
    <div className='fixed top-4 left-4 z-50'>
      <div
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 ${
          isDarkMode ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
        }`}
      >
        <WifiOff className='w-4 h-4' />
        <span className='text-sm font-medium'>Sin conexión</span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
