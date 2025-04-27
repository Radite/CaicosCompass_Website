// components/BookingPage/OptionSelector.tsx
import React from 'react';
import { Option, Activity } from '../../types';
import Section from '../ui/Section';
import styles from '../../bookingpage.module.css';

interface OptionSelectorProps {
  activity: Activity | null;
  selectedOption: Option | null;
  onOptionChange: (optionId: string) => void;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({ 
  activity, 
  selectedOption, 
  onOptionChange 
}) => {
  if (!activity?.options || activity.options.length === 0) {
    return null;
  }

  return (
    <Section title="Experience Options">
      <div className={styles.servicesTabs}>
        {activity.options.map((opt) => (
          <button
            key={opt._id}
            className={`${styles.serviceTab} ${
              selectedOption && selectedOption._id === opt._id
                ? styles.activeTab
                : ""
            }`}
            onClick={() => onOptionChange(opt._id)}
          >
            {opt.title}
          </button>
        ))}
      </div>
      
      {selectedOption && (
        <div className={styles.optionDetails}>
          <p className={styles.optionDescription}>
            {selectedOption.description || "Experience our carefully crafted package designed to provide you with the ultimate relaxation and enjoyment."}
          </p>
          <div className={styles.optionMeta}>
            <div className={styles.optionPrice}>
              <span className={styles.priceLabel}>Price:</span> ${selectedOption.cost} 
              {activity.pricingType === 'per_person' && ' per person'}
            </div>
            <div className={styles.optionCapacity}>
              <span className={styles.capacityLabel}>Maximum Group Size:</span> {selectedOption.maxPeople} people
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

export default OptionSelector;