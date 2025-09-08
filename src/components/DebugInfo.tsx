import React from 'react';

const DebugInfo: React.FC = () => {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Information</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">VITE_FIREBASE_API_KEY:</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'NOT SET'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">VITE_FIREBASE_AUTH_DOMAIN:</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {firebaseConfig.authDomain || 'NOT SET'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">VITE_FIREBASE_PROJECT_ID:</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {firebaseConfig.projectId || 'NOT SET'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">VITE_FIREBASE_STORAGE_BUCKET:</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {firebaseConfig.storageBucket || 'NOT SET'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">VITE_FIREBASE_MESSAGING_SENDER_ID:</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {firebaseConfig.messagingSenderId || 'NOT SET'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">VITE_FIREBASE_APP_ID:</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : 'NOT SET'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">VITE_FIREBASE_MEASUREMENT_ID:</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {firebaseConfig.measurementId || 'NOT SET'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">VITE_OPENAI_API_KEY:</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {openaiKey ? `${openaiKey.substring(0, 10)}...` : 'NOT SET'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Info</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">NODE_ENV:</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {import.meta.env.MODE}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">PROD:</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {import.meta.env.PROD ? 'true' : 'false'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">DEV:</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {import.meta.env.DEV ? 'true' : 'false'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;
