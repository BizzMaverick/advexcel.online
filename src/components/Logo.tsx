import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBackground?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showBackground = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  };

  const backgroundSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-14 w-14'
  };

  const logoElement = (
    <img 
      src="/Tech Company Logo Excel Pro AI, Blue and Silver.png" 
      alt="Excel Pro AI" 
      className={`${sizeClasses[size]} object-contain`}
    />
  );

  if (!showBackground) {
    return <div className={className}>{logoElement}</div>;
  }

  return (
    <div className={`${backgroundSizeClasses[size]} bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center ${className}`}>
      {logoElement}
    </div>
  );
};