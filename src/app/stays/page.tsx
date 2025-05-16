'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './stayspage.module.css';
import { useRouter } from 'next/navigation'; // Add this import at the top

// Define types based on your MongoDB models
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface RoomImage {
  url: string;
  isMain: boolean;
  _id?: string;
}

interface Room {
  name: string;
  pricePerNight: number;
  maxGuests: number;
  bedType: string;
  bathrooms: number;
  bedrooms?: number;
  images: string[];
  amenities: string[];
  _id?: string;
}

interface Policy {
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
}

interface Review {
  user: string; // This would be an ObjectId in MongoDB
  rating: number;
  comment: string;
  createdAt: Date;
}

interface Stay {
  _id: string;
  name: string;
  description: string;
  location: string;
  coordinates: Coordinates;
  images: RoomImage[];
  island: string;
  host: string | null; // This would be an ObjectId in MongoDB
  reviews: Review[];
  type: 'Hotel' | 'Villa' | 'Airbnb';
  serviceType?: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[]; // This should be an array, but may not be in the data
  allowsDeposit: boolean;
  rooms: Room[];
  policies: Policy;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Filter type definition
type StayType = 'All' | 'Hotel' | 'Villa' | 'Airbnb';
type IslandOption = 'All Islands' | 'Providenciales' | 'North Caicos' | 'Middle Caicos' | 'South Caicos' | 'Grand Turk' | 'Salt Cay';

export default function StaysPage() {
  const [stays, setStays] = useState<Stay[]>([]);
  const [filteredStays, setFilteredStays] = useState<Stay[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIsland, setSelectedIsland] = useState<IslandOption>('All Islands');
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<StayType>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<string[]>([]);
  const [stayDuration, setStayDuration] = useState<number>(1); // Default 1 night
  const router = useRouter();
  
  // New state for tracking which stay cards are being hovered
  const [hoveredStayId, setHoveredStayId] = useState<string | null>(null);
  // Track active image index for each stay
  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});
  
  // List of islands
  const islands: IslandOption[] = [
    'All Islands', 'Providenciales', 'North Caicos', 'Middle Caicos', 
    'South Caicos', 'Grand Turk', 'Salt Cay'
  ];

  const slideTransitionRef = useRef({});












  
  // Calculate stay duration when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      
      // Calculate difference in days
      const timeDiff = endDate.getTime() - startDate.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // Ensure we have at least 1 night
      setStayDuration(nights > 0 ? nights : 1);
    } else {
      // Default to 1 night if dates are not set
      setStayDuration(1);
    }
  }, [checkInDate, checkOutDate]);

  // Helper function to ensure amenities is always an array
  const ensureArray = (value: any): string[] => {
    if (Array.isArray(value)) {
      return value;
    } else if (value && typeof value === 'string') {
      // If it's a string, split by commas or return as a single-item array
      return value.includes(',') ? value.split(',').map(item => item.trim()) : [value];
    }
    return []; // Default to empty array if null, undefined, or other non-array type
  };

  // Fetch stays from the API
  useEffect(() => {
    const fetchStays = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/services/type/stays');
        if (!response.ok) {
          throw new Error(`Error fetching stays: ${response.statusText}`);
        }
        const data: Stay[] = await response.json();
        
        // Process the data to ensure amenities is always an array
        const processedData = data.map(stay => ({
          ...stay,
          amenities: ensureArray(stay.amenities)
        }));
        
        setStays(processedData);
        setFilteredStays(processedData);
        
        // Extract all unique amenities from the data
        const allAmenities = new Set<string>();
        processedData.forEach(stay => {
          stay.amenities.forEach(amenity => {
            allAmenities.add(amenity);
          });
        });
        setAvailableAmenities(Array.from(allAmenities));
        
        // Initialize activeImageIndices with 0 for each stay
        const initialIndices: Record<string, number> = {};
        processedData.forEach(stay => {
          initialIndices[stay._id] = 0;
        });
        setActiveImageIndices(initialIndices);
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
        console.error('Failed to fetch stays:', err);
      }
    };

    fetchStays();
  }, []);

  // Filter stays based on search query, island, dates, type and amenities
  useEffect(() => {
    let filtered = stays;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(stay => 
        stay.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stay.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stay.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by island
    if (selectedIsland !== 'All Islands') {
      filtered = filtered.filter(stay => 
        stay.island === selectedIsland || 
        stay.location.includes(selectedIsland)
      );
    }
    
    // Filter by stay type
    if (typeFilter !== 'All') {
      filtered = filtered.filter(stay => stay.type === typeFilter);
    }
    
    // Filter by amenities (only if amenities are selected)
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(stay => 
        selectedAmenities.every(amenity => 
          stay.amenities.some(stayAmenity => 
            stayAmenity.toLowerCase() === amenity.toLowerCase()
          )
        )
      );
    }
    
    // Filter by date (would need additional logic for availability check)
    if (checkInDate && checkOutDate) {
      // In a real application, you would check availability for these dates
      console.log(`Filtering for dates: ${checkInDate} to ${checkOutDate}`);
      // For now, we're not actually filtering by date since we don't have availability data
    }
    
    setFilteredStays(filtered);
  }, [searchQuery, selectedIsland, checkInDate, checkOutDate, typeFilter, selectedAmenities, stays]);

  // Add this function to handle card click
const handleStayCardClick = (stayId: string) => {
  router.push(`/staydetails?id=${stayId}`);};
  
  // Handle search form submissionZ
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchExpanded(false);
    // Search is already handled by the useEffect
  };

  // Toggle expanded search
  const toggleSearchExpand = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  // Toggle amenity selection
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prevSelected => {
      if (prevSelected.includes(amenity)) {
        return prevSelected.filter(item => item !== amenity);
      } else {
        return [...prevSelected, amenity];
      }
    });
  };

  // Handle favoriting a stay
  const handleFavorite = (id: string) => {
    // In a real app, this would call an API to save the favorite
    console.log(`Favorited stay with id: ${id}`);
  };

  // Calculate average rating
  const getAverageRating = (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(2);
  };

  // Get all images for a stay
  const getStayImages = (stay: Stay): string[] => {
    if (stay.images && stay.images.length > 0) {
      return stay.images.map(image => {
        if (image.url && image.url.startsWith('http')) {
          return image.url;
        }
        return '/api/placeholder/400/267';
      });
    }
    return ['/api/placeholder/400/267']; // Default placeholder
  };

  // Get current image URL for a stay
  const getCurrentImageUrl = (stay: Stay): string => {
    const images = getStayImages(stay);
    const activeIndex = activeImageIndices[stay._id] || 0;
    return images[activeIndex];
  };

  // Handle image navigation
  const handlePrevImage = (stayId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    setActiveImageIndices(prev => {
      const currentIndex = prev[stayId] || 0;
      const stay = stays.find(s => s._id === stayId);
      if (!stay) return prev;
      
      const imagesCount = stay.images?.length || 1;
      // Go to last image if at the first image
      const newIndex = (currentIndex - 1 + imagesCount) % imagesCount;
      
      return { ...prev, [stayId]: newIndex };
    });
  };

  const handleNextImage = (stayId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    setActiveImageIndices(prev => {
      const currentIndex = prev[stayId] || 0;
      const stay = stays.find(s => s._id === stayId);
      if (!stay) return prev;
      
      const imagesCount = stay.images?.length || 1;
      // Go to first image if at the last image
      const newIndex = (currentIndex + 1) % imagesCount;
      
      return { ...prev, [stayId]: newIndex };
    });
  };

  // Set active image directly
  const setActiveImage = (stayId: string, index: number) => {
    setActiveImageIndices(prev => ({
      ...prev,
      [stayId]: index
    }));
  };

  // Calculate total price based on length of stay
  const calculateTotalPrice = (pricePerNight: number) => {
    return pricePerNight * stayDuration;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          
          <div className={styles.searchContainer}>
            <form className={`${styles.searchBar} ${isSearchExpanded ? styles.expanded : ''}`} onSubmit={handleSearch}>
              <div className={styles.searchFields}>
                <div className={styles.searchField}>
                  <label>Island</label>
                  <select
                    value={selectedIsland}
                    onChange={(e) => setSelectedIsland(e.target.value as IslandOption)}
                    className={styles.islandSelect}
                  >
                    {islands.map((island) => (
                      <option key={island} value={island}>{island}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.dateFields}>
                  <div className={styles.searchField}>
                    <label>Check in</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className={styles.searchField}>
                    <label>Check out</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

              </div>

            </form>

          </div>
          
          <div className={styles.userMenu}>
            <a href="#" className={styles.hostLink}>Become a Host</a>
            <div className={styles.userProfile}>
              <span>☰</span>
              <span>👤</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className={styles.filtersContainer}>
        <div className={styles.typeFilter}>
          <select 
            className={styles.typeSelect}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as StayType)}
          >
            <option value="All">All Types</option>
            <option value="Hotel">Hotel</option>
            <option value="Villa">Villa</option>
            <option value="Airbnb">Airbnb</option>
          </select>
        </div>
        
        <div className={styles.filterBar}>
          {availableAmenities.map((amenity) => (
            <div 
              key={amenity}
              className={`${styles.filterItem} ${selectedAmenities.includes(amenity) ? styles.active : ''}`}
              onClick={() => toggleAmenity(amenity)}
            >
              <span className={styles.filterName}>{amenity}</span>
            </div>
          ))}
        </div>
      </div>
      
      <main className={styles.container}>
        {isLoading ? (
          <div className={styles.loadingState}>Loading stays...</div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>Error loading stays: {error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        ) : filteredStays.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No stays found matching your criteria. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className={styles.listings}>
            {filteredStays.map((stay) => (
              <div 
  key={stay._id} 
  className={styles.listingCard}
  onMouseEnter={() => setHoveredStayId(stay._id)}
  onMouseLeave={() => setHoveredStayId(null)}
  onClick={() => handleStayCardClick(stay._id)}
  style={{ cursor: 'pointer' }} // Add cursor pointer to indicate it's clickable
>
                <div className={styles.listingImage}>
                  <img 
                    src={getCurrentImageUrl(stay)} 
                    alt={stay.name} 
                  />
                  <button 
                    className={styles.likeButton}
                    onClick={() => handleFavorite(stay._id)}
                  >
                    ♡
                  </button>
                  
                  {/* Image Carousel Controls - Only show when hovered */}
                  {hoveredStayId === stay._id && stay.images && stay.images.length > 1 && (
                    <>
                      {/* Left Arrow */}
                      <button 
                        className={`${styles.carouselControl} ${styles.carouselPrev}`}
                        onClick={(e) => handlePrevImage(stay._id, e)}
                        aria-label="Previous image"
                      >
                        &lt;
                      </button>
                      
                      {/* Right Arrow */}
                      <button 
                        className={`${styles.carouselControl} ${styles.carouselNext}`}
                        onClick={(e) => handleNextImage(stay._id, e)}
                        aria-label="Next image"
                      >
                        &gt;
                      </button>
                      
                      {/* Pagination Indicators */}
                      <div className={styles.paginationIndicators}>
                        {stay.images.map((_, index) => (
                          <button 
                            key={index}
                            className={`${styles.paginationDot} ${
                              (activeImageIndices[stay._id] || 0) === index ? styles.activeDot : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImage(stay._id, index);
                            }}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className={styles.listingDetails}>
                  <div className={styles.listingLocation}>
                    <div className={styles.locationName}>
                      {stay.location}
                      {stay.island && <span className={styles.islandTag}> • {stay.island}</span>}
                    </div>
                    <div className={styles.listingRating}>
                      <span>★ {getAverageRating(stay.reviews) || 'New'}</span>
                    </div>
                  </div>
                  <div className={styles.listingName}>{stay.name}</div>
                  <div className={styles.listingType}>
                    {stay.type} • {stay.maxGuests} guests max
                  </div>
                  <div className={styles.listingAmenities}>
                    {stay.amenities.slice(0, 3).join(' • ')}
                  </div>
                  <div className={styles.listingPrice}>
                    ${stay.pricePerNight} night
                    <span className={styles.priceTotal}>
                      ${calculateTotalPrice(stay.pricePerNight)} total
                      {stayDuration > 1 ? ` for ${stayDuration} nights` : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h3>Support</h3>
              <div className={styles.footerLinks}>
                <a href="#" className={styles.footerLink}>Help Center</a>
                <a href="#" className={styles.footerLink}>AirCover</a>
                <a href="#" className={styles.footerLink}>Safety information</a>
                <a href="#" className={styles.footerLink}>Supporting people with disabilities</a>
                <a href="#" className={styles.footerLink}>Cancellation options</a>
              </div>
            </div>
            
            <div className={styles.footerSection}>
              <h3>Community</h3>
              <div className={styles.footerLinks}>
                <a href="#" className={styles.footerLink}>Disaster relief housing</a>
                <a href="#" className={styles.footerLink}>Combating discrimination</a>
              </div>
            </div>
            
            <div className={styles.footerSection}>
              <h3>Hosting</h3>
              <div className={styles.footerLinks}>
                <a href="#" className={styles.footerLink}>Try hosting</a>
                <a href="#" className={styles.footerLink}>AirCover for Hosts</a>
                <a href="#" className={styles.footerLink}>Explore hosting resources</a>
                <a href="#" className={styles.footerLink}>Visit our community forum</a>
                <a href="#" className={styles.footerLink}>How to host responsibly</a>
              </div>
            </div>
            
            <div className={styles.footerSection}>
              <div className={styles.footerLinks}>
                <a href="#" className={styles.footerLink}>Newsroom</a>
                <a href="#" className={styles.footerLink}>Learn about new features</a>
                <a href="#" className={styles.footerLink}>Letter from our founders</a>
                <a href="#" className={styles.footerLink}>Careers</a>
                <a href="#" className={styles.footerLink}>Investors</a>
              </div>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <div className={styles.footerBottomLeft}>
              <span>© 2025 StayFinder, Inc.</span>
              <a href="#" className={styles.footerLink}>Privacy</a>
              <a href="#" className={styles.footerLink}>Terms</a>
              <a href="#" className={styles.footerLink}>Sitemap</a>
            </div>
            
            <div className={styles.footerBottomRight}>
              <div className={styles.languageSelector}>
                <span>🌐</span>
                <span>English (US)</span>
              </div>
              
              <div className={styles.currencySelector}>
                <span>$ USD</span>
              </div>
              
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink}>FB</a>
                <a href="#" className={styles.socialLink}>TW</a>
                <a href="#" className={styles.socialLink}>IG</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}