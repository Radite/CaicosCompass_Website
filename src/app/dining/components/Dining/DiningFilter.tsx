// components/Dining/DiningFilter.tsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import styles from '../../diningpage.module.css';
import { FilterOptions, ISLANDS_OPTIONS, CUISINE_OPTIONS, SORT_OPTIONS } from '../../types';

interface DiningFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilters: FilterOptions;
  setSelectedFilters: (filters: FilterOptions) => void;
  resultsCount: number;
}

const DiningFilter: React.FC<DiningFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedFilters,
  setSelectedFilters,
  resultsCount,
}) => {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterSection}>
        <div className={styles.searchInputContainer}>
          <FontAwesomeIcon icon={faSearch} className={styles.inputIcon} />
          <input
            type="text"
            placeholder="Search dining..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.selectContainer}>
          <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
          <select
            className={styles.select}
            value={selectedFilters.islands}
            onChange={(e) =>
              setSelectedFilters({ ...selectedFilters, islands: e.target.value })
            }
          >
            {ISLANDS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.selectContainer}>
          <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
          <select
            className={styles.select}
            value={selectedFilters.cuisine}
            onChange={(e) =>
              setSelectedFilters({ ...selectedFilters, cuisine: e.target.value })
            }
          >
            {CUISINE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.selectContainer}>
          <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
          <select
            className={styles.select}
            value={selectedFilters.sortOptions}
            onChange={(e) =>
              setSelectedFilters({ ...selectedFilters, sortOptions: e.target.value })
            }
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.resultsCount}>
        {resultsCount} dining options found
      </div>
    </div>
  );
};

export default DiningFilter;