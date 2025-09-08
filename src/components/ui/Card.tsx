import React from 'react';
import { CardProps } from '../../types';

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, padding = 'md' }) => {
  const baseClasses = 'bg-white rounded-2xl shadow-sm border border-gray-200';
  const hoverClasses = hover ? 'hover:shadow-lg transition-all duration-200' : '';

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const classes = `${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`;

  return <div className={classes}>{children}</div>;
};

export default Card;

