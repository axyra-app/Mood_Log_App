import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugInfo: React.FC = () => {
  const { user, loading } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className='fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50'>
      <h3 className='font-bold mb-2'>Debug Info</h3>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? 'exists' : 'null'}</div>
      <div>Role: {user?.role || 'undefined'}</div>
      <div>Email: {user?.email || 'undefined'}</div>
      <div>UID: {user?.uid || 'undefined'}</div>
      <div>Professional Title: {user?.professionalTitle || 'undefined'}</div>
      <div>Specialization: {user?.specialization || 'undefined'}</div>
    </div>
  );
};

export default DebugInfo;
