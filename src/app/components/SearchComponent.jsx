// SearchComponent.jsx - Universal Search with Real API Integration

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Star, Clock, Loader } from 'lucide-react';
import axios from 'axios';

const SearchComponent = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Categories matching your API service types
  const categories = [
    { id: 'all', label: 'Search All', apiType: null, color: '#667eea' },
    { id: 'activities', label: 'Activities', apiType: 'Activity', color: '#48bb78' },
    { id: 'accommodations', label: 'Accommodations', apiType: 'Stay', color: '#ed8936' },
    { id: 'dining', label: 'Dining', apiType: 'Dining', color: '#e53e3e' },
    { id: 'transportation', label: 'Transportation', apiType: 'Transportation', color: '#3182ce' },
    { id: 'shopping', label: 'Shopping', apiType: 'Shopping', color: '#805ad5' },
    { id: 'wellness', label: 'Wellness', apiType: 'Wellness', color: '#38b2ac' }
  ];

  // Function to get category display info
  const getCategoryInfo = (serviceType) => {
    const categoryMap = {
      'Activity': { label: 'Activities', color: '#48bb78', icon: '🏄‍♂️' },
      'Stay': { label: 'Accommodations', color: '#ed8936', icon: '🏨' },
      'Dining': { label: 'Dining', color: '#e53e3e', icon: '🍽️' },
      'Transportation': { label: 'Transportation', color: '#3182ce', icon: '🚗' },
      'Shopping': { label: 'Shopping', color: '#805ad5', icon: '🛍️' },
      'Wellness': { label: 'Wellness', color: '#38b2ac', icon: '🧘‍♀️' }
    };
    return categoryMap[serviceType] || { label: serviceType, color: '#667eea', icon: '📍' };
  };

  // Fetch data from API
  const fetchSearchResults = async (query = '', category = 'all') => {
    setIsLoading(true);
    setError(null);
    
    try {
      let results = [];
      
      if (category === 'all') {
        // Search all services
        const response = await axios.get(`${API_BASE}/api/services/`);
        results = response.data || [];
      } else {
        // Search specific category
        const categoryObj = categories.find(cat => cat.id === category);
        if (categoryObj && categoryObj.apiType) {
          const response = await axios.get(`${API_BASE}/api/services/type/${categoryObj.apiType}`);
          results = response.data || [];
        }
      }

      // Filter results based on search query
      if (query.trim()) {
        results = results.filter(item => 
          item.name?.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase()) ||
          item.location?.toLowerCase().includes(query.toLowerCase())
        );
      }

      setSearchResults(results);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    if (query.length >= 2 || query.length === 0) {
      setTimeout(() => {
        fetchSearchResults(query, activeCategory);
      }, 300);
    }
  };

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    fetchSearchResults(searchQuery, categoryId);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setError(null);
  };

  // Handle result click
  const handleResultClick = (result) => {
    const categoryInfo = getCategoryInfo(result.serviceType);
    let baseUrl = '';
    
    switch (result.serviceType) {
      case 'Activity':
        baseUrl = '/things-to-do';
        break;
      case 'Stay':
        baseUrl = '/stays';
        break;
      case 'Dining':
        baseUrl = '/dining';
        break;
      case 'Transportation':
        baseUrl = '/transportationcategories';
        break;
      case 'Shopping':
        baseUrl = '/shopping';
        break;
      case 'Wellness':
        baseUrl = '/wellnessspa';
        break;
      default:
        baseUrl = '/';
    }
    
    // Navigate to the specific item page
    window.location.href = `${baseUrl}/${result._id}`;
  };

  // Load initial results when component mounts
  useEffect(() => {
    fetchSearchResults('', 'all');
  }, []);

  return (
    <div className="search-component">
      {/* Search Header */}
      <div className="search-header">
        <h2>Search Everything</h2>
        <button onClick={onClose} className="close-btn">
          <X size={24} />
        </button>
      </div>

      {/* Category Filters */}
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
            style={{
              borderColor: activeCategory === category.id ? category.color : '#e2e8f0',
              backgroundColor: activeCategory === category.id ? category.color : 'white',
              color: activeCategory === category.id ? 'white' : '#4a5568'
            }}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="search-input-container">
        <Search className="search-icon" size={20} />
        <input
          ref={searchRef}
          type="text"
          className="search-input"
          placeholder="Search activities, hotels, restaurants, and more..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {searchQuery && (
          <button onClick={clearSearch} className="clear-btn">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <Loader className="spinner" size={24} />
          <span>Searching...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>{error}</p>
        </div>
      )}

      {/* Search Results */}
      {showResults && !isLoading && (
        <div className="search-results">
          <div className="results-header">
            <h3>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} 
              {searchQuery && ` for "${searchQuery}"`}
            </h3>
          </div>

          <div className="results-list">
            {searchResults.length === 0 ? (
              <div className="no-results">
                <p>No results found. Try a different search term or category.</p>
              </div>
            ) : (
              searchResults.map((result) => {
                const categoryInfo = getCategoryInfo(result.serviceType);
                return (
                  <div
                    key={result._id}
                    className="result-item"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="result-image">
                      <img
                        src={result.images?.[0]?.url || result.images?.[0] || '/default-image.jpg'}
                        alt={result.name}
                        onError={(e) => {
                          e.target.src = '/default-image.jpg';
                        }}
                      />
                      <div 
                        className="category-badge"
                        style={{ backgroundColor: categoryInfo.color }}
                      >
                        {categoryInfo.icon} {categoryInfo.label}
                      </div>
                    </div>
                    
                    <div className="result-content">
                      <h4 className="result-title">{result.name}</h4>
                      <p className="result-description">
                        {result.description?.substring(0, 120)}
                        {result.description?.length > 120 ? '...' : ''}
                      </p>
                      
                      <div className="result-meta">
                        <div className="result-location">
                          <MapPin size={14} />
                          <span>{result.location}</span>
                        </div>
                        
                        {result.averageRating && (
                          <div className="result-rating">
                            <Star size={14} fill="currentColor" />
                            <span>{result.averageRating}</span>
                          </div>
                        )}
                        
                        {result.basePrice && (
                          <div className="result-price">
                            <span>From ${result.basePrice}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;