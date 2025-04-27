// components/ui/Section.tsx
import React, { ReactNode } from 'react';
import styles from '../../bookingpage.module.css';

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {icon && <span style={{ marginRight: '10px' }}>{icon}</span>}
        {title}
      </h3>
      {children}
    </div>
  );
};

export default Section;