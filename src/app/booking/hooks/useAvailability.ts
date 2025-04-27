// hooks/useAvailability.ts
import { useState, useEffect } from 'react';
import { Activity, Option, TimeSlot } from '../types';
import { getAvailableTimeslots } from '../utils/bookingUtils';

export const useAvailability = (
  activity: Activity | null,
  selectedOption: Option | null,
  selectedDate: string
) => {
  const [availableTimeslots, setAvailableTimeslots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);

  useEffect(() => {
    const times = getAvailableTimeslots(selectedDate, selectedOption, activity);
    setAvailableTimeslots(times);
    setSelectedTime(null); // Reset timeslot when date or option changes
  }, [selectedDate, selectedOption, activity]);

  return { availableTimeslots, selectedTime, setSelectedTime };
};