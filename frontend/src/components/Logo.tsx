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
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizes.container} bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm`}>
        <svg 
          className={`${sizes.icon} text-white`}
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Custom Mood Log App Icon */}
          <path 
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
            fill="currentColor"
          />
          {/* Heart shape for mood */}
          <path 
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
            fill="currentColor"
            opacity="0.3"
          />
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizes.text} font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
            Mood Log
          </span>
          <span className={`${sizes.text === 'text-sm' ? 'text-xs' : sizes.text === 'text-base' ? 'text-sm' : sizes.text === 'text-xl' ? 'text-sm' : 'text-base'} text-gray-500 font-medium`}>
            App
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
