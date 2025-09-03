import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';

const OfflineIndicator = () => {
  const { isOnline, pendingItems, lastSync, syncPendingData } = useOffline();

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';

    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  };

  if (isOnline && pendingItems === 0) {
    return null; // Don't show indicator when online and synced
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isOnline ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
      } border rounded-lg shadow-lg p-3 max-w-sm`}
    >
      <div className='flex items-center space-x-3'>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isOnline ? 'bg-blue-100' : 'bg-orange-100'
          }`}
        >
          {isOnline ? (
            <Wifi className={`w-4 h-4 ${pendingItems > 0 ? 'text-blue-600' : 'text-green-600'}`} />
          ) : (
            <WifiOff className='w-4 h-4 text-orange-600' />
          )}
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center space-x-2'>
            <p className={`text-sm font-medium ${isOnline ? 'text-blue-800' : 'text-orange-800'}`}>
              {isOnline ? 'En línea' : 'Sin conexión'}
            </p>

            {pendingItems > 0 && (
              <span className='bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full'>
                {pendingItems} pendiente{pendingItems > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {isOnline && pendingItems > 0 && (
            <div className='mt-1'>
              <p className='text-xs text-blue-600'>Última sincronización: {formatLastSync(lastSync)}</p>
              <button
                onClick={syncPendingData}
                className='mt-1 flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 transition-colors'
              >
                <RefreshCw className='w-3 h-3' />
                <span>Sincronizar ahora</span>
              </button>
            </div>
          )}

          {!isOnline && (
            <p className='text-xs text-orange-600 mt-1'>
              Los datos se guardarán localmente y se sincronizarán cuando vuelvas a conectarte.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
