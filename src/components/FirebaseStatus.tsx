import React, { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';

const FirebaseStatus: React.FC = () => {
  const [status, setStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkFirebase = () => {
      try {
        if (auth && db) {
          setStatus('✅ Firebase initialized successfully');
        } else {
          setStatus('❌ Firebase not initialized');
        }
      } catch (error) {
        setStatus(`❌ Firebase error: ${error}`);
      }
    };

    checkFirebase();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <strong>Firebase Status:</strong><br />
      {status}
    </div>
  );
};

export default FirebaseStatus;
