// File Path: src/app/info/page.tsx

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Star, Clock, Eye, MapPin, ChevronRight, Grid, List, ArrowLeft } from 'lucide-react';
import InfoPageDetail from './components/InfoPageDetail';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import CategoryFilter from './components/CategoryFilter';
import styles from './info.module.css';

// Types
interface InfoPage {
  _id: string;
  title: string;
  description: string;
  slug: string;
  icon: string;
  color: string;
  category: string;
  featured: boolean;
  priority: number;
  views: number;
  lastUpdated: string;
  tags: string[];
  sections: Section[];
  markers: MapMarker[];
}

interface Section {
  title: string;
  content: ContentItem[];
}

interface ContentItem {
  name: string;
  description: string;
  image?: string;
  additionalInfo?: any;
}

interface MapMarker {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
  type: string;
}

const InfoPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [infoPages, setInfoPages] = useState<InfoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPage, setSelectedPage] = useState<InfoPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Categories', icon: '🌟' },
    { value: 'essential-services', label: 'Essential Services', icon: '📱' },
    { value: 'transportation', label: 'Transportation', icon: '🚗' },
    { value: 'accommodation', label: 'Accommodation', icon: '🏨' },
    { value: 'dining', label: 'Dining', icon: '🍽️' },
    { value: 'activities', label: 'Activities', icon: '🏄‍♂️' },
    { value: 'culture-history', label: 'Culture & History', icon: '🏛️' },
    { value: 'practical-info', label: 'Practical Info', icon: '💡' },
    { value: 'safety-health', label: 'Safety & Health', icon: '🏥' },
    { value: 'weather-climate', label: 'Weather & Climate', icon: '☀️' },
    { value: 'sustainability', label: 'Sustainability', icon: '🌱' }
  ];

  // Fetch info pages
  useEffect(() => {
    fetchInfoPages();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/info';
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, selectedCategory]);

  const fetchInfoPages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/info`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setInfoPages(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch info pages');
      }
    } catch (error) {
      console.error('Error fetching info pages:', error);
      setError(error instanceof Error ? error.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort pages
  const filteredAndSortedPages = useMemo(() => {
    let filtered = infoPages.filter(page => {
      const matchesSearch = searchQuery === '' || 
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        page.sections.some(section => 
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.content.some(content => 
            content.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            content.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );

      const matchesCategory = selectedCategory === 'all' || page.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort pages
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'views':
          comparison = a.views - b.views;
          break;
        case 'lastUpdated':
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          break;
        case 'priority':
        default:
          comparison = a.priority - b.priority;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [infoPages, searchQuery, selectedCategory, sortBy, sortOrder]);

  // Get featured pages
  const featuredPages = infoPages.filter(page => page.featured).slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || '📄';
  };

  const handlePageClick = async (page: InfoPage) => {
    setSelectedPage(page);
    
    // Increment view count
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await fetch(`${API_BASE_URL}/api/info/${page.slug}`, { method: 'GET' });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchInfoPages} />;
  }

  if (selectedPage) {
    return <InfoPageDetail page={selectedPage} onBack={() => setSelectedPage(null)} />;
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Turks & Caicos Travel Guide
            </h1>
            <p className={styles.heroSubtitle}>
              Your comprehensive guide to paradise. Everything you need to know for the perfect Caribbean getaway.
            </p>
            
            {/* Search Bar */}
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={20} />
                <input
                  type="text"
                  placeholder="Search for restaurants, beaches, activities, or tips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Pages */}
      {featuredPages.length > 0 && searchQuery === '' && selectedCategory === 'all' && (
        <div className={styles.featuredSection}>
          <div className={styles.featuredHeader}>
            <h2 className={styles.featuredTitle}>Featured Guides</h2>
            <p className={styles.featuredSubtitle}>Essential information to get you started</p>
          </div>
          
          <div className={styles.featuredGrid}>
            {featuredPages.map((page) => (
              <div
                key={page._id}
                onClick={() => handlePageClick(page)}
                className={styles.featuredCard}
              >
                <div 
                  className={styles.featuredCardIcon}
                  style={{ backgroundColor: page.color }}
                >
                  {getCategoryIcon(page.category)}
                </div>
                <div className={styles.featuredCardContent}>
                  <div className={styles.featuredCardMeta}>
                    <span className={styles.featuredBadge}>
                      Featured
                    </span>
                    <Star className={styles.starIcon} size={16} />
                  </div>
                  <h3 className={styles.featuredCardTitle}>
                    {page.title}
                  </h3>
                  <p className={styles.featuredCardDescription}>
                    {page.description}
                  </p>
                  <div className={styles.featuredCardFooter}>
                    <div className={styles.viewCount}>
                      <Eye size={14} />
                      {page.views} views
                    </div>
                    <ChevronRight className={styles.chevronIcon} size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersContainer}>
          <div className={styles.filtersContent}>
            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {/* View and Sort Controls */}
            <div className={styles.controls}>
              <div className={styles.viewControls}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                >
                  <List size={16} />
                </button>
              </div>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className={styles.sortSelect}
              >
                <option value="priority-desc">Priority (High to Low)</option>
                <option value="priority-asc">Priority (Low to High)</option>
                <option value="title-asc">Title (A to Z)</option>
                <option value="title-desc">Title (Z to A)</option>
                <option value="views-desc">Most Viewed</option>
                <option value="views-asc">Least Viewed</option>
                <option value="lastUpdated-desc">Recently Updated</option>
                <option value="lastUpdated-asc">Oldest Updates</option>
              </select>
            </div>
          </div>

          {/* Results count and clear filters */}
          <div className={styles.resultsInfo}>
            <div className={styles.resultsCount}>
              {filteredAndSortedPages.length} {filteredAndSortedPages.length === 1 ? 'result' : 'results'}
              {searchQuery && ` for "${searchQuery}"`}
            </div>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={clearFilters}
                className={styles.clearFilters}
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={styles.resultsSection}>
        {filteredAndSortedPages.length === 0 ? (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3 className={styles.noResultsTitle}>No results found</h3>
            <p className={styles.noResultsText}>Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className={styles.viewAllButton}
            >
              View All Guides
            </button>
          </div>
        ) : (
          <div className={`${styles.resultsGrid} ${viewMode === 'list' ? styles.listView : styles.gridView}`}>
            {filteredAndSortedPages.map((page) => (
              <div
                key={page._id}
                onClick={() => handlePageClick(page)}
                className={`${styles.resultCard} ${viewMode === 'list' ? styles.listCard : ''}`}
              >
                <div 
                  className={styles.resultCardIcon}
                  style={{ backgroundColor: page.color }}
                >
                  {getCategoryIcon(page.category)}
                </div>
                <div className={styles.resultCardContent}>
                  <div className={styles.resultCardMeta}>
                    <span className={styles.categoryBadge}>
                      {categories.find(c => c.value === page.category)?.label}
                    </span>
                    {page.featured && <Star className={styles.featuredStar} size={14} />}
                  </div>
                  <h3 className={styles.resultCardTitle}>
                    {page.title}
                  </h3>
                  <p className={styles.resultCardDescription}>
                    {page.description}
                  </p>
                  <div className={styles.resultCardFooter}>
                    <div className={styles.resultCardStats}>
                      <div className={styles.stat}>
                        <Eye size={12} />
                        {page.views}
                      </div>
                      <div className={styles.stat}>
                        <Clock size={12} />
                        {formatDate(page.lastUpdated)}
                      </div>
                      {page.markers.length > 0 && (
                        <div className={styles.stat}>
                          <MapPin size={12} />
                          {page.markers.length} locations
                        </div>
                      )}
                    </div>
                    <ChevronRight className={styles.resultChevron} size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPage;