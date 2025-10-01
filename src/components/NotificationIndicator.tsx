import { Bell } from 'lucide-react';
import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationCenter from './NotificationCenter';

interface NotificationIndicatorProps {
  userId: string;
  isDarkMode: boolean;
}

const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({ userId, isDarkMode }) => {
  const { unreadCount } = useNotifications(userId);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsNotificationCenterOpen(true)}
        className={`relative p-2 rounded-lg transition-colors ${
          isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <Bell className='w-6 h-6' />

        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter
        userId={userId}
        isDarkMode={isDarkMode}
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </>
  );
};

export default NotificationIndicator;
