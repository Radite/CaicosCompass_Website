// File Path: src/components/InfoPageDetail.jsx
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Eye, Star, ExternalLink, Phone, Globe, DollarSign, AlertTriangle, Lightbulb, Info, ChevronDown, ChevronUp, Navigation, Wifi, CreditCard, Car, Utensils, Waves, Shield, Sun, Map } from 'lucide-react';
import styles from './InfoPageDetail.module.css'; // Import CSS module

// Types (re-declared for clarity in this context, but ideally imported from a central types file)
/**
 * @typedef {Object} InfoPage
 * @property {string} _id
 * @property {string} title
 * @property {string} description
 * @property {string} slug
 * @property {string} icon
 * @property {string} color
 * @property {string} category
 * @property {boolean} featured
 * @property {number} priority
 * @property {number} views
 * @property {string} lastUpdated
 * @property {string[]} tags
 * @property {Section[]} sections
 * @property {MapMarker[]} markers
 */

/**
 * @typedef {Object} Section
 * @property {string} title
 * @property {ContentItem[]} content
 */

/**
 * @typedef {Object} ContentItem
 * @property {string} name
 * @property {string} description
 * @property {string} [image]
 * @property {Object} [additionalInfo]
 * @property {string} [additionalInfo.phone]
 * @property {string} [additionalInfo.website]
 * @property {string} [additionalInfo.address]
 * @property {string} [additionalInfo.hours]
 * @property {string} [additionalInfo.priceRange]
 * @property {string[]} [additionalInfo.features]
 * @property {string[]} [additionalInfo.tips]
 * @property {string[]} [additionalInfo.warnings]
 * @property {string[]} [additionalInfo.companies]
 * @property {string[]} [additionalInfo.locations]
 * @property {string[]} [additionalInfo.banks]
 * @property {string[]} [additionalInfo.fees]
 * @property {string[]} [additionalInfo.varieties]
 * @property {string[]} [additionalInfo.preparations]
 * @property {string[]} [additionalInfo.specialties]
 * @property {string[]} [additionalInfo.conditions]
 * @property {string[]} [additionalInfo.schools]
 * @property {string[]} [additionalInfo.topSites]
 * @property {string[]} [additionalInfo.marineLife]
 * @property {string[]} [additionalInfo.accepted]
 * @property {string[]} [additionalInfo.limitations]
 * @property {string[]} [additionalInfo.dishes]
 * @property {string[]} [additionalInfo.seasons]
 * @property {string[]} [additionalInfo.activities]
 * @property {string} [additionalInfo.restaurants]
 * @property {string} [additionalInfo.bars]
 * @property {string} [additionalInfo.taxis]
 * @property {string} [additionalInfo.hotels]
 * @property {string} [additionalInfo.tours]
 * @property {string} [additionalInfo.spas]
 */

/**
 * @typedef {Object} MapMarker
 * @property {Object} coordinates
 * @property {number} coordinates.latitude
 * @property {number} coordinates.longitude
 * @property {string} title
 * @property {string} description
 * @property {string} type
 */

/**
 * @typedef {Object} InfoPageDetailProps
 * @property {InfoPage} page
 * @property {() => void} onBack
 */

/**
 * Renders the detailed view of an information page.
 * @param {InfoPageDetailProps} props
 * @returns {React.FC}
 */
const InfoPageDetail = ({ page, onBack }) => {
  // State to manage the expansion of sections and content items
const [expandedSections, setExpandedSections] = useState(new Set([0])); // First section expanded by default
const [expandedContent, setExpandedContent] = useState(new Set());
const [userLocation, setUserLocation] = useState(null);
const [locationLoading, setLocationLoading] = useState(false);
const [locationError, setLocationError] = useState(null);
  /**
   * Toggles the expanded state of a section.
   * @param {number} index - The index of the section to toggle.
   */
  const toggleSection = (index) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  /**
   * Toggles the expanded state of a content item within a section.
   * @param {string} id - A unique ID for the content item (e.g., 'sectionIndex-contentIndex').
   */
  const toggleContent = (id) => {
    const newExpanded = new Set(expandedContent);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedContent(newExpanded);
  };

  /**
 * Gets the user's current location using the browser's geolocation API.
 */
const getUserLocation = () => {
  setLocationLoading(true);
  setLocationError(null);

  if (!navigator.geolocation) {
    setLocationError('Geolocation is not supported by this browser.');
    setLocationLoading(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      setLocationLoading(false);
    },
    (error) => {
      let errorMessage = 'Unable to retrieve your location.';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
      }
      setLocationError(errorMessage);
      setLocationLoading(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }
  );
};

/**
 * Opens directions from user's location to the marker in Google Maps.
 * @param {MapMarker} marker - The destination marker.
 */
const getDirections = (marker) => {
  if (!userLocation) {
    getUserLocation();
    return;
  }

  const directionsUrl = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${marker.coordinates.latitude},${marker.coordinates.longitude}`;
  window.open(directionsUrl, '_blank');
};

/**
 * Generates the map URL with both user location and marker if user location is available.
 * @param {MapMarker} marker - The marker to display.
 * @returns {string} The iframe src URL.
 */
const getMapUrl = (marker) => {
  if (userLocation) {
    // Calculate bounding box that includes both user location and marker
    const minLat = Math.min(userLocation.latitude, marker.coordinates.latitude) - 0.005;
    const maxLat = Math.max(userLocation.latitude, marker.coordinates.latitude) + 0.005;
    const minLon = Math.min(userLocation.longitude, marker.coordinates.longitude) - 0.005;
    const maxLon = Math.max(userLocation.longitude, marker.coordinates.longitude) + 0.005;
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon},${minLat},${maxLon},${maxLat}&layer=mapnik&marker=${marker.coordinates.latitude},${marker.coordinates.longitude}`;
  } else {
    // Just show the marker location
    return `https://www.openstreetmap.org/export/embed.html?bbox=${marker.coordinates.longitude-0.002},${marker.coordinates.latitude-0.002},${marker.coordinates.longitude+0.002},${marker.coordinates.latitude+0.002}&layer=mapnik&marker=${marker.coordinates.latitude},${marker.coordinates.longitude}`;
  }
};

  /**
   * Returns the Lucide icon component for a given category.
   * @param {string} category - The category slug.
   * @returns {React.ComponentType | string} The Lucide icon component or a string if no matching icon.
   */
  const getCategoryIcon = (category) => {
    const categoryIcons = {
      'essential-services': Wifi,
      'transportation': Car,
      'accommodation': MapPin,
      'dining': Utensils,
      'activities': Waves,
      'culture-history': Map,
      'practical-info': Info,
      'safety-health': Shield,
      'weather-climate': Sun,
      'sustainability': '🌱' // Using an emoji for sustainability
    };
    return categoryIcons[category] || Info; // Default to Info icon
  };

  /**
   * Returns a human-readable label for a given category slug.
   * @param {string} category - The category slug.
   * @returns {string} The human-readable label.
   */
  const getCategoryLabel = (category) => {
    const labels = {
      'essential-services': 'Essential Services',
      'transportation': 'Transportation',
      'accommodation': 'Accommodation',
      'dining': 'Dining',
      'activities': 'Activities',
      'culture-history': 'Culture & History',
      'practical-info': 'Practical Info',
      'safety-health': 'Safety & Health',
      'weather-climate': 'Weather & Climate',
      'sustainability': 'Sustainability'
    };
    return labels[category] || category.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  /**
   * Formats a date string into a more readable format.
   * @param {string} dateString - The date string to format.
   * @returns {string} The formatted date string.
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Renders contact and general detail information from additionalInfo.
   * @param {Object} additionalInfo - The additionalInfo object from a ContentItem.
   * @returns {JSX.Element | null} JSX for contact info or null if no relevant data.
   */
  const renderContactInfo = (additionalInfo) => {
    const contactItems = [];

    if (additionalInfo.phone) {
      contactItems.push(
        <div key="phone" className={styles.contactItem}>
          <Phone size={16} className={styles.contactIcon} />
          <a href={`tel:${additionalInfo.phone}`} className={styles.contactLink}>
            {additionalInfo.phone}
          </a>
        </div>
      );
    }

    if (additionalInfo.website) {
      contactItems.push(
        <div key="website" className={styles.contactItem}>
          <Globe size={16} className={styles.contactIcon} />
          <a href={additionalInfo.website} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
            Visit Website <ExternalLink size={12} />
          </a>
        </div>
      );
    }

    if (additionalInfo.address) {
      contactItems.push(
        <div key="address" className={styles.contactItem}>
          <MapPin size={16} className={styles.contactIcon} />
          <span>{additionalInfo.address}</span>
        </div>
      );
    }

    if (additionalInfo.hours) {
      contactItems.push(
        <div key="hours" className={styles.contactItem}>
          <Clock size={16} className={styles.contactIcon} />
          <span>{additionalInfo.hours}</span>
        </div>
      );
    }

    if (additionalInfo.priceRange) {
      contactItems.push(
        <div key="price" className={styles.contactItem}>
          <DollarSign size={16} className={styles.contactIcon} />
          <span>{additionalInfo.priceRange}</span>
        </div>
      );
    }

    return contactItems.length > 0 ? (
      <div className={styles.contactInfo}>
        <h4 className={styles.infoSubtitle}>Contact & Details</h4>
        <div className={styles.contactGrid}>
          {contactItems}
        </div>
      </div>
    ) : null;
  };

  /**
   * Renders a list of items with a title and an icon.
   * @param {string} title - The title of the list section.
   * @param {string[]} items - An array of items to display.
   * @param {React.ComponentType} icon - The Lucide icon component for the section.
   * @param {string} [className=''] - Additional CSS class for the section.
   * @returns {JSX.Element | null} JSX for the list section or null if no items.
   */
  const renderListSection = (title, items, icon, className = '') => {
    if (!items || items.length === 0) return null;

    const IconComponent = icon;

    return (
      <div className={`${styles.infoSection} ${className ? styles[className] : ''}`}>
        <h4 className={styles.infoSubtitle}>
          <IconComponent size={16} className={styles.sectionIcon} />
          {title}
        </h4>
        <ul className={styles.infoList}>
          {items.map((item, index) => (
            <li key={index} className={styles.infoListItem}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  /**
   * Renders tipping guidelines based on available data in additionalInfo.
   * @param {Object} additionalInfo - The additionalInfo object from a ContentItem.
   * @returns {JSX.Element | null} JSX for tipping info or null if no relevant data.
   */
  const renderTippingInfo = (additionalInfo) => {
    const tippingFields = ['restaurants', 'bars', 'taxis', 'hotels', 'tours', 'spas'];
    const tippingData = tippingFields.filter(field => additionalInfo[field]);

    if (tippingData.length === 0) return null;

    return (
      <div className={styles.infoSection}>
        <h4 className={styles.infoSubtitle}>
          <DollarSign size={16} className={styles.sectionIcon} />
          Tipping Guidelines
        </h4>
        <div className={styles.tippingGrid}>
          {tippingData.map(field => (
            <div key={field} className={styles.tippingItem}>
              <span className={styles.tippingCategory}>{field.charAt(0).toUpperCase() + field.slice(1)}:</span>
              <span className={styles.tippingAmount}>{additionalInfo[field]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Renders a single content item, including its description, image, and additional details.
   * @param {ContentItem} item - The content item to render.
   * @param {number} index - The index of the content item within its section.
   * @param {number} sectionIndex - The index of the parent section.
   * @returns {JSX.Element} JSX for the content item.
   */
  const renderContentItem = (item, index, sectionIndex) => {
    const contentId = `${sectionIndex}-${index}`;
    const isExpanded = expandedContent.has(contentId);
    const hasAdditionalInfo = item.additionalInfo && Object.keys(item.additionalInfo).length > 0;

    return (
      <div key={index} className={styles.contentItem}>
        <div className={styles.contentHeader}>
          <h3 className={styles.contentTitle}>{item.name}</h3>
          {hasAdditionalInfo && (
            <button
              onClick={() => toggleContent(contentId)}
              className={styles.expandButton}
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
        </div>

        <p className={styles.contentDescription}>{item.description}</p>

        {item.image && (
          <div className={styles.contentImage}>
            <img src={item.image} alt={item.name} className={styles.image} />
          </div>
        )}

        {/* Render additional info only if it exists and the section is expanded */}
        {hasAdditionalInfo && isExpanded && (
          <div className={styles.additionalInfo}>
            {renderContactInfo(item.additionalInfo)}
            {renderListSection('Features & Services', item.additionalInfo.features, Star)}
            {renderListSection('Companies & Providers', item.additionalInfo.companies, MapPin)}
            {renderListSection('Locations', item.additionalInfo.locations, Navigation)}
            {renderListSection('Banks Available', item.additionalInfo.banks, CreditCard)}
            {renderListSection('Accepted Cards', item.additionalInfo.accepted, CreditCard)}
            {renderListSection('Fees', item.additionalInfo.fees, DollarSign)}
            {renderListSection('Varieties & Options', item.additionalInfo.varieties, Star)}
            {renderListSection('Dishes & Specialties', item.additionalInfo.dishes, Utensils)}
            {renderListSection('Specialties', item.additionalInfo.specialties, Utensils)}
            {renderListSection('Preparations', item.additionalInfo.preparations, Utensils)}
            {renderListSection('Activities', item.additionalInfo.activities, Waves)}
            {renderListSection('Conditions', item.additionalInfo.conditions, Info)}
            {renderListSection('Schools & Training', item.additionalInfo.schools, MapPin)}
            {renderListSection('Top Sites', item.additionalInfo.topSites, Star)}
            {renderListSection('Marine Life', item.additionalInfo.marineLife, Waves)}
            {renderListSection('Seasons', item.additionalInfo.seasons, Sun)}
            {renderListSection('Limitations', item.additionalInfo.limitations, AlertTriangle, 'warning')}
            {renderTippingInfo(item.additionalInfo)}
            {renderListSection('Helpful Tips', item.additionalInfo.tips, Lightbulb, 'tips')}
            {renderListSection('Important Warnings', item.additionalInfo.warnings, AlertTriangle, 'warning')}
          </div>
        )}
      </div>
    );
  };

  const CategoryIcon = getCategoryIcon(page.category);

  return (
    <div className={styles.pageDetail}>
      {/* Header Section */}
      <div className={styles.header} style={{ backgroundColor: page.color }}>
        <div className={styles.headerContent}>
          <button onClick={onBack} className={styles.backButton}>
            <ArrowLeft size={20} />
            Back to Guides
          </button>

          <div className={styles.headerInfo}>
            <div className={styles.pageIcon}>
              {typeof CategoryIcon === 'string' ? CategoryIcon : <CategoryIcon size={32} />}
            </div>
            <div className={styles.pageMeta}>
              <div className={styles.categoryBadge}>
                {getCategoryLabel(page.category)}
                {page.featured && <Star size={14} className={styles.featuredStar} />}
              </div>
              <h1 className={styles.pageTitle}>{page.title}</h1>
              <p className={styles.pageDescription}>{page.description}</p>

              <div className={styles.pageStats}>
                <div className={styles.stat}>
                  <Eye size={14} />
                  {page.views} views
                </div>
                <div className={styles.stat}>
                  <Clock size={14} />
                  Updated {formatDate(page.lastUpdated)}
                </div>
                {page.markers.length > 0 && (
                  <div className={styles.stat}>
                    <MapPin size={14} />
                    {page.markers.length} locations
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      {page.tags.length > 0 && (
        <div className={styles.tagsSection}>
          <div className={styles.tags}>
            {page.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>#{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className={styles.content}>
        {page.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <button
                onClick={() => toggleSection(sectionIndex)}
                className={styles.sectionToggle}
                aria-label={expandedSections.has(sectionIndex) ? 'Collapse section' : 'Expand section'}
              >
                {expandedSections.has(sectionIndex) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {expandedSections.has(sectionIndex) && (
              <div className={styles.sectionContent}>
                {section.content.map((item, index) =>
                  renderContentItem(item, index, sectionIndex)
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Map Markers Section */}
      {page.markers.length > 0 && (
        <div className={styles.markersSection}>
          <h2 className={styles.sectionTitle}>
            <MapPin size={20} className={styles.sectionIcon} />
            Locations on Map
          </h2>
          <div className={styles.markersGrid}>
            {page.markers.map((marker, index) => (
              <div key={index} className={styles.markerCard}>
                <div className={styles.markerHeader}>
                  <h3 className={styles.markerTitle}>{marker.title}</h3>
                  <span className={styles.markerType}>{marker.type}</span>
                </div>
                <p className={styles.markerDescription}>{marker.description}</p>
 <div className={styles.markerMap}>
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${marker.coordinates.longitude-0.002},${marker.coordinates.latitude-0.002},${marker.coordinates.longitude+0.002},${marker.coordinates.latitude+0.002}&layer=mapnik&marker=${marker.coordinates.latitude},${marker.coordinates.longitude}`}
                    width="100%"
                    height="200"
                    style={{ border: 'none', borderRadius: '8px' }}
                    title={`Map showing ${marker.title}`}
                  ></iframe>
                  <div className={styles.mapActions}>
                    <a 
                      href={`https://www.google.com/maps?q=${marker.coordinates.latitude},${marker.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.mapLink}
                    >
                      <ExternalLink size={12} />
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPageDetail;