// components/ui/BackButton.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import styles from '../../bookingpage.module.css';

interface BackButtonProps {
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ label = 'Back to Activities' }) => {
  const router = useRouter();
  
  const navigateBack = () => {
    router.back();
  };
  
  return (
    <button onClick={navigateBack} className={styles.backButton}>
      <FaArrowLeft className={styles.backIcon} /> {label}
    </button>
  );
};

export default BackButton;