import { Activity } from "./fetchActivities";

export const getLowestPrice = (activity: Activity): number => {
  if (activity.options && activity.options.length > 0) {
    const prices = activity.options.map(option => option.cost);
    return Math.min(...prices);
  }
  return activity.price || 0;
};

export const getHighestPrice = (activity: Activity): number => {
  if (activity.options && activity.options.length > 0) {
    const prices = activity.options.map(option => option.cost);
    return Math.max(...prices);
  }
  return activity.price || 0;
};

export const getAverageRating = (reviews?: { rating: number }[]): number => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return parseFloat((sum / reviews.length).toFixed(1));
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};
