// components/BookingPage/GuestSelector.tsx
import React from 'react';
import { FaUsers, FaInfoCircle } from 'react-icons/fa';
import { Option } from '../../types';
import Section from '../ui/Section';
import styles from '../../bookingpage.module.css';

interface GuestSelectorProps {
  numPeople: number;
  setNumPeople: (num: number) => void;
  multiUser: boolean;
  setMultiUser: (value: boolean) => void;
  selectedOption: Option | null;
}

const GuestSelector: React.FC<GuestSelectorProps> = ({ 
  numPeople, 
  setNumPeople, 
  multiUser, 
  setMultiUser,
  selectedOption
}) => {
  const handleIncrease = () => {
    const maxAllowed = selectedOption?.maxPeople || Infinity;
    if (numPeople < maxAllowed) {
      setNumPeople(numPeople + 1);
    } else {
      alert(`Cannot book for more than ${maxAllowed} people.`);
    }
  };
  
  const handleDecrease = () => {
    setNumPeople(Math.max(1, numPeople - 1));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 1;
    const maxAllowed = selectedOption?.maxPeople || Infinity;
    if (newValue > maxAllowed) {
      alert(`Cannot book for more than ${maxAllowed} people.`);
      setNumPeople(maxAllowed);
    } else {
      setNumPeople(newValue);
    }
  };

  return (
    <Section title="Guest Information" icon={<FaUsers />}>
      <label className={styles.label}>
        Number of Guests {selectedOption && `(Max: ${selectedOption.maxPeople})`}
      </label>
      
      <div className={styles.numPeopleContainer}>
        <button
          onClick={handleDecrease}
          className={styles.numButton}
          aria-label="Decrease number of people"
        >
          -
        </button>
        
        <input
          type="number"
          value={numPeople}
          min="1"
          max={selectedOption?.maxPeople || Infinity}
          onChange={handleInputChange}
          className={styles.numInput}
        />
        
        <button
          onClick={handleIncrease}
          className={styles.numButton}
          aria-label="Increase number of people"
        >
          +
        </button>
      </div>
      
      {selectedOption?.maxPeople && selectedOption.maxPeople > 1 && (
        <div className={styles.tipContainer}>
          <p className={styles.tipText}>
            <FaInfoCircle style={{ marginRight: '8px' }} />
            For groups larger than {Math.floor(selectedOption.maxPeople * 0.7)}, please contact us directly for special rates and availability.
          </p>
        </div>
      )}

      {/* Multi-User Reservation Toggle */}
      <div className={styles.guestOption}>
        <label className={styles.label}>Shared Experience</label>
        <div className={styles.toggleContainer}>
          <button
            className={`${styles.toggleButton} ${
              multiUser ? styles.toggleButtonSelected : ""
            }`}
            onClick={() => setMultiUser(true)}
          >
            Yes
          </button>
          <button
            className={`${styles.toggleButton} ${
              !multiUser ? styles.toggleButtonSelected : ""
            }`}
            onClick={() => setMultiUser(false)}
          >
            No
          </button>
        </div>
        
        <div className={styles.tipContainer}>
          <p className={styles.tipText}>
            <FaInfoCircle style={{ marginRight: '8px' }} />
            Select "Yes" if you're open to sharing this experience with other guests. This option may offer reduced rates.
          </p>
        </div>
      </div>
    </Section>
  );
};

export default GuestSelector;