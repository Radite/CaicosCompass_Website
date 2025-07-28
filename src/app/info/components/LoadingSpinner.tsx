// File Path: src/app/info/components/LoadingSpinner.tsx

import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading travel information...', 
  size = 'large' 
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={`${styles.spinner} ${styles[size]}`}>
          <div className={styles.spinnerInner}></div>
        </div>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;