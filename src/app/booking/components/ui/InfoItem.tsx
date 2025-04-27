// components/ui/InfoItem.tsx
import React, { ReactNode } from 'react';
import styles from '../../bookingpage.module.css';

interface InfoItemProps {
  icon: ReactNode;
  text: string;
  iconColor?: string;
  className?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ 
  icon, 
  text, 
  iconColor = '#D4AF37',
  className = ''
}) => {
  return (
    <div className={`${styles.infoItem} ${className}`}>
      {React.cloneElement(icon as React.ReactElement, { 
        className: styles.infoIcon, 
        style: { color: iconColor } 
      })}
      <span>{text}</span>
    </div>
  );
};

export default InfoItem;