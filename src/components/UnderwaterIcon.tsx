import React from 'react';

interface UnderwaterIconProps {
  emoji: string;
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  className?: string;
}

const UnderwaterIcon: React.FC<UnderwaterIconProps> = ({ 
  emoji, 
  size = 'md', 
  delay = 0,
  className = ''
}) => {
  const sizeMap = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  };
  
  return (
    <span 
      className={`fish-icon inline-block ${sizeMap[size]} ${className}`}
      style={{ '--fish-delay': delay } as React.CSSProperties}
    >
      {emoji}
    </span>
  );
};

export default UnderwaterIcon;