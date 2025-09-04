import React, { useEffect, useState } from 'react';

const FirebaseStatus: React.FC = () => {
  const [status, setStatus] = useState<string>('Checking...');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // Dynamic import to avoid initialization issues
        const { auth, db } = await import('../lib/firebase');
        
        if (auth && db) {
          setStatus('✅ Firebase OK');
          setDetails('Auth & Firestore ready');
        } else {
          setStatus('❌ Firebase Error');
          setDetails('Services not available');
        }
      } catch (error) {
        setStatus('❌ Firebase Error');
        setDetails(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Firebase initialization error:', error);
      }
    };

    checkFirebase();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white',
      padding: '10px', 
      border: '1px solid #333',
      borderRadius: '5px',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '200px'
    }}>
      <div><strong>Firebase Status:</strong></div>
      <div>{status}</div>
      <div style={{ fontSize: '10px', marginTop: '5px' }}>{details}</div>
    </div>
  );
};

export default FirebaseStatus;
