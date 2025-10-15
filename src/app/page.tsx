"use client";

import React, { useEffect, useState, useCallback, useReducer, useRef, memo } from "react";
import { 
  ChevronDown, 
  Sparkles, 
  Clock, 
  MapPin, 
  Star, 
  ArrowRight, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Award,
  TrendingDown,
  CheckCircle,
  Users,
  Heart
} from "lucide-react";

// Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
const ITEMS_PER_PAGE = 12;

// Input sanitization utility
const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 200);
};

// Custom debounce hook
const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Search state types
interface SearchState {
  activeFilter: string;
  searchQuery: string;
  searchResults: any[];
  totalResults: number;
  isSearching: boolean;
  searchAttempted: boolean;
  currentPage: number;
  error: string | null;
}

type SearchAction = 
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_SEARCHING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: { results: any[]; total: number } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_PAGE'; payload: number };

// Search state reducer
const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
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

// Custom Carousel Component - Memoized for performance
const CustomCarousel = memo(({ images }: { images: Array<{ src: string; alt: string; title: string }> }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => prev === 0 ? images.length - 1 : prev - 1);
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  useEffect(() => {
    // Preload first image
    const img = new Image();
    img.src = images[0].src;
    img.onload = () => setIsLoading(false);
  }, [images]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
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
      aria-label="Hero image carousel"
    >
      {isLoading && (
        <div className="carousel-loading">
          <div className="spinner-large" />
        </div>
      )}
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
              onError={(e) => {
                // Fallback to placeholder on error
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80';
              }}
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
      >
        <ChevronLeft size={32} />
      </button>

      <button
        className="carousel-control carousel-control-next"
        onClick={nextSlide}
        aria-label="Next slide"
        type="button"
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
});

CustomCarousel.displayName = 'CustomCarousel';

// Trust Badges Component
const TrustBadges = memo(() => (
  <div className="trust-badges">
    <div className="trust-badge">
      <Shield size={20} />
      <span>Secure Booking</span>
    </div>
    <div className="trust-badge">
      <Award size={20} />
      <span>Verified Locals</span>
    </div>
    <div className="trust-badge">
      <TrendingDown size={20} />
      <span>Best Price Guarantee</span>
    </div>
    <div className="trust-badge">
      <CheckCircle size={20} />
      <span>Instant Confirmation</span>
    </div>
  </div>
));

TrustBadges.displayName = 'TrustBadges';

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
  const searchSectionRef = useRef<HTMLElement>(null);

  const heroImages = [
    {
      src: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80",
      alt: "Grace Bay Beach - pristine turquoise waters and white sand",
      title: "Paradise Awaits"
    },
    {
      src: "https://images.unsplash.com/photo-1582610116397-edb318620f90?w=1920&q=80",
      alt: "Luxury beachfront villa with infinity pool overlooking ocean",
      title: "Luxury Redefined"
    },
    {
      src: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80",
      alt: "Stunning sunset over tropical paradise waters",
      title: "Unforgettable Moments"
    }
  ];

  const filterOptions = [
    { id: 'all', label: 'All Experiences', endpoint: '/services' },
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

  const handleFilterChange = useCallback((filterId: string) => {
    dispatch({ type: 'SET_FILTER', payload: filterId });
  }, []);

  const handleSearchQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    dispatch({ type: 'SET_QUERY', payload: sanitized });
  }, []);

  const performSearch = async (query: string, filter: string, page = 1) => {
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
        results = data.filter((item: any) => {
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
        payload: (error as Error).name === 'AbortError' ? 'Request timeout' : 'Failed to load results'
      });
    }
  };

  const handlePageChange = useCallback((newPage: number) => {
    dispatch({ type: 'SET_PAGE', payload: newPage });
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const totalPages = Math.ceil(searchState.totalResults / ITEMS_PER_PAGE);

  return (
    <>
      {/* SEO Meta Tags - You should add these in your layout.tsx or _app.tsx */}
      <div style={{ display: 'none' }}>
        <h1>Turks Explorer - Your AI-Powered Travel Agent for Turks & Caicos</h1>
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        <span id="search-announcement"></span>
      </div>

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <section 
        className={`hero-carousel ${isLoaded ? 'loaded' : ''}`}
        aria-label="Hero banner with AI travel planner"
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
            Exclusive local experiences, better prices than Airbnb & Viator, 
            with instant AI-powered itineraries. Real locals, real savings.
          </p>
          
          <div className="hero-ai-form">
            <div className="ai-input-container">
              <label htmlFor="hero-vacation-input" className="sr-only">
                Describe your perfect vacation
              </label>
              <input
                id="hero-vacation-input"
                type="text"
                className="ai-input"
                placeholder="e.g., '3-day romantic getaway with private dining and snorkeling'"
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
            
            <TrustBadges />
          </div>

          {/* Social Proof Counter */}
          <div className="hero-stats">
            <div className="stat-item">
              <Users size={20} />
              <span><strong>2,847</strong> trips planned</span>
            </div>
            <div className="stat-item">
              <Heart size={20} />
              <span><strong>4.9/5</strong> rating</span>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content">
        {/* Value Proposition Banner */}
        <section className="value-banner">
          <div className="container">
            <div className="value-content">
              <h2>
                <TrendingDown size={24} />
                Save 15-30% vs Major Booking Sites
              </h2>
              <p>
                Direct bookings with verified local vendors. No hidden fees. 
                <strong> If you find it cheaper elsewhere, we'll match it + $10 credit.</strong>
              </p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works-section">
          <div className="container">
            <div className="text-center mb-5">
              <div className="section-badge">
                <span>How It Works</span>
              </div>
              <h2 className="section-title">Book in 3 Simple Steps</h2>
              <p className="section-subtitle">
                From dream to reality in minutes, not hours
              </p>
            </div>
            
            <div className="row g-4">
              {[
                {
                  step: "01",
                  title: "Tell Us Your Dream",
                  description: "Describe your ideal vacation in plain English. Budget, vibe, activities - whatever matters to you.",
                  icon: "💭"
                },
                {
                  step: "02", 
                  title: "AI Creates Your Plan",
                  description: "Our AI instantly builds a personalized itinerary with exclusive local experiences you won't find elsewhere.",
                  icon: "🤖"
                },
                {
                  step: "03",
                  title: "Book Instantly", 
                  description: "Review, customize if needed, and book everything with one click. Instant confirmation, no waiting.",
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
              <h2 className="section-title">Browse Exclusive Experiences</h2>
              <p className="section-subtitle">
                Handpicked activities & stays from verified local vendors
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
                  <label htmlFor="main-search-input" className="sr-only">
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
                      const mainImage = result.images?.find((img: any) => img.isMain);
                      const imageUrl = mainImage?.url || result.images?.[0]?.url || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80";

                      return (
                        <div key={result._id?.$oid || result.id || index} className="result-card">
                          {result.isExclusive && (
                            <div className="exclusive-badge">
                              <Award size={14} />
                              <span>Exclusive</span>
                            </div>
                          )}
                          {result.isLocalOwned && (
                            <div className="local-badge">
                              <CheckCircle size={14} />
                              <span>Local Owned</span>
                            </div>
                          )}
                          <div className="result-image-container">
                            <img
                              src={imageUrl}
                              alt={result.name || 'Service image'}
                              className="result-image"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80';
                              }}
                            />
                            <div className="result-overlay" aria-hidden="true"></div>
                          </div>
                          <div className="result-content">
                            <div className="result-category">{result.serviceType || result.category}</div>
                            <h4 className="result-title">{result.name}</h4>
                            <p className="result-description">{result.description}</p>
                            {result.rating && (
                              <div className="result-rating">
                                <Star size={14} className="star-filled" />
                                <span>{result.rating}</span>
                                <span className="review-count">({result.reviewCount || 0} reviews)</span>
                              </div>
                            )}
                            {(result.pricePerNight || result.price) && (
                              <div className="result-price">
                                From ${result.pricePerNight || result.price}
                                {result.compareAtPrice && (
                                  <span className="compare-price">${result.compareAtPrice}</span>
                                )}
                              </div>
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
                    <nav className="pagination-container" aria-label="Pagination">
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(searchState.currentPage - 1)}
                        disabled={searchState.currentPage === 1}
                        aria-label="Previous page"
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
                  <h3>No Results Found</h3>
                  <p className="text-muted">
                    We couldn't find any matches for your search.
                    <br />
                    Try different keywords or browse our categories below.
                  </p>
                </div>
              )}
            </div>
            
            <div className="quick-browse mt-5">
              <h3 className="quick-browse-title">Popular Categories</h3>
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
              <h2 className="section-title">Curated by Locals</h2>
              <p className="section-subtitle">
                Handpicked experiences from verified Turks & Caicos residents
              </p>
            </div>
            
            <div className="categories-grid">
              {[
                {
                  title: "Things To Do",
                  image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
                  href: "/things-to-do",
                  description: "Adventure & Activities",
                  badge: "50+ Experiences"
                },
                {
                  title: "Villas & Stays",
                  image: "https://images.unsplash.com/photo-1582610116397-edb318620f90?w=800&q=80", 
                  href: "/stays",
                  description: "Premium Accommodations",
                  badge: "Exclusive Properties"
                },
                {
                  title: "Transportation",
                  image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
                  href: "/transportationcategories",
                  description: "Taxis & Rentals",
                  badge: "Instant Booking"
                },
                {
                  title: "Wellness & Spa",
                  image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
                  href: "/wellnessspa", 
                  description: "Relaxation & Rejuvenation",
                  badge: "Luxury Spas"
                }
              ].map((category, index) => (
                <div key={index} className="category-item">
                  <div className="category-card">
                    <div className="category-badge-top">{category.badge}</div>
                    <div className="category-image-container">
                      <img
                        src={category.image}
                        alt={`${category.title} - ${category.description}`}
                        className="category-image"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80';
                        }}
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

        <section className="testimonials-section">
          <div className="container">
            <div className="text-center mb-5">
              <div className="section-badge">
                <span>Real Reviews</span>
              </div>
              <h2 className="section-title">Loved by 2,800+ Travelers</h2>
              <p className="section-subtitle">
                Join thousands who've discovered better prices and authentic local experiences
              </p>
            </div>
            
            <div className="row g-4">
              <div className="col-lg-4">
                <div className="testimonial-card">
                  <div className="testimonial-rating" role="img" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="star-icon filled" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="testimonial-quote">
                    "Saved $800 vs Airbnb and got way better experiences. The AI itinerary found hidden gems we never would have discovered. Worth every penny."
                  </blockquote>
                  <div className="testimonial-author">
                    <div className="author-avatar" aria-hidden="true">A</div>
                    <div className="author-info">
                      <strong>Alexandra V.</strong>
                      <span>Verified • May 2025</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="testimonial-card">
                  <div className="testimonial-rating" role="img" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="star-icon filled" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="testimonial-quote">
                    "The local vendors are the real deal. We did a fishing trip that wasn't on Viator - just us and a local captain. Best day of our trip!"
                  </blockquote>
                  <div className="testimonial-author">
                    <div className="author-avatar" aria-hidden="true">M</div>
                    <div className="author-info">
                      <strong>Michael B.</strong>
                      <span>Verified • April 2025</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="testimonial-card">
                  <div className="testimonial-rating" role="img" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="star-icon filled" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="testimonial-quote">
                    "Instant booking confirmation, responsive WhatsApp support, and prices 20% lower than other sites. This is how travel booking should work."
                  </blockquote>
                  <div className="testimonial-author">
                    <div className="author-avatar" aria-hidden="true">S</div>
                    <div className="author-info">
                      <strong>Sarah Chen</strong>
                      <span>Verified • March 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <div className="cta-card">
              <h2>Ready to Experience the Difference?</h2>
              <p>Join 2,800+ travelers who chose local over corporate, savings over markups, and authenticity over algorithms.</p>
              <div className="cta-buttons">
                <a href="/ai-itinerary" className="btn btn-primary btn-lg">
                  <Sparkles size={20} />
                  Plan with AI
                </a>
                <a href="#search-section" className="btn btn-outline-light btn-lg">
                  Browse Experiences
                </a>
              </div>
              <div className="cta-guarantee">
                <Shield size={20} />
                <span>Best Price Guarantee • Instant Confirmation • 24/7 Support</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}