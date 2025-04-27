// components/Dining/DiningList.tsx

import React from 'react';
import styles from '../../diningpage.module.css';
import DiningCard from './DiningCard';
import { DiningItem } from '../../types';

interface DiningListProps {
  items: DiningItem[];
  onViewDetails: (item: DiningItem) => void;
  onResetFilters: () => void;
}

const DiningList: React.FC<DiningListProps> = ({ 
  items, 
  onViewDetails, 
  onResetFilters 
}) => {
  if (items.length === 0) {
    return (
      <div className={styles.noResults}>
        <p>No dining options available.</p>
        <button className={styles.resetButton} onClick={onResetFilters}>
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className={styles.cardContainer}>
      {items.map((item) => (
        <DiningCard
          key={item._id}
          item={item}
          onClick={() => onViewDetails(item)}
        />
      ))}
    </div>
  );
};

export default DiningList;