// components/Dining/LoadingSpinner.tsx

import React from 'react';
import styles from '../../diningpage.module.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Discovering dining experiences...</p>
    </div>
  );
};

export default LoadingSpinner;