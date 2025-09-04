import React, { useEffect, useState } from 'react';

const FirebaseStatus: React.FC = () => {
  const [status, setStatus] = useState<string>('Checking...');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    const checkFirebase = () => {
      try {
        // Check if Firebase is available globally
        if (typeof window !== 'undefined' && (window as any).firebase) {
          setStatus('✅ Firebase Global');
          setDetails('Firebase available globally');
          return;
        }

        // Try to import Firebase
        import('../lib/firebase').then(({ auth, db }) => {
          if (auth && db) {
            setStatus('✅ Firebase OK');
            setDetails('Auth & Firestore ready');
          } else {
            setStatus('⚠️ Firebase Partial');
            setDetails('Some services unavailable');
          }
        }).catch((error) => {
          setStatus('❌ Firebase Error');
          setDetails(`Import failed: ${error.message}`);
          console.error('Firebase import error:', error);
        });
        
      } catch (error) {
        setStatus('❌ Firebase Error');
        setDetails(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Firebase check error:', error);
      }
    };

    // Check immediately
    checkFirebase();
    
    // Check again after a delay
    const timeout = setTimeout(checkFirebase, 2000);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.9)', 
      color: 'white',
      padding: '12px', 
      border: '2px solid #333',
      borderRadius: '8px',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '220px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Firebase Status:</div>
      <div style={{ marginBottom: '4px' }}>{status}</div>
      <div style={{ fontSize: '10px', opacity: 0.8 }}>{details}</div>
    </div>
  );
};

export default FirebaseStatus;
