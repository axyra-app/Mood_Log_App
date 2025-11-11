import { BarChart3, BookOpen, FileText, Heart, MessageCircle, X } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

interface LateralSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const LateralSidebar: React.FC<LateralSidebarProps> = ({ isOpen, onClose, isDarkMode }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: BookOpen,
      label: 'Mi Diario',
      path: '/journal',
      description: 'Reflexiona sobre tu día',
      color: 'bg-gradient-to-r from-teal-500 to-blue-500',
    },
    {
      icon: Heart,
      label: 'Registrar Estado de Ánimo',
      path: '/mood-flow',
      description: 'Cómo te sientes hoy',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    },
    {
      icon: MessageCircle,
      label: 'Chat de Apoyo',
      path: '/chat',
      description: 'IA o psicólogo real',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      label: 'Ver Estadísticas',
      path: '/statistics',
      description: 'Tu progreso emocional',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      label: 'Reportes Avanzados',
      path: '/reports',
      description: 'Análisis detallados',
      color: 'bg-gradient-to-r from-orange-500 to-amber-500',
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className='fixed inset-0 bg-black bg-opacity-50 z-40' onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-72 sm:w-80 md:w-96 flex flex-col safe-area-left`}
      >
        {/* Header */}
        <div className='flex items-center justify-between mobile-card border-b border-gray-700 flex-shrink-0'>
          <Logo size='md' showText={true} className='text-white' />
          <button onClick={onClose} className='touch-target p-2 hover:bg-gray-700 rounded-lg transition-colors'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Menu Items - Scrollable */}
        <div className='flex-1 overflow-hidden flex flex-col'>
          <div className='mobile-padding py-4 flex-shrink-0'>
            <h3 className='mobile-heading font-semibold text-gray-300 mb-4'>Más Herramientas</h3>
          </div>
          <div
            className='flex-1 mobile-padding pb-6 overflow-y-auto overflow-x-hidden'
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            <div className='space-y-3'>
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                    className={`${item.color} w-full mobile-card rounded-xl text-white hover:scale-105 transition-transform duration-200 shadow-lg text-left touch-target p-4`}
                  >
                    <div className='flex items-center space-x-3 mb-2'>
                      <IconComponent className='w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0' />
                      <h4 className='font-semibold mobile-text text-base sm:text-lg'>{item.label}</h4>
                    </div>
                    <p className='text-xs sm:text-sm opacity-90'>{item.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LateralSidebar;
