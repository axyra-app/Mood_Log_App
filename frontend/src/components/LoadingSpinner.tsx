import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  isDarkMode?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  isDarkMode = false,
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      default:
        return 'w-8 h-8';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'border-purple-600';
      case 'secondary':
        return 'border-pink-600';
      case 'white':
        return 'border-white';
      case 'gray':
        return isDarkMode ? 'border-gray-400' : 'border-gray-600';
      default:
        return 'border-purple-600';
    }
  };

  const getTextColor = () => {
    if (isDarkMode) {
      return 'text-gray-300';
    }
    return 'text-gray-600';
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-t-transparent ${getSizeClasses()} ${getColorClasses()}`}
      />
      {text && <p className={`mt-3 text-sm font-medium ${getTextColor()}`}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
