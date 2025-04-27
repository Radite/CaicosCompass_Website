// components/BookingPage/BookingForm.tsx
import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { Activity, Option, TimeSlot } from '../../types';
import Section from '../ui/Section';
import OptionSelector from './OptionSelector';
import DateSelector from './DateSelector';
import TimeSlotSelector from './TimeSlotSelector';
import GuestSelector from './GuestSelector';
import styles from '../../bookingpage.module.css';

interface BookingFormProps {
  activity: Activity | null;
  selectedOption: Option | null;
  selectedDate: string;
  availableTimeslots: TimeSlot[];
  selectedTime: TimeSlot | null;
  numPeople: number;
  multiUser: boolean;
  onOptionChange: (optionId: string) => void;
  onDateChange: (date: string) => void;
  onTimeSelect: (time: TimeSlot) => void;
  setNumPeople: (num: number) => void;
  setMultiUser: (value: boolean) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  activity,
  selectedOption,
  selectedDate,
  availableTimeslots,
  selectedTime,
  numPeople,
  multiUser,
  onOptionChange,
  onDateChange,
  onTimeSelect,
  setNumPeople,
  setMultiUser
}) => {
  return (
    <div className={styles.mainContent}>
      {/* Options Section */}
      <OptionSelector 
        activity={activity} 
        selectedOption={selectedOption} 
        onOptionChange={onOptionChange} 
      />

      {/* Date Selection */}
      <DateSelector 
        selectedDate={selectedDate} 
        onDateChange={onDateChange} 
      />

      {/* Time Slot Selection */}
      <TimeSlotSelector 
        availableTimeslots={availableTimeslots}
        selectedTime={selectedTime}
        onTimeSelect={onTimeSelect}
        selectedDate={selectedDate}
      />

      {/* Guest Information */}
      <GuestSelector 
        numPeople={numPeople}
        setNumPeople={setNumPeople}
        multiUser={multiUser}
        setMultiUser={setMultiUser}
        selectedOption={selectedOption}
      />

      {/* Cancellation Policy */}
      <Section title="Cancellation Policy">
        <p className={styles.policyText}>
          • Free cancellation up to 48 hours before your experience<br />
          • 50% refund for cancellations between 24-48 hours before scheduled time<br />
          • No refunds for cancellations less than 24 hours before scheduled time<br />
          • Rescheduling is possible subject to availability (at least 24 hours notice required)
        </p>
      </Section>
    </div>
  );
};

export default BookingForm;