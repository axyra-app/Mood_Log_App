import React, { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('https://i.postimg.cc/dDMbXDT2/Logo-Mood-log-app.png');

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
    if (currentSrc === 'https://i.postimg.cc/dDMbXDT2/Logo-Mood-log-app.png') {
      setCurrentSrc('/Logo_Mood_log_app.png');
    } else if (currentSrc === '/Logo_Mood_log_app.png') {
      setCurrentSrc('/favicon.png');
    } else {
      setImageError(true);
    }
  };

  // SVG Logo inline como fallback principal
  const LogoSVG = () => (
    <svg 
      className={`${sizes.image} rounded-lg flex-shrink-0`}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(#logoGradient)" />
      <circle cx="35" cy="35" r="8" fill="white" />
      <circle cx="65" cy="35" r="8" fill="white" />
      <path d="M25 65 Q50 80 75 65" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  );

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Image with fallback */}
      {!imageError ? (
        <img
          src={currentSrc}
          alt="Mood Log App Logo"
          className={`${sizes.image} rounded-lg flex-shrink-0`}
          onError={handleImageError}
        />
      ) : (
        // Fallback: SVG inline logo
        <LogoSVG />
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
