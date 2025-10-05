import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginDebug: React.FC = () => {
  const { user, loading, signIn, signInWithGoogle, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('LoginDebug: Form submitted', { email, password });
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('LoginDebug: Sign in error', error);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('LoginDebug: Google sign in clicked');
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('LoginDebug: Google sign in error', error);
    }
  };

  const handleLogout = async () => {
    console.log('LoginDebug: Logout clicked');
    try {
      await logout();
    } catch (error) {
      console.error('LoginDebug: Logout error', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login Debug
          </h2>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-sm font-medium text-gray-700">Estado de Autenticación:</h3>
            <p className="text-sm text-gray-600">Loading: {loading ? 'true' : 'false'}</p>
            <p className="text-sm text-gray-600">User: {user ? user.email : 'null'}</p>
            {user && (
              <p className="text-sm text-gray-600">Role: {user.role}</p>
            )}
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign In
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign In with Google
              </button>
            </div>

            {user && (
              <div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginDebug;
