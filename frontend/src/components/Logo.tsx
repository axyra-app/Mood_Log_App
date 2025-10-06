import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const [imageError, setImageError] = useState(false);
  const [currentFormat, setCurrentFormat] = useState<'webp' | 'png'>('webp');

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6 sm:h-8 sm:w-8',
    lg: 'h-8 w-8 sm:h-10 sm:w-10'
  };

  const emojiSizes = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-lg',
    lg: 'text-lg sm:text-xl'
  };

  const handleError = () => {
    if (currentFormat === 'webp') {
      // Intentar con PNG
      setCurrentFormat('png');
      setImageError(false);
    } else {
      // Usar fallback con emoji
      setImageError(true);
    }
  };

  if (imageError) {
    // Fallback con emoji
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center ${className}`}>
        <span className={`text-white ${emojiSizes[size]}`}>🧠</span>
      </div>
    );
  }

  const logoSrc = currentFormat === 'webp' ? '/logo.webp' : '/logo.png';

  return (
    <img 
      src={logoSrc} 
      alt="Mood Log Logo" 
      className={`${sizeClasses[size]} ${className}`}
      onError={handleError}
      onLoad={() => setImageError(false)}
    />
  );
};

export default Logo;
