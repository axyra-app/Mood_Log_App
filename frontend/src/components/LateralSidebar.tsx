import React from 'react';
import { X, BarChart3, Settings, Heart, MessageCircle, FileText, Search, Calendar, BookOpen, Users, Activity, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LateralSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const LateralSidebar: React.FC<LateralSidebarProps> = ({ isOpen, onClose, isDarkMode }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { 
      icon: Heart, 
      label: 'Registrar Estado de Ánimo', 
      path: '/mood-flow',
      description: 'Cómo te sientes hoy',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    { 
      icon: BarChart3, 
      label: 'Ver Estadísticas', 
      path: '/statistics',
      description: 'Tu progreso emocional',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    { 
      icon: MessageCircle, 
      label: 'Chat de Apoyo', 
      path: '/chat',
      description: 'IA o psicólogo real',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
    { 
      icon: FileText, 
      label: 'Reportes Avanzados', 
      path: '/reports',
      description: 'Análisis detallados',
      color: 'bg-gradient-to-r from-orange-500 to-amber-500'
    },
    { 
      icon: Settings, 
      label: 'Configuración', 
      path: '/settings',
      description: 'Personaliza tu experiencia',
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    { 
      icon: Calendar, 
      label: 'Mis Citas', 
      path: '/dashboard',
      description: 'Gestiona tus citas',
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500'
    },
    { 
      icon: BookOpen, 
      label: 'Mi Diario', 
      path: '/journal',
      description: 'Reflexiona sobre tu día',
      color: 'bg-gradient-to-r from-teal-500 to-blue-500'
    },
    { 
      icon: Users, 
      label: 'Psicólogos', 
      path: '/psychologists',
      description: 'Encuentra profesionales',
      color: 'bg-gradient-to-r from-pink-500 to-rose-500'
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold">Mood Log</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="px-6 space-y-3 overflow-y-auto flex-1">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Más Herramientas</h3>
          <div className="grid grid-cols-1 gap-3">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className={`${item.color} w-full p-4 rounded-xl text-white hover:scale-105 transition-transform duration-200 shadow-lg text-left`}
                >
                  <div className='flex items-center space-x-3 mb-2'>
                    <IconComponent className='w-5 h-5' />
                    <h4 className='font-semibold text-sm'>{item.label}</h4>
                  </div>
                  <p className='text-xs opacity-90'>{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default LateralSidebar;
