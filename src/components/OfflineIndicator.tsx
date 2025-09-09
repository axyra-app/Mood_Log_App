import React from 'react';
import { useOffline } from '../hooks/useOffline';

const OfflineIndicator: React.FC = () => {
  const { status, isSyncing, handleSync } = useOffline();

  if (status.isOnline) {
    return null; // No mostrar nada si está online
  }

  return (
    <div className='fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium'>
      <div className='flex items-center justify-center space-x-2'>
        <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
        <span>Modo offline - Los datos se sincronizarán cuando vuelva la conexión</span>
        {status.pendingActions > 0 && (
          <span className='bg-yellow-600 px-2 py-1 rounded-full text-xs'>
            {status.pendingActions} pendiente{status.pendingActions !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export const SyncStatus: React.FC = () => {
  const { status, isSyncing, handleSync } = useOffline();

  if (status.isOnline && status.pendingActions === 0) {
    return null; // No mostrar nada si está todo sincronizado
  }

  return (
    <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <div className={`w-2 h-2 rounded-full ${status.isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span className='text-sm text-blue-800'>{status.isOnline ? 'Online' : 'Offline'}</span>
          {status.pendingActions > 0 && (
            <span className='text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full'>
              {status.pendingActions} acción{status.pendingActions !== 1 ? 'es' : ''} pendiente
              {status.pendingActions !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {status.isOnline && status.pendingActions > 0 && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className='text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        )}
      </div>

      {status.lastSync && (
        <div className='text-xs text-blue-600 mt-1'>Última sincronización: {status.lastSync.toLocaleString()}</div>
      )}
    </div>
  );
};

export default OfflineIndicator;
