import { ArrowLeft, Home, LogOut, Moon, Sun } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';
import { logSanitizedClientError } from '../utils/safeClientLog';

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
  backLabel = 'Volver al tablero',
  actions,
}) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // No mostrar en dashboard
  const isDashboard = location.pathname === '/dashboard';
  const shouldShowBackButton = showBackButton && !isDashboard;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      logSanitizedClientError('Header sign-out failed', error);
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
    <header className='mood-header sticky top-0 z-50 border-b border-[var(--mood-border)] shadow-sm safe-area-top'>
      <div className='max-w-7xl mx-auto mobile-padding'>
        <div className='flex flex-col gap-2 py-2 md:min-h-16 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0'>
          <div className='flex min-w-0 items-center justify-between gap-2'>
            <div className='flex min-w-0 items-center gap-1 sm:gap-3 md:gap-4'>
              <Logo size='sm' showText={false} />

              <button
                onClick={() => navigate('/dashboard')}
                className={`touch-target rounded-lg p-2 transition-colors ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title='Ir al tablero'
                aria-label='Ir al tablero'
              >
                <Home className='h-5 w-5' />
              </button>

              {shouldShowBackButton && (
                <button
                  onClick={handleBackClick}
                  className={`touch-target flex items-center rounded-lg p-2 transition-colors ${
                    isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  aria-label={backLabel}
                >
                  <ArrowLeft className='h-5 w-5 sm:mr-2' />
                  <span className='hidden sm:inline'>{backLabel}</span>
                </button>
              )}

              {(title || subtitle) && (
                <div className='hidden min-w-0 md:block'>
                  {title && (
                    <h1 className={`truncate text-lg font-semibold lg:text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
                  )}
                  {subtitle && <p className={`truncate text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{subtitle}</p>}
                </div>
              )}
            </div>

            <div className='flex shrink-0 items-center gap-1 sm:gap-2'>
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
                aria-label='Menú de mi cuenta'
                aria-expanded={showUserMenu}
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
                    Mi Cuenta
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

          {(title || subtitle) && (
            <div className='min-w-0 md:hidden'>
            {title && (
                <h1 className={`text-lg font-semibold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
            )}
            {subtitle && <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{subtitle}</p>}
            </div>
          )}

          {actions && (
            <div className='flex min-w-0 max-w-full flex-wrap items-center gap-2 md:justify-end'>
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
