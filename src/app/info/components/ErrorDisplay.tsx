// File Path: src/app/info/components/ErrorDisplay.tsx

import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import styles from './ErrorDisplay.module.css';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  title?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  title = 'Unable to Load Content' 
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <AlertTriangle className={styles.icon} size={48} />
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{error}</p>
        {onRetry && (
          <button onClick={onRetry} className={styles.retryButton}>
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
        <div className={styles.suggestions}>
          <h3 className={styles.suggestionsTitle}>Try these suggestions:</h3>
          <ul className={styles.suggestionsList}>
            <li>Check your internet connection</li>
            <li>Refresh the page</li>
            <li>Try again in a few moments</li>
            <li>Contact support if the problem persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;