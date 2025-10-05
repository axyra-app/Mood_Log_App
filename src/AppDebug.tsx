import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContextDebug';
import ProtectedRouteDebug from './components/ProtectedRouteDebug';
import LoginDebug from './pages/LoginDebug';
import AuthDebug from './components/AuthDebug';

const DashboardDebug: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-800">Dashboard Debug</h1>
        <p className="text-green-600 mt-4">¡Autenticación funcionando!</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className='App'>
          <AuthDebug />
          <Routes>
            <Route path='/login' element={<LoginDebug />} />
            <Route
              path='/dashboard'
              element={
                <ProtectedRouteDebug>
                  <DashboardDebug />
                </ProtectedRouteDebug>
              }
            />
            <Route path='/' element={<LoginDebug />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
