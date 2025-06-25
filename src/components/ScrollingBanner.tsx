import React, { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';

interface ScrollingBannerProps {
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export const ScrollingBanner: React.FC<ScrollingBannerProps> = ({ 
  children, 
  threshold = 100,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide banner when scrolling down past threshold
      if (currentScrollY > threshold && currentScrollY > lastScrollY) {
        setIsVisible(false);
      }
      // Show banner when scrolling up or at top
      else if (currentScrollY < lastScrollY || currentScrollY <= threshold) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, threshold]);

  return (
    <div 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};