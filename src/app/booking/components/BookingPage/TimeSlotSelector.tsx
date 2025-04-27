// components/BookingPage/TimeSlotSelector.tsx
import React from 'react';
import { FaClock, FaInfoCircle } from 'react-icons/fa';
import { TimeSlot } from '../../types';
import Section from '../ui/Section';
import { formatDate } from '../../utils/dateUtils';
import styles from '../../bookingpage.module.css';

interface TimeSlotSelectorProps {
  availableTimeslots: TimeSlot[];
  selectedTime: TimeSlot | null;
  onTimeSelect: (time: TimeSlot) => void;
  selectedDate: string;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ 
  availableTimeslots, 
  selectedTime, 
  onTimeSelect,
  selectedDate
}) => {
  return (
    <Section title="Select Time Slot" icon={<FaClock />}>
      {availableTimeslots.length > 0 ? (
        <div className={styles.timeslotGrid}>
          {availableTimeslots.map((time, index) => (
            <button
              key={index}
              className={`${styles.timeslotButton} ${
                selectedTime === time ? styles.selectedTimeslot : ""
              }`}
              onClick={() => onTimeSelect(time)}
            >
              {time.startTime} - {time.endTime}
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.noTimesText}>
          <FaInfoCircle style={{ marginRight: '8px' }} />
          No times available for {formatDate(selectedDate)}. Please try another date.
        </div>
      )}
    </Section>
  );
};

export default TimeSlotSelector;