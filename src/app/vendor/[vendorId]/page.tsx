// File path: src/app/vendor/[vendorId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, MapPin, Phone, Globe, Instagram, Facebook, Twitter, Award, Users, Calendar, Grid, List, ChevronDown, ExternalLink, ArrowLeft, Share2, Heart, Search } from 'lucide-react';
import Head from 'next/head';
import styles from './vendorProfile.module.css';

// MARK: TypeScript Interfaces
interface VendorData {
  _id: string;
  name: string;
  businessName: string;
  businessType: string;
  description: string;
  location: {
    address: {
      street: string;
      city: string;
      island: string;
      postalCode: string;
    };
    island: string;
  };
  contact: {
    phone?: string;
    website?: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  servicesOffered: string[];
  images: {
    logo?: string;
    coverImage?: string;
  };
  operatingHours: Array<{
    day: string;
    openTime: string;
    closeTime: string;
  }>;
  metrics: {
    totalServices: number;
    totalReviews: number;
    averageRating: number;
    serviceTypes: string[];
  };
  memberSince: string;
}

interface Service {
  _id: string;
  name: string;
  description: string;
  images: Array<{ url: string; isMain?: boolean }>;
  price?: number; // Make price optional
  pricePerNight?: number; // Add optional pricePerNight for stays
  pricingType?: string; // Make pricingType optional
  serviceType: string;
  category: string;
  averageRating: number;
  reviewCount: number;
  location: string;
}

// MARK: Utility Functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
};

const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const starSizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={`full-${i}`} className={`${starSizeClass} text-yellow-400 fill-yellow-400`} />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className={`${starSizeClass} text-gray-300`} />
          <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
            <Star className={`${starSizeClass} text-yellow-400 fill-yellow-400`} />
          </div>
        </div>
      );
    } else {
      stars.push(<Star key={`empty-${i}`} className={`${starSizeClass} text-gray-300`} />);
    }
  }
  return <div className="flex items-center gap-1">{stars}</div>;
};


// MARK: VendorProfilePage Component
const VendorProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('services');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        const [vendorResponse, servicesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/vendors/public/${vendorId}`),
          fetch(`${API_BASE_URL}/api/vendors/public/${vendorId}/services`)
        ]);

        if (!vendorResponse.ok) throw new Error('Vendor not found');
        
        const vendorData = await vendorResponse.json();
        setVendor(vendorData.data);

        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setServices(servicesData.data.services);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vendor profile');
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) fetchVendorData();
  }, [vendorId, API_BASE_URL]);

  const handleServiceClick = (serviceId: string, serviceType: string) => {
    router.push(`/${serviceType.toLowerCase()}s/${serviceId}`);
  };

  const handleShare = async () => {
    if (navigator.share && vendor) {
      try {
        await navigator.share({
          title: vendor.businessName,
          text: `Check out ${vendor.businessName} on our platform!`,
          url: window.location.href,
        });
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const filteredServices = services
    .filter(service => serviceFilter === 'all' || service.serviceType.toLowerCase() === serviceFilter.toLowerCase())
    .sort((a, b) => {
        switch (sortBy) {
            case 'rating': return b.averageRating - a.averageRating;
            case 'price-low': return a.price - b.price;
            case 'price-high': return b.price - a.price;
            case 'newest':
            default: return 0; // Assuming default order is newest, requires date field
        }
    });

  if (loading) return <VendorProfileSkeleton />;

  if (error || !vendor) {
    return (
      <div className={styles.errorContainer}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The vendor profile you are looking for does not exist.'}</p>
          <button onClick={() => router.back()} className={styles.primaryButton}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${vendor.businessName} - ${vendor.location.island}`}</title>
        <meta name="description" content={vendor.description} />
        <meta property="og:title" content={vendor.businessName} />
        <meta property="og:description" content={vendor.description} />
        <meta property="og:image" content={vendor.images.coverImage || vendor.images.logo} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/vendor/${vendorId}`} />
      </Head>

      <div className={styles.pageContainer}>
        {/* MARK: Vendor Header */}
        <div className={styles.vendorHeader}>
            <div 
              className={styles.coverImage}
              style={{ backgroundImage: vendor.images.coverImage ? `url(${vendor.images.coverImage})` : 'none' }}
            />
            <div className={styles.headerContent}>
              <div className={styles.headerInfo}>
                <div className={styles.logoContainer}>
                  <img
                    src={vendor.images.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.businessName)}&size=128&background=0D8BD9&color=fff&bold=true`}
                    alt={`${vendor.businessName} logo`}
                    className={styles.vendorLogo}
                  />
                  <div className={styles.verifiedBadge}>
                    <Award className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className={styles.businessName}>{vendor.businessName}</h1>
                  <p className={styles.businessType}>{vendor.businessType}</p>
                  <div className={styles.metaInfo}>
                    <span className={styles.metaItem}><MapPin className="w-4 h-4"/>{vendor.location.island}</span>
                    <span className={styles.metaItem}><Calendar className="w-4 h-4"/>Member since {formatDate(vendor.memberSince)}</span>
                    <div className={`${styles.metaItem} ${styles.ratingWrapper}`}>
                      {renderStars(vendor.metrics.averageRating)}
                      <span className="font-semibold">{vendor.metrics.averageRating}</span>
                      <span className="text-gray-500">({vendor.metrics.totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.headerActions}>
                  <button onClick={handleShare} className={styles.actionButton} title="Share">
                      <Share2 className="w-5 h-5" /> <span>Share</span>
                  </button>

              </div>
            </div>
        </div>

        {/* MARK: Main Content */}
        <div className={styles.mainLayout}>
          <div className={styles.mainContent}>
            {/* Tabs Navigation */}
            <div className={styles.tabNav}>
              {[
                { id: 'services', label: 'Services', count: vendor.metrics.totalServices },
                { id: 'about', label: 'About' },
                { id: 'reviews', label: 'Reviews', count: vendor.metrics.totalReviews }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                >
                  {tab.label}
                  {typeof tab.count !== 'undefined' && <span className={styles.tabCount}>{tab.count}</span>}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {activeTab === 'services' && (
                <div>
                  {/* Filters & Controls */}
                  <div className={styles.filterControls}>
                    <div className="flex-1 flex gap-2 md:gap-4 flex-wrap">
                      <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className={styles.filterSelect}>
                        <option value="all">All Service Types</option>
                        {vendor.metrics.serviceTypes.map(type => <option key={type} value={type.toLowerCase()}>{type}</option>)}
                      </select>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.filterSelect}>
                        <option value="newest">Sort by: Newest</option>
                        <option value="rating">Sort by: Highest Rated</option>
                        <option value="price-low">Sort by: Price Low-High</option>
                        <option value="price-high">Sort by: Price High-Low</option>
                      </select>
                    </div>
                    <div className={styles.viewToggle}>
                      <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? styles.active : ''} title="Grid View"><Grid className="w-5 h-5" /></button>
                      <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? styles.active : ''} title="List View"><List className="w-5 h-5" /></button>
                    </div>
                  </div>

                  {/* Services Grid/List */}
                  {filteredServices.length > 0 ? (
                    <div className={viewMode === 'grid' ? styles.servicesGrid : styles.servicesList}>
                      {filteredServices.map(service => (
                        <ServiceCard key={service._id} service={service} viewMode={viewMode} onClick={() => handleServiceClick(service._id, service.serviceType)} />
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noResults}>
                      <Search className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800">No services found</h3>
                      <p className="text-gray-500">Try adjusting your filters.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'about' && <AboutTab vendor={vendor} />}
              {activeTab === 'reviews' && <ReviewsTab vendor={vendor} />}
            </div>
          </div>

          {/* MARK: Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarStickyContent}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Contact Information</h3>
                <div className={styles.contactInfo}>
                  <div className={styles.contactItem}><MapPin className="icon"/><div><h4>{vendor.location.address.street}</h4><p>{`${vendor.location.address.city}, ${vendor.location.address.island}`}</p></div></div>
                  {vendor.contact.phone && <div className={styles.contactItem}><Phone className="icon"/><a href={`tel:${vendor.contact.phone}`}>{vendor.contact.phone}</a></div>}
                  {vendor.contact.website && <div className={styles.contactItem}><Globe className="icon"/><a href={vendor.contact.website} target="_blank" rel="noopener noreferrer">Visit Website <ExternalLink className="inline w-4 h-4 ml-1"/></a></div>}
                </div>
              </div>

              {(vendor.socialMedia.facebook || vendor.socialMedia.instagram || vendor.socialMedia.twitter) && (
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Follow Us</h3>
                  <div className={styles.socialMediaGrid}>
                    {vendor.socialMedia.facebook && <a href={`https://${vendor.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className={`${styles.socialButton} ${styles.facebook}`}><Facebook className="w-5 h-5" /></a>}
                    {vendor.socialMedia.instagram && <a href={`https://instagram.com/${vendor.socialMedia.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className={`${styles.socialButton} ${styles.instagram}`}><Instagram className="w-5 h-5" /></a>}
                    {vendor.socialMedia.twitter && <a href={`https://twitter.com/${vendor.socialMedia.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className={`${styles.socialButton} ${styles.twitter}`}><Twitter className="w-5 h-5" /></a>}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};


// MARK: Sub-Components
// MARK: Sub-Components
const ServiceCard = ({ service, viewMode, onClick }: { service: Service, viewMode: 'grid' | 'list', onClick: () => void }) => {
  // --- START DEBUGGING ---
  // The following console logs will help us see the exact data for each service card.
  // Press F12 or Ctrl+Shift+I in your browser to open the developer console and view the output.
  if (service.name === "MY Home") { // We log only the problematic service to keep the console clean
    console.log("--- DEBUGGING SERVICE: 'MY Home' ---");
    console.log("Entire 'service' object received by card:", service);
    console.log(`1. Is 'service.serviceType' exactly "Stay"? -> `, service.serviceType === 'Stay');
    console.log(`2. What is the value of 'service.pricePerNight'? -> `, service.pricePerNight);
    console.log(`3. What is the type of 'service.pricePerNight'? -> `, typeof service.pricePerNight);
    console.log("------------------------------------");
  }
  // --- END DEBUGGING ---

  const isStay = service.serviceType === 'Stay';
  const displayPrice = isStay ? service.pricePerNight : service.price;
  const displayType = isStay ? 'night' : service.pricingType;

  const formattedPrice = typeof displayPrice === 'number'
    ? `$${displayPrice.toFixed(0)}`
    : null;

  return (
    <div onClick={onClick} className={`${styles.serviceCard} ${viewMode === 'list' ? styles.serviceCardList : ''}`}>
      <div className={styles.serviceCardImageWrapper}>
        <img src={service.images[0]?.url || `https://picsum.photos/400/300?random=${service._id}`} alt={service.name} className={styles.serviceCardImage} />
        <div className={styles.serviceCardBadge}>{service.serviceType}</div>
      </div>
      <div className={styles.serviceCardContent}>
        <h3 className={styles.serviceCardTitle}>{service.name}</h3>
        <p className={styles.serviceCardDescription}>{service.description}</p>
        <div className={styles.serviceCardFooter}>
          <div className={styles.serviceCardPrice}>
            {formattedPrice ? (
              <>
                <span>{formattedPrice}</span>
                {displayType && <span className={styles.priceType}>/ {displayType}</span>}
              </>
            ) : (
              <span>Contact for price</span>
            )}
          </div>
          <div className={styles.serviceCardRating}>
            {renderStars(service.averageRating)}
            <span className="text-gray-500 text-sm">({service.reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutTab = ({ vendor }: { vendor: VendorData }) => (
  <div className="space-y-8">
    <div>
      <h3 className={styles.sectionTitle}>About {vendor.businessName}</h3>
      <p className={styles.descriptionText}>{vendor.description}</p>
    </div>
    <div>
      <h4 className={styles.sectionTitle}>Services Offered</h4>
      <div className={styles.tagsContainer}>
        {vendor.servicesOffered.map(service => <span key={service} className={styles.tag}>{service}</span>)}
      </div>
    </div>
    {vendor.operatingHours && vendor.operatingHours.length > 0 && (
      <div>
        <h4 className={styles.sectionTitle}>Operating Hours</h4>
        <div className={styles.operatingHours}>
          {vendor.operatingHours.map(h => <div key={h.day}><span>{h.day}</span><span>{`${h.openTime} - ${h.closeTime}`}</span></div>)}
        </div>
      </div>
    )}
  </div>
);

const ReviewsTab = ({ vendor }: { vendor: VendorData }) => (
  <div className={styles.reviewsSection}>
    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
        <div className="text-center">
            <div className={styles.reviewsRatingBig}>{vendor.metrics.averageRating.toFixed(1)}</div>
            <div>{renderStars(vendor.metrics.averageRating, 'lg')}</div>
            <p className="text-gray-500 mt-2">Based on {vendor.metrics.totalReviews} reviews</p>
        </div>
        <div className="flex-1 w-full">
            {/* Placeholder for rating breakdown */}
            <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">{star} star</span>
                        <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-yellow-400 h-2.5 rounded-full" style={{width: `${Math.random() * 80 + 10}%`}}></div></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
    <div className={styles.reviewsPlaceholder}>
        <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>User review system is coming soon!</p>
    </div>
  </div>
);

const VendorProfileSkeleton = () => (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gray-200 h-64 w-full"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 sm:-mt-20 md:-mt-24 flex items-end space-x-5">
          <div className="bg-gray-300 rounded-2xl h-32 w-32 md:h-40 md:w-40 border-4 border-white"></div>
          <div className="pb-4 flex-1 space-y-3">
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
  
      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-12 bg-gray-200 rounded-t-lg"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
  

export default VendorProfilePage;