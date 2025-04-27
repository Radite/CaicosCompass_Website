// hooks/useActivityParser.ts
import { useState, useEffect } from 'react';
import { Activity, Option } from '../types';
import { ReadonlyURLSearchParams } from 'next/navigation';

interface ActivityParserResult {
  activity: Activity | null;
  selectedOption: Option | null;
  allImages: string[];
  setSelectedOption: (option: Option | null) => void;
  handleOptionChange: (optionId: string) => void;
}

export const useActivityParser = (searchParams: ReadonlyURLSearchParams): ActivityParserResult => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [allImages, setAllImages] = useState<string[]>([]);

  // Parse the activity from the URL query parameter
  useEffect(() => {
    const activityParam = searchParams.get("activity");
    if (activityParam) {
      try {
        const parsedActivity: Activity = JSON.parse(decodeURIComponent(activityParam));
        setActivity(parsedActivity);
        
        // Collect all images from activity
        const mainImages = parsedActivity.images?.map(img => img.url) || [];
        setAllImages(mainImages);
        
        // If the activity has options, default to the first one
        if (parsedActivity.options && parsedActivity.options.length > 0) {
          setSelectedOption(parsedActivity.options[0]);
        }
      } catch (err) {
        console.error("Error parsing activity:", err);
      }
    }
  }, [searchParams]);

  // Update images when selected option changes
  useEffect(() => {
    if (activity) {
      const mainImages = activity.images?.map(img => img.url) || [];
      const optionImages = selectedOption?.images?.map(img => img.url) || [];
      setAllImages([...mainImages, ...optionImages]);
    }
  }, [selectedOption, activity]);

  const handleOptionChange = (optionId: string) => {
    if (activity?.options) {
      const option = activity.options.find((opt) => opt._id === optionId) || null;
      setSelectedOption(option);
    }
  };

  return {
    activity,
    selectedOption,
    allImages,
    setSelectedOption,
    handleOptionChange
  };
};