import React from 'react';
import { X, Home, BarChart3, ShoppingBag, CheckSquare, FileText, Bell, Settings, Search } from 'lucide-react';

interface LateralSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const LateralSidebar: React.FC<LateralSidebarProps> = ({ isOpen, onClose, isDarkMode }) => {
  const menuItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingBag, label: 'Store', path: '/store', hasSubmenu: true, submenu: ['Products', 'Orders', 'Subscriptions'] },
    { icon: CheckSquare, label: 'Task', path: '/tasks' },
    { icon: FileText, label: 'Files', path: '/files' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/settings' },
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
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-lg">👻</span>
            </div>
            <span className="text-xl font-semibold">Ghostly</span>
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
        <div className="px-6 space-y-2">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index}>
                <button
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-left"
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.hasSubmenu && (
                    <span className="ml-auto">▼</span>
                  )}
                </button>
                
                {/* Submenu */}
                {item.hasSubmenu && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.submenu?.map((subItem, subIndex) => (
                      <button
                        key={subIndex}
                        className="w-full flex items-center px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors text-left text-sm text-gray-300"
                      >
                        {subItem}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default LateralSidebar;
