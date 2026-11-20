import { useEffect } from 'react';
import { BarChart3, BookOpen, Heart, Home, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const tabs = [
  { label: 'Inicio', to: '/dashboard', icon: Home },
  { label: 'Ánimo', to: '/mood-flow', icon: Heart },
  { label: 'Diario', to: '/journal', icon: BookOpen },
  { label: 'Tendencias', to: '/statistics', icon: BarChart3 },
  { label: 'Perfil', to: '/profile', icon: User },
];

const mobileRoutes = new Set([
  '/dashboard',
  '/mood-flow',
  '/journal',
  '/statistics',
  '/reports',
  '/chat',
  '/profile',
  '/settings',
]);

const MobileBottomNav = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isVisible = Boolean(user && mobileRoutes.has(pathname));

  useEffect(() => {
    document.body.classList.toggle('has-mobile-bottom-nav', isVisible);
    return () => document.body.classList.remove('has-mobile-bottom-nav');
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <nav className='mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 flex items-stretch px-1 md:hidden' aria-label='Navegación principal'>
      {tabs.map(({ label, to, icon: Icon }) => {
        const isCurrent = pathname === to || (to === '/profile' && pathname === '/settings');

        return (
          <NavLink
            key={to}
            to={to}
            aria-current={isCurrent ? 'page' : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-[11px] font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 ${
              isCurrent ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <span className={`flex h-8 w-12 items-center justify-center rounded-2xl transition-colors ${isCurrent ? 'bg-purple-100 dark:bg-purple-900/40' : ''}`}>
              <Icon aria-hidden='true' className='h-5 w-5' strokeWidth={isCurrent ? 2.4 : 1.9} />
            </span>
            <span className='max-w-full truncate'>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
