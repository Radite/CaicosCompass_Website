// components/BookingPage/DateSelector.tsx
import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import Section from '../ui/Section';
import { getUpcomingDays, formatShortDate } from '../../utils/dateUtils';
import styles from '../../bookingpage.module.css';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const today = new Date().toISOString().split('T')[0];
  const upcomingDays = getUpcomingDays(5);

  return (
    <Section title="Select Date" icon={<FaCalendarAlt />}>
      <input
        type="date"
        min={today}
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className={styles.dateInput}
      />
      
      <div className={styles.upcomingDates}>
        <div className={styles.dateSelector}>
          {upcomingDays.map((dateString) => {
            const date = new Date(dateString);
            return (
              <button
                key={dateString}
                className={`${styles.dateButton} ${
                  selectedDate === dateString ? styles.selectedDate : ""
                }`}
                onClick={() => onDateChange(dateString)}
              >
                {formatShortDate(dateString)}
              </button>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

export default DateSelector;