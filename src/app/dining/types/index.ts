// types/index.ts

export interface DiningItem {
  _id: string;
  name: string;
  location: string;
  island: string;
  images: { url: string; isMain?: boolean }[];
  cuisineTypes?: string[];
  priceRange?: string;
  reviews?: { rating: number }[];
  matchScore?: number;
}

export interface FilterOptions {
  islands: string;
  cuisine: string;
  sortOptions: string;
}

export const ISLANDS_OPTIONS = ["All", "Providenciales", "Grand Turk", "South Caicos"];
export const CUISINE_OPTIONS = ["All", "Caribbean", "American", "Seafood", "Italian", "Vegan"];
export const SORT_OPTIONS = ["Alphabetical", "Reviews"];