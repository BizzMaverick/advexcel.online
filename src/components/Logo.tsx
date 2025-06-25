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
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const backgroundSizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-18 w-18',
    xl: 'h-22 w-22'
  };

  const logoElement = (
    <img 
      src="/Tech Company Logo Excel Pro AI, Blue and Silver.png" 
      alt="Excel Pro AI" 
      className={`${sizeClasses[size]} object-contain`}
      style={{ imageRendering: 'crisp-edges' }}
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