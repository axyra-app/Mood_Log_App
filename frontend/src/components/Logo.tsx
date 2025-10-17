import React, { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('/favicon.svg');

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-6 h-6',
          text: 'text-sm',
          image: 'w-6 h-6',
        };
      case 'md':
        return {
          container: 'w-8 h-8',
          text: 'text-base',
          image: 'w-8 h-8',
        };
      case 'lg':
        return {
          container: 'w-12 h-12',
          text: 'text-xl',
          image: 'w-12 h-12',
        };
      case 'xl':
        return {
          container: 'w-16 h-16',
          text: 'text-2xl',
          image: 'w-16 h-16',
        };
      default:
        return {
          container: 'w-8 h-8',
          text: 'text-base',
          image: 'w-8 h-8',
        };
    }
  };

  const sizes = getSizeClasses();

  const handleImageError = () => {
    console.log('Error loading logo, trying fallback...');
    if (currentSrc === '/favicon.svg') {
      setCurrentSrc('/Logo_Mood_log_app.png');
    } else if (currentSrc === '/Logo_Mood_log_app.png') {
      setCurrentSrc('/favicon.png');
    } else {
      setImageError(true);
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Image with fallback */}
      {!imageError ? (
        <img
          src={currentSrc}
          alt="Mood Log App Logo"
          className={`${sizes.image} rounded-lg flex-shrink-0`}
          onError={handleImageError}
          onLoad={() => console.log('Logo loaded successfully:', currentSrc)}
        />
      ) : (
        // Fallback: Simple gradient circle with initials
        <div className={`${sizes.image} rounded-lg flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center`}>
          <span className="text-white font-bold text-xs">ML</span>
        </div>
      )}

      {/* Logo Text */}
      {showText && (
        <div className='flex flex-col'>
          <span className={`${sizes.text} font-bold text-purple-600 leading-tight`}>Mood Log</span>
          <span
            className={`${
              sizes.text === 'text-sm'
                ? 'text-xs'
                : sizes.text === 'text-base'
                ? 'text-sm'
                : sizes.text === 'text-xl'
                ? 'text-sm'
                : 'text-base'
            } text-gray-600 font-medium leading-tight`}
          >
            App
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
