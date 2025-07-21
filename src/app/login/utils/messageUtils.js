import { useState } from "react";

export const useMessage = () => {
  const [messageBox, setMessageBox] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false,
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null
  });

  const showMessage = (title, message, type = 'info', options = {}) => {
    setMessageBox({
      isOpen: true,
      title,
      message,
      type,
      showCancel: options.showCancel || false,
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    });
  };

  const closeMessageBox = () => {
    setMessageBox(prev => ({ ...prev, isOpen: false }));
  };

  return {
    messageBox,
    showMessage,
    closeMessageBox
  };
};