import { useEffect, useState } from "react";
import { fetchActivities, Activity } from "../utils/fetchActivities";
import { getLowestPrice, getHighestPrice, getAverageRating } from "../utils/filters";

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [islands, setIslands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIsland, setSelectedIsland] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchActivities()
      .then((data) => {
        setActivities(data);
        setFilteredActivities(data);
        extractFilters(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const extractFilters = (data: Activity[]) => {
    const categorySet = new Set<string>();
    const islandSet = new Set<string>();
    data.forEach((activity) => {
      if (activity.category) categorySet.add(activity.category);
      if (activity.island) islandSet.add(activity.island);
    });
    setCategories(Array.from(categorySet));
    setIslands(Array.from(islandSet));
  };

  const handleFilter = () => {
    let filtered = [...activities];

    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (selectedIsland) {
      filtered = filtered.filter((item) => item.island === selectedIsland);
    }

    if (sortOption) {
      filtered = filtered.sort((a, b) => {
        switch (sortOption) {
          case "PriceLowHigh":
            return getLowestPrice(a) - getLowestPrice(b);
          case "PriceHighLow":
            return getHighestPrice(b) - getHighestPrice(a);
          case "AtoZ":
            return a.name.localeCompare(b.name);
          case "ZtoA":
            return b.name.localeCompare(a.name);
          case "RatingHighLow":
            return getAverageRating(b.reviews) - getAverageRating(a.reviews);
          default:
            return 0;
        }
      });
    }

    setFilteredActivities(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [searchQuery, selectedCategory, selectedIsland, sortOption]);

  return {
    activities,
    filteredActivities,
    categories,
    islands,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedIsland,
    setSelectedIsland,
    sortOption,
    setSortOption,
    isLoading,
    setSearchQueryDirectly: setSearchQuery,
    resetFilters: () => {
      setSearchQuery("");
      setSelectedCategory("");
      setSelectedIsland("");
      setSortOption("");
    }
  };
}
