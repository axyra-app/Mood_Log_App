import { ArrowLeft, Bell, LogOut, Moon, Sun, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import Logo from './Logo';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  backTo = '/dashboard',
  backLabel = 'Volver al Dashboard',
  actions,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark' || false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { notifications, unreadCount } = useNotifications(user?.uid || '', user?.role || 'user');

  // No mostrar en dashboard
  const isDashboard = location.pathname === '/dashboard';
  const shouldShowBackButton = showBackButton && !isDashboard;

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const handleBackClick = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b sticky top-0 z-50 safe-area-top`}>
      <div className='max-w-7xl mx-auto mobile-padding'>
        <div className='flex items-center justify-between h-14 sm:h-16'>
          {/* Lado Izquierdo */}
          <div className='flex items-center space-x-4'>
            {/* Logo */}
            <Logo size='sm' showText={false} />

            {shouldShowBackButton && (
              <button
                onClick={handleBackClick}
                className={`flex items-center ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                } transition-colors`}
              >
                <ArrowLeft className='w-5 h-5 mr-2' />
                <span className='hidden sm:inline'>{backLabel}</span>
              </button>
            )}

            {(title || subtitle) && (
              <div className='hidden md:block'>
                {title && (
                  <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
                )}
                {subtitle && <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{subtitle}</p>}
              </div>
            )}
          </div>

          {/* Lado Derecho */}
          <div className='flex items-center space-x-2'>
            {/* Acciones personalizadas */}
            {actions}

            {/* Notificaciones */}
            <div className='relative'>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`touch-target p-2 rounded-lg transition-colors relative ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                {unreadCount > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Panel de Notificaciones */}
              {showNotifications && (
                <div className='absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50'>
                  <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
                    <div className='flex items-center justify-between'>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Notificaciones
                      </h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <X className='w-4 h-4 text-gray-500' />
                      </button>
                    </div>
                  </div>

                  <div className='max-h-96 overflow-y-auto'>
                    {notifications.length === 0 ? (
                      <div className='p-6 text-center'>
                        <Bell className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          No hay notificaciones
                        </p>
                      </div>
                    ) : (
                      <div className='divide-y divide-gray-200 dark:divide-gray-700'>
                        {notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              !notification.isRead ? (isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50') : ''
                            }`}
                          >
                            <div className='flex items-start space-x-3'>
                              <div className='flex-shrink-0'>
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    !notification.isRead ? 'bg-blue-500' : 'bg-gray-300'
                                  }`}
                                ></div>
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {notification.title}
                                </p>
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {notification.message}
                                </p>
                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {new Date(notification.createdAt).toLocaleDateString('es-CO')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {notifications.length > 5 && (
                    <div className='p-4 border-t border-gray-200 dark:border-gray-700'>
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/notifications');
                        }}
                        className={`w-full text-center text-sm ${
                          isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                        }`}
                      >
                        Ver todas las notificaciones
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cambio de Tema */}
            <button
              onClick={toggleDarkMode}
              className={`touch-target p-2 rounded-lg transition-colors ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDarkMode ? (
                <Sun className='w-4 h-4 sm:w-5 sm:h-5 text-yellow-500' />
              ) : (
                <Moon className='w-4 h-4 sm:w-5 sm:h-5 text-gray-600' />
              )}
            </button>

            {/* Menú de Usuario */}
            <div className='relative'>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`touch-target flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <div className='w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
                  <span className='text-white text-xs sm:text-sm font-medium'>
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className='hidden sm:block text-left'>
                  <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.displayName || 'Usuario'}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {user?.role === 'psychologist' ? 'Psicólogo' : 'Usuario'}
                  </p>
                </div>
              </button>

              {/* Menú Desplegable */}
              {showUserMenu && (
                <div className='absolute right-0 mt-2 w-44 sm:w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50'>
                  <div className='py-1'>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/settings');
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Configuración
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/profile');
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Mi Perfil
                    </button>
                    <hr className={`my-1 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'
                      } flex items-center space-x-2`}
                    >
                      <LogOut className='w-4 h-4' />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Título móvil */}
        {(title || subtitle) && (
          <div className='md:hidden pb-4'>
            {title && (
              <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
            )}
            {subtitle && <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{subtitle}</p>}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
