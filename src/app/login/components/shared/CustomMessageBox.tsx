// CustomMessageBox.js
import React from 'react';
import styles from './CustomMessageBox.module.css';

const CustomMessageBox = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  confirmText = 'OK',
  showCancel = false,
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.messageBox} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.header} ${styles[type]}`}>
          <div className={styles.icon}>{getIcon()}</div>
          <h3 className={styles.title}>{title}</h3>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.actions}>
          {showCancel && (
            <button 
              className={styles.cancelButton}
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`${styles.confirmButton} ${styles[type]}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomMessageBox;