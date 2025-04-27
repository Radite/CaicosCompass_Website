// utils/filterUtils.ts

import { DiningItem, FilterOptions } from '../types';

export const applyFilters = (
  diningItems: DiningItem[],
  selectedFilters: FilterOptions,
  searchQuery: string
): DiningItem[] => {
  let updatedItems = [...diningItems];

  // Filter by island
  if (selectedFilters.islands !== "All") {
    updatedItems = updatedItems.filter(
      (item) => item.island === selectedFilters.islands
    );
  }

  // Filter by cuisine
  if (selectedFilters.cuisine !== "All") {
    updatedItems = updatedItems.filter(
      (item) =>
        item.cuisineTypes && item.cuisineTypes.includes(selectedFilters.cuisine)
    );
  }

  // Sort items
  if (selectedFilters.sortOptions === "Alphabetical") {
    updatedItems.sort((a, b) => a.name.localeCompare(b.name));
  } else if (selectedFilters.sortOptions === "Reviews") {
    updatedItems.sort(
      (a, b) =>
        ((b.reviews?.length || 0) - (a.reviews?.length || 0))
    );
  }

  // Apply search filter
  if (searchQuery.trim()) {
    updatedItems = updatedItems
      .map((item) => ({
        ...item,
        matchScore: item.name.toLowerCase().indexOf(searchQuery.toLowerCase()),
      }))
      .filter((item) => item.matchScore !== -1)
      .sort((a, b) => (a.matchScore || 0) - (b.matchScore || 0));
  }

  return updatedItems;
};