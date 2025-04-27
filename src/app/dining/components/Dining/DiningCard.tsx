// components/Dining/DiningCard.tsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import styles from '../../diningpage.module.css';
import { DiningItem } from '../../types';

interface DiningCardProps {
  item: DiningItem;
  onClick: () => void;
}

const DiningCard: React.FC<DiningCardProps> = ({ item, onClick }) => {
  const mainImage = item.images.find((img) => img.isMain)?.url || 
                   item.images[0]?.url || 
                   "https://via.placeholder.com/400x220?text=Dining";

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardImageContainer}>
        <img
          src={mainImage}
          alt={item.name}
          className={styles.cardImg}
        />
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{item.name}</h3>
        <div className={styles.locationContainer}>
          <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.locationIcon} />
          <p className={styles.locationText}>
            {item.location}, {item.island}
          </p>
        </div>
        <p className={styles.cardText}>
          Cuisine: {item.cuisineTypes?.join(", ") || "N/A"}
        </p>
        <p className={styles.cardText}>
          Price Range: {item.priceRange || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default DiningCard;