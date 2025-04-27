// hooks/useDining.ts

import { useState, useEffect } from 'react';
import axios from 'axios';
import { DiningItem, FilterOptions } from '../types';
import { applyFilters } from '../utils/filterUtils';

export default function useDining() {
  const [diningItems, setDiningItems] = useState<DiningItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DiningItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<FilterOptions>({
    islands: "All",
    cuisine: "All",
    sortOptions: "Reviews",
  });

  // Fetch dining data
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/services/type/dining")
      .then((res) => {
        setDiningItems(res.data);
        setFilteredItems(res.data);
      })
      .catch((err) => console.error("Error fetching dining data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    const result = applyFilters(diningItems, selectedFilters, searchQuery);
    setFilteredItems(result);
  }, [selectedFilters, searchQuery, diningItems]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedFilters({
      islands: "All",
      cuisine: "All",
      sortOptions: "Reviews",
    });
  };

  return {
    diningItems,
    filteredItems,
    loading,
    searchQuery,
    setSearchQuery,
    selectedFilters,
    setSelectedFilters,
    handleResetFilters
  };
}