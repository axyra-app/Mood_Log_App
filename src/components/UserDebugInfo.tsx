import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserDebugInfo: React.FC = () => {
  const { user } = useAuth();

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <div>
        <strong>UID:</strong> {user?.uid || 'No user'}
      </div>
      <div>
        <strong>Email:</strong> {user?.email || 'No email'}
      </div>
      <div>
        <strong>Role:</strong> {user?.role || 'No role'}
      </div>
      <div>
        <strong>Display Name:</strong> {user?.displayName || 'No display name'}
      </div>
      <div>
        <strong>Username:</strong> {user?.username || 'No username'}
      </div>
      {user?.role === 'psychologist' && (
        <div>
          <strong>Specialization:</strong> {user?.specialization || 'No specialization'}
        </div>
      )}
    </div>
  );
};

export default UserDebugInfo;
