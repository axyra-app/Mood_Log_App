import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-6 h-6',
          text: 'text-sm',
          icon: 'w-4 h-4'
        };
      case 'md':
        return {
          container: 'w-8 h-8',
          text: 'text-base',
          icon: 'w-5 h-5'
        };
      case 'lg':
        return {
          container: 'w-12 h-12',
          text: 'text-xl',
          icon: 'w-6 h-6'
        };
      case 'xl':
        return {
          container: 'w-16 h-16',
          text: 'text-2xl',
          icon: 'w-8 h-8'
        };
      default:
        return {
          container: 'w-8 h-8',
          text: 'text-base',
          icon: 'w-5 h-5'
        };
    }
  };

  const sizes = getSizeClasses();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizes.container} bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
        <svg 
          className={`${sizes.icon} text-white`}
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Checkmark icon */}
          <path 
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" 
            fill="currentColor"
          />
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizes.text} font-bold text-purple-600 leading-tight`}>
            Mood Log
          </span>
          <span className={`${sizes.text === 'text-sm' ? 'text-xs' : sizes.text === 'text-base' ? 'text-sm' : sizes.text === 'text-xl' ? 'text-sm' : 'text-base'} text-gray-600 font-medium leading-tight`}>
            App
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
