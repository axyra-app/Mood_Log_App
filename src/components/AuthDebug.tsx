import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Auth Debug</h4>
      <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
      <p><strong>User:</strong> {user ? 'exists' : 'null'}</p>
      {user && (
        <>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>UID:</strong> {user.uid}</p>
        </>
      )}
    </div>
  );
};

export default AuthDebug;
