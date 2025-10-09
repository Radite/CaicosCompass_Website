"use client";

import React, { useEffect, useState, useCallback, useReducer, useRef } from "react";
import { ChevronDown, Sparkles, Clock, MapPin, Star, ArrowRight, Search, ChevronLeft, ChevronRight } from "lucide-react";

// Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
const ITEMS_PER_PAGE = 12;

// Input sanitization utility
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 200);
};

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Search state reducer
const searchReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, activeFilter: action.payload, currentPage: 1 };
    case 'SET_QUERY':
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.payload };
    case 'SET_RESULTS':
      return { 
        ...state, 
        searchResults: action.payload.results,
        totalResults: action.payload.total,
        isSearching: false,
        searchAttempted: true,
        error: null
      };
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload, 
        isSearching: false,
        searchResults: [],
        totalResults: 0
      };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    default:
      return state;
  }
};

// Custom Carousel Component
const CustomCarousel = ({ images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => prev === 0 ? images.length - 1 : prev - 1);
  }, [images.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  }, [nextSlide, prevSlide]);

  return (
    <div 
      className="custom-carousel"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Image carousel"
    >
      <div className="carousel-inner">
        {images.map((image, index) => (
          <div
            key={index}
            className={`carousel-item ${index === currentSlide ? 'active' : ''}`}
            style={{ display: index === currentSlide ? 'block' : 'none' }}
          >
            <img
              src={image.src}
              className="d-block w-100"
              alt={image.alt}
              loading={index === 0 ? "eager" : "lazy"}
              style={{ width: '100%', height: '100vh', objectFit: 'cover' }}
            />
            <div className="slide-overlay"></div>
          </div>
        ))}
      </div>

      <button
        className="carousel-control carousel-control-prev"
        onClick={prevSlide}
        aria-label="Previous slide"
        type="button"
        style={{ 
          position: 'absolute', 
          left: '20px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.3)',
          border: 'none',
          color: 'white',
          padding: '10px',
          cursor: 'pointer',
          borderRadius: '50%',
          zIndex: 10
        }}
      >
        <ChevronLeft size={32} />
      </button>

      <button
        className="carousel-control carousel-control-next"
        onClick={nextSlide}
        aria-label="Next slide"
        type="button"
        style={{ 
          position: 'absolute', 
          right: '20px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.3)',
          border: 'none',
          color: 'white',
          padding: '10px',
          cursor: 'pointer',
          borderRadius: '50%',
          zIndex: 10
        }}
      >
        <ChevronRight size={32} />
      </button>

      <div className="carousel-indicators">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToSlide(index)}
            className={index === currentSlide ? "active" : ""}
            aria-current={index === currentSlide ? "true" : "false"}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [heroQuery, setHeroQuery] = useState('');
  
  const [searchState, dispatch] = useReducer(searchReducer, {
    activeFilter: 'all',
    searchQuery: '',
    searchResults: [],
    totalResults: 0,
    isSearching: false,
    searchAttempted: false,
    currentPage: 1,
    error: null
  });

  const debouncedSearchQuery = useDebounce(searchState.searchQuery, 400);
  const searchSectionRef = useRef(null);

  const heroImages = [
    {
      src: "https://www.visittci.com/thing/grace-bay-beach-pr/aerial_2048x1365.jpg",
      alt: "Grace Bay Beach Aerial View - pristine turquoise waters",
      title: "Paradise Awaits"
    },
    {
      src: "https://a0.muscache.com/im/pictures/miso/Hosting-41823986/original/204ee13c-f4dd-44da-82df-81f9cb001c2e.jpeg",
      alt: "Luxury Beachfront Villa with infinity pool",
      title: "Luxury Redefined"
    },
    {
      src: "https://corksandtacos.com/wp-content/uploads/2023/10/POST-IMAGES-LANDSCAPE221.jpg",
      alt: "Tropical Paradise sunset dining",
      title: "Unforgettable Moments"
    }
  ];

  const filterOptions = [
    { id: 'all', label: 'All', endpoint: '/services' },
    { id: 'activities', label: 'Activities', endpoint: '/services/type/activities' },
    { id: 'stays', label: 'Stays', endpoint: '/services/type/stays' },
    { id: 'transportation', label: 'Transportation', endpoint: '/services/type/transportations' },
    { id: 'wellnessspa', label: 'Wellness & Spa', endpoint: '/services/type/wellnessspas' }
  ];

  useEffect(() => {
    setIsLoaded(true);

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (searchState.searchAttempted || debouncedSearchQuery) {
      performSearch(debouncedSearchQuery, searchState.activeFilter, searchState.currentPage);
    }
  }, [debouncedSearchQuery, searchState.activeFilter, searchState.currentPage]);

  const scrollToSearch = useCallback(() => {
    searchSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }, []);

  const handleHeroSubmit = useCallback(() => {
    const sanitized = sanitizeInput(heroQuery);
    if (!sanitized) {
      alert('Please describe your perfect vacation');
      return;
    }
    window.location.href = `/ai-itinerary?query=${encodeURIComponent(sanitized)}`;
  }, [heroQuery]);

  const handleFilterChange = useCallback((filterId) => {
    dispatch({ type: 'SET_FILTER', payload: filterId });
  }, []);

  const handleSearchQueryChange = useCallback((e) => {
    const sanitized = sanitizeInput(e.target.value);
    dispatch({ type: 'SET_QUERY', payload: sanitized });
  }, []);

  const performSearch = async (query, filter, page = 1) => {
    dispatch({ type: 'SET_SEARCHING', payload: true });

    try {
      const filterConfig = filterOptions.find(f => f.id === filter);
      const endpoint = filterConfig?.endpoint || '/services';
      
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(query && { q: query })
      });

      const fullUrl = `${API_BASE_URL}${endpoint}?${searchParams.toString()}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(fullUrl, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let results = Array.isArray(data) ? data : data.results || [];
      let total = data.total || results.length;

      if (query && Array.isArray(data)) {
        const lowerQuery = query.toLowerCase();
        results = data.filter(item => {
          const nameMatch = item.name?.toLowerCase().includes(lowerQuery);
          const descMatch = item.description?.toLowerCase().includes(lowerQuery);
          return nameMatch || descMatch;
        });
        total = results.length;
      }

      dispatch({ 
        type: 'SET_RESULTS', 
        payload: { results, total }
      });

    } catch (error) {
      console.error('Search error:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.name === 'AbortError' ? 'Request timeout' : 'Failed to load results'
      });
    }
  };

  const handlePageChange = useCallback((newPage) => {
    dispatch({ type: 'SET_PAGE', payload: newPage });
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const totalPages = Math.ceil(searchState.totalResults / ITEMS_PER_PAGE);

  return (
    <>
      <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
        <span id="search-announcement"></span>
      </div>

      <a href="#main-content" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
        Skip to main content
      </a>

      <section 
        className={`hero-carousel ${isLoaded ? 'loaded' : ''}`} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          margin: 0,
          padding: 0,
          width: '100vw',
          height: '100vh'
        }}
        aria-label="Hero banner"
      >
        <CustomCarousel images={heroImages} />
        
        <button 
          className="scroll-indicator"
          onClick={scrollToSearch}
          aria-label="Scroll to search section"
        >
          <ChevronDown className="scroll-arrow" />
        </button>
        
        <div className="hero-overlay"></div>
        
        <div className="container hero-content text-center">
          <div className="hero-badge mb-3">
            <Sparkles className="sparkles-icon" aria-hidden="true" />
            <span>AI-Powered Travel Planning</span>
          </div>
          
          <h1 className="hero-title">
            Your Personal <span className="gradient-text">AI Travel Agent</span>
          </h1>
          
          <p className="hero-subtitle">
            Describe your perfect vacation, and let our AI craft a personalized
            itinerary that matches your dreams perfectly.
          </p>
          
          <div className="hero-ai-form">
            <div className="ai-input-container">
              <label htmlFor="hero-vacation-input" style={{ position: 'absolute', left: '-10000px' }}>
                Describe your perfect vacation
              </label>
              <input
                id="hero-vacation-input"
                type="text"
                className="ai-input"
                placeholder="e.g., 'A 3-day romantic getaway with private dining and snorkeling'"
                value={heroQuery}
                onChange={(e) => setHeroQuery(sanitizeInput(e.target.value))}
                onKeyPress={(e) => e.key === 'Enter' && handleHeroSubmit()}
                maxLength={200}
              />
              <button 
                type="button"
                className="ai-submit-btn"
                onClick={handleHeroSubmit}
                aria-label="Plan my trip with AI"
              >
                <Sparkles className="btn-icon" aria-hidden="true" />
                Plan My Trip
              </button>
            </div>
            
            <div className="ai-features" role="list">
              <div className="feature-item" role="listitem">
                <Clock className="feature-icon" aria-hidden="true" />
                <span>Instant Results</span>
              </div>
              <div className="feature-item" role="listitem">
                <MapPin className="feature-icon" aria-hidden="true" />
                <span>Personalized Routes</span>
              </div>
              <div className="feature-item" role="listitem">
                <Star className="feature-icon" aria-hidden="true" />
                <span>Premium Experiences</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content">
        <section id="how-it-works" className="how-it-works-section">
          <div className="container">
            <div className="text-center mb-5">
              <div className="section-badge">
                <span>How It Works</span>
              </div>
              <h2 className="section-title">Instant Itineraries, Perfectly Planned</h2>
              <p className="section-subtitle">
                Transform your travel dreams into reality in three simple steps.
              </p>
            </div>
            
            <div className="row g-4">
              {[
                {
                  step: "01",
                  title: "Tell Us Your Dream",
                  description: "Describe your ideal activities, vibe, and length of stay in natural language.",
                  icon: "💭"
                },
                {
                  step: "02", 
                  title: "AI-Powered Magic",
                  description: "Our advanced AI analyzes millions of options to build your custom plan instantly.",
                  icon: "🤖"
                },
                {
                  step: "03",
                  title: "Book with Confidence", 
                  description: "Review your perfect itinerary and book everything with just one click.",
                  icon: "✨"
                }
              ].map((item, index) => (
                <div key={index} className="col-md-4">
                  <div className="step-card">
                    <div className="step-number" aria-label={`Step ${item.step}`}>{item.step}</div>
                    <div className="step-icon-emoji" role="img" aria-label={item.title}>{item.icon}</div>
                    <h3 className="step-title">{item.title}</h3>
                    <p className="step-description">{item.description}</p>
                    <div className="step-connector" aria-hidden="true"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="search-section" className="search-section" ref={searchSectionRef}>
          <div className="container">
            <div className="text-center mb-5">
              <div className="section-badge">
                <Search className="me-2" style={{ width: '16px', height: '16px' }} aria-hidden="true" />
                <span>Discover</span>
              </div>
              <h2 className="section-title">Find Your Perfect Experience</h2>
              <p className="section-subtitle">
                Search through our curated collection of activities, dining, stays, and more
              </p>
            </div>
            
            <div className="filter-tabs-container mb-4" role="tablist" aria-label="Service filters">
              <div className="filter-tabs">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.id}
                    role="tab"
                    aria-selected={searchState.activeFilter === filter.id}
                    className={`filter-tab ${searchState.activeFilter === filter.id ? 'active' : ''}`}
                    onClick={() => handleFilterChange(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="search-container">
              <div className="search-form">
                <div className="search-input-group">
                  <Search className="search-icon" aria-hidden="true" />
                  <label htmlFor="main-search-input" style={{ position: 'absolute', left: '-10000px' }}>
                    Search experiences
                  </label>
                  <input
                    id="main-search-input"
                    type="search"
                    className="search-input"
                    placeholder={`Search ${searchState.activeFilter === 'all' ? 'all experiences' : filterOptions.find(f => f.id === searchState.activeFilter)?.label.toLowerCase()}...`}
                    value={searchState.searchQuery}
                    onChange={handleSearchQueryChange}
                    maxLength={200}
                    autoComplete="off"
                  />
                  <div className="search-submit-btn" aria-live="polite">
                    {searchState.isSearching && (
                      <div className="spinner" role="status" aria-label="Searching"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="search-results-wrapper mt-5">
              {searchState.error && (
                <div className="alert alert-danger" role="alert">
                  <strong>Error:</strong> {searchState.error}. Please try again.
                </div>
              )}

              {!searchState.isSearching && searchState.searchResults.length > 0 && (
                <div className="search-results">
                  <div className="results-header">
                    <h3>Search Results</h3>
                    <span className="results-count" aria-live="polite">
                      {searchState.totalResults} result{searchState.totalResults !== 1 ? 's' : ''} found
                    </span>
                  </div>
                  
                  <div className="results-grid">
                    {searchState.searchResults.map((result, index) => {
                      const mainImage = result.images?.find(img => img.isMain);
                      const imageUrl = mainImage?.url || result.images?.[0]?.url || "https://via.placeholder.com/300x200?text=No+Image";

                      return (
                        <div key={result._id?.$oid || result.id || index} className="result-card">
                          <div className="result-image-container">
                            <img
                              src={imageUrl}
                              alt={result.name || 'Service image'}
                              className="result-image"
                              loading="lazy"
                              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            />
                            <div className="result-overlay" aria-hidden="true"></div>
                          </div>
                          <div className="result-content">
                            <div className="result-category">{result.serviceType || result.category}</div>
                            <h4 className="result-title">{result.name}</h4>
                            <p className="result-description">{result.description}</p>
                            {(result.pricePerNight || result.price) && (
                              <div className="result-price">From ${result.pricePerNight || result.price}</div>
                            )}
                            <a 
                              href={`/service/${result._id?.$oid || result.id}`} 
                              className="result-link"
                              aria-label={`View details for ${result.name}`}
                            >
                              <span>View Details</span>
                              <ArrowRight className="link-icon" aria-hidden="true" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <nav className="pagination-container" aria-label="Pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '30px' }}>
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(searchState.currentPage - 1)}
                        disabled={searchState.currentPage === 1}
                        aria-label="Previous page"
                        style={{ opacity: searchState.currentPage === 1 ? 0.5 : 1 }}
                      >
                        <ChevronLeft size={20} />
                        Previous
                      </button>
                      <span className="pagination-info">
                        Page {searchState.currentPage} of {totalPages}
                      </span>
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(searchState.currentPage + 1)}
                        disabled={searchState.currentPage === totalPages}
                        aria-label="Next page"
                        style={{ opacity: searchState.currentPage === totalPages ? 0.5 : 1 }}
                      >
                        Next
                        <ChevronRight size={20} />
                      </button>
                    </nav>
                  )}
                </div>
              )}

              {searchState.searchAttempted && !searchState.isSearching && searchState.searchResults.length === 0 && !searchState.error && (
                <div className="text-center no-results-card" role="status">
                  <div className="no-results-icon">
                    <Search size={48} aria-hidden="true" />
                  </div>
                  <h3>Nothing Found</h3>
                  <p className="text-muted">
                    Sorry, we couldn't find any results for your search.
                    <br />
                    Please try a different keyword or browse our categories.
                  </p>
                </div>
              )}
            </div>
            
            <div className="quick-browse mt-5">
              <h3 className="quick-browse-title">Quick Browse</h3>
              <div className="quick-categories" role="list">
                {[
                  { name: 'Water Sports', icon: '🏄‍♂️', filter: 'activities' },
                  { name: 'Luxury Villas', icon: '🏖️', filter: 'stays' },
                  { name: 'Island Tours', icon: '🚗', filter: 'transportation' },
                  { name: 'Spa Retreats', icon: '💆‍♀️', filter: 'wellnessspa' }
                ].map((category, index) => (
                  <button
                    key={index}
                    className="quick-category-btn"
                    onClick={() => {
                      handleFilterChange(category.filter);
                      dispatch({ type: 'SET_QUERY', payload: category.name });
                    }}
                    role="listitem"
                  >
                    <span className="category-icon" role="img" aria-label={category.name}>{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="categories-section">
          <div className="container">
            <div className="text-center mb-5">
              <div className="section-badge">
                <span>Explore</span>
              </div>
              <h2 className="section-title">Curated Experiences</h2>
              <p className="section-subtitle">
                Discover handpicked activities and services for your perfect getaway
              </p>
            </div>
            
            <div className="categories-grid">
              {[
                {
                  title: "Things To Do",
                  image: "https://www.visittci.com/core/cover-ocean-outback-adventures-slide_1024x341.jpg",
                  href: "/things-to-do",
                  description: "Adventure & Activities"
                },
                {
                  title: "Villas & Airbnbs",
                  image: "https://www.visittci.com/core/cover-emerald-cay-estate-aerial_1024x341.jpg", 
                  href: "/stays",
                  description: "Premium Accommodations"
                },
                {
                  title: "Taxis & Rental Services",
                  image: "https://www.visittci.com/core/cover-jeep-wranglers-at-west-harbour-bluff_1024x341.jpg",
                  href: "/transportationcategories",
                  description: "Getting Around"
                },
                {
                  title: "Wellness & Spa",
                  image: "https://www.wherewhenhow.com/images/turks-caicos-islands/magazine/spas-2017/spa-palms-courtyard-4.jpg",
                  href: "/wellnessspa", 
                  description: "Relaxation & Rejuvenation"
                }
              ].map((category, index) => (
                <div key={index} className="category-item">
                  <div className="category-card">
                    <div className="category-image-container">
                      <img
                        src={category.image}
                        alt={`${category.title} - ${category.description}`}
                        className="category-image"
                        loading="lazy"
                        style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                      />
                      <div className="category-overlay" aria-hidden="true"></div>
                    </div>
                    <div className="category-content">
                      <h3 className="category-title">{category.title}</h3>
                      <p className="category-description">{category.description}</p>
                      <a 
                        href={category.href} 
                        className="category-link"
                        aria-label={`Explore ${category.title}`}
                      >
                        <span>Explore</span>
                        <ArrowRight className="link-icon" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="quick-access-section">
          <div className="container">
            <div className="row g-4">
              <div className="col-md-6">
                <div className="access-card ai-card">
                  <div className="access-icon" aria-hidden="true">
                    <Sparkles />
                  </div>
                  <div className="access-content">
                    <h3>AI Itinerary Builder</h3>
                    <p>Let artificial intelligence craft your perfect day-by-day travel plan</p>
                    <a href="/ai-itinerary" className="access-btn">
                      Start Planning
                      <ArrowRight className="btn-arrow" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="access-card info-card">
                  <div className="access-icon" aria-hidden="true">
                    <MapPin />
                  </div>
                  <div className="access-content">
                    <h3>Travel Information</h3>
                    <p>Essential guides, tips, and local insights for your journey</p>
                    <a href="/info" className="access-btn">
                      Learn More
                      <ArrowRight className="btn-arrow" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="testimonials-section">
          <div className="container">
            <div className="text-center mb-5">
              <div className="section-badge">
                <span>Testimonials</span>
              </div>
              <h2 className="section-title">Trusted by Discerning Travelers</h2>
              <p className="section-subtitle">
                Real experiences from travelers who let AI plan their perfect trips
              </p>
            </div>
            
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="testimonial-card">
                  <div className="testimonial-rating" role="img" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="star-icon filled" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="testimonial-quote">
                    "The AI itinerary was a game-changer. It planned our anniversary trip flawlessly, 
                    finding hidden gems we never would have discovered on our own. Truly effortless luxury."
                  </blockquote>
                  <div className="testimonial-author">
                    <div className="author-avatar" aria-hidden="true">A</div>
                    <div className="author-info">
                      <strong>Alexandra V.</strong>
                      <span>Anniversary Trip</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="testimonial-card">
                  <div className="testimonial-rating" role="img" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="star-icon filled" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="testimonial-quote">
                    "I was skeptical about an AI planning my family's vacation, but it was incredible. 
                    It balanced activities for the kids with relaxation for us perfectly. We saved so much time."
                  </blockquote>
                  <div className="testimonial-author">
                    <div className="author-avatar" aria-hidden="true">M</div>
                    <div className="author-info">
                      <strong>Michael B.</strong>
                      <span>Family Vacation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}