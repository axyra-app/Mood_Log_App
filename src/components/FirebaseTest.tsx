import React, { useState } from 'react';
import { auth, db } from '../lib/firebase-new';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing Firebase...');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');

  const testFirebase = async () => {
    try {
      setStatus('Testing Firebase initialization...');
      
      if (!auth) {
        setStatus('❌ Firebase Auth not initialized');
        return;
      }
      
      if (!db) {
        setStatus('❌ Firebase Firestore not initialized');
        return;
      }
      
      setStatus('✅ Firebase initialized successfully');
      
      // Test registration
      setStatus('Testing user registration...');
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      setStatus(`✅ User registered: ${user.email}`);
      
      // Test Firestore
      setStatus('Testing Firestore...');
      await setDoc(doc(db, 'test', user.uid), {
        email: user.email,
        createdAt: new Date(),
      });
      setStatus('✅ Firestore write successful');
      
      // Test Firestore read
      const docSnap = await getDoc(doc(db, 'test', user.uid));
      if (docSnap.exists()) {
        setStatus('✅ Firestore read successful');
      } else {
        setStatus('❌ Firestore read failed');
      }
      
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      console.error('Firebase test error:', error);
    }
  };

  const testGoogleAuth = async () => {
    try {
      setStatus('Testing Google authentication...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setStatus(`✅ Google auth successful: ${result.user.email}`);
    } catch (error: any) {
      setStatus(`❌ Google auth error: ${error.message}`);
      console.error('Google auth error:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Firebase Test</h2>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Status: {status}</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="space-x-2">
          <button
            onClick={testFirebase}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Firebase
          </button>
          <button
            onClick={testGoogleAuth}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Test Google Auth
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;
