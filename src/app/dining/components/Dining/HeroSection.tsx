// components/Dining/HeroSection.tsx

import React from 'react';
import styles from '../../diningpage.module.css';

const HeroSection: React.FC = () => {
  return (
    <div className={styles.heroSection}>
      <h1 className={styles.title}>Dining</h1>
      <p className={styles.subtitle}>
        Savor exquisite culinary experiences in Turks and Caicos
      </p>
    </div>
  );
};

export default HeroSection;