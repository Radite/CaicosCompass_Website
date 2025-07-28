// File Path: src/app/info/components/CategoryFilter.tsx

import React from 'react';
import styles from './CategoryFilter.module.css';

interface Category {
  value: string;
  label: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.filterGrid}>
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`${styles.categoryButton} ${
              selectedCategory === category.value ? styles.active : ''
            }`}
          >
            <span className={styles.categoryIcon}>{category.icon}</span>
            <span className={styles.categoryLabel}>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;