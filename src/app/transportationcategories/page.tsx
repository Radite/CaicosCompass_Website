"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./transportationcategories.module.css";
import { FaCar, FaTaxi, FaPlane, FaShip, FaMotorcycle, FaStar, FaMapMarkerAlt, FaUsers } from "react-icons/fa";

interface CategoryStats {
  category: string;
  count: number;
  minPrice: number;
  maxPrice: number;
  avgRating: number;
}

const categories = [
  { 
    name: "Car Rental", 
    image: "/images/car-rental.jpg",
    icon: FaCar,
    description: "Explore at your own pace with our rental cars",
    color: "#4CAF50"
  },
  { 
    name: "Jeep & 4x4 Rental", 
    image: "/images/jeep-rental.jpg",
    icon: FaCar,
    description: "Adventure-ready 4x4 vehicles for off-road exploration",
    color: "#FF9800"
  },
  { 
    name: "Scooter & Moped Rental", 
    image: "/images/scooter-rental.jpg",
    icon: FaMotorcycle,
    description: "Perfect for couples and easy island cruising",
    color: "#2196F3"
  },
  { 
    name: "Taxi", 
    image: "/images/taxi.jpg",
    icon: FaTaxi,
    description: "Quick and reliable point-to-point transportation",
    color: "#FFC107"
  },
  { 
    name: "Airport Transfer", 
    image: "/images/airport-transfer.jpg",
    icon: FaPlane,
    description: "Professional airport pickup and drop-off services",
    color: "#9C27B0"
  },
  { 
    name: "Private VIP Transport", 
    image: "/images/vip-transport.jpg",
    icon: FaCar,
    description: "Luxury chauffeur services for special occasions",
    color: "#E91E63"
  },
  { 
    name: "Ferry", 
    image: "/images/ferry.jpg",
    icon: FaShip,
    description: "Inter-island ferry services and boat transportation",
    color: "#00BCD4"
  },
  { 
    name: "Flight", 
    image: "/images/flight.jpg",
    icon: FaPlane,
    description: "Charter flights and inter-island air travel",
    color: "#673AB7"
  }
];

export default function TransportationCategoriesPage() {
  const router = useRouter();
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIsland, setSelectedIsland] = useState("All");

  const islands = ["All", "Providenciales", "Grand Turk", "North Caicos", "Middle Caicos", "South Caicos", "Salt Cay"];

  useEffect(() => {
    fetchCategoryStats();
  }, [selectedIsland]);

const fetchCategoryStats = async () => {
  try {
    setLoading(true);
    const response = await axios.get("http://localhost:5000/api/services/type/transportations");
    
    console.log('API Response:', response.data);
    
    // Filter services - handle both old and new data structures
    let services = response.data.filter((service: any) => {
      const isActive = service.status === 'active';
      
      // Handle both 'host' (old) and 'vendor' (new) fields
      const vendorField = service.vendor || service.host;
      const hasApprovedVendor = vendorField?.businessProfile?.isApproved;
      
      // For now, if there's no businessProfile, assume it's approved (for old data)
      const isApproved = hasApprovedVendor !== undefined ? hasApprovedVendor : true;
      
      const matchesIsland = selectedIsland === "All" || service.island === selectedIsland;
      
      console.log(`Service ${service.name}: active=${isActive}, approved=${isApproved}, island=${matchesIsland}`);
      
      return isActive && isApproved && matchesIsland;
    });

    console.log('Filtered services:', services.length);

    // Rest of your existing code...
    const stats: CategoryStats[] = categories.map(category => {
      const categoryServices = services.filter((service: any) => service.category === category.name);
      
      if (categoryServices.length === 0) {
        return {
          category: category.name,
          count: 0,
          minPrice: 0,
          maxPrice: 0,
          avgRating: 0
        };
      }

      // Your existing pricing and rating logic...
      const prices = categoryServices.map((service: any) => {
        switch (service.pricingModel) {
          case 'per-day':
            return service.perDayPrice || service.basePrice;
          case 'per-hour':
            return service.perHourPrice || service.basePrice;
          case 'flat':
            return service.flatPrice || service.basePrice;
          default:
            return service.basePrice;
        }
      });

      return {
        category: category.name,
        count: categoryServices.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        avgRating: 0 // You can calculate this if you have reviews
      };
    });

    console.log('Final stats:', stats);
    setCategoryStats(stats);
  } catch (error) {
    console.error("Error fetching category stats:", error);
    setCategoryStats([]);
  } finally {
    setLoading(false);
  }
};

  const handleCategoryClick = (categoryName: string) => {
    const queryParams = new URLSearchParams();
    queryParams.set('category', categoryName);
    if (selectedIsland !== "All") {
      queryParams.set('island', selectedIsland);
    }
    router.push(`/transportation?${queryParams.toString()}`);
  };

  const getCategoryStats = (categoryName: string) => {
    return categoryStats.find(stat => stat.category === categoryName) || {
      category: categoryName,
      count: 0,
      minPrice: 0,
      maxPrice: 0,
      avgRating: 0
    };
  };

  const totalServices = categoryStats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Choose Your Transportation</h1>
          <p className={styles.subtitle}>
            Find the perfect way to explore Turks and Caicos with our comprehensive transportation options
          </p>
          
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{totalServices}</span>
              <span className={styles.statLabel}>Services Available</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{categories.length}</span>
              <span className={styles.statLabel}>Transportation Types</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{islands.length - 1}</span>
              <span className={styles.statLabel}>Islands Covered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Island Filter */}
      <div className={styles.filterSection}>
        <div className={styles.islandFilter}>
          <FaMapMarkerAlt className={styles.filterIcon} />
          <label className={styles.filterLabel}>Filter by Island:</label>
          <select 
            value={selectedIsland}
            onChange={(e) => setSelectedIsland(e.target.value)}
            className={styles.islandSelect}
          >
            {islands.map(island => (
              <option key={island} value={island}>{island}</option>
            ))}
          </select>
        </div>
        {selectedIsland !== "All" && (
          <div className={styles.filterInfo}>
            Showing services available on {selectedIsland}
          </div>
        )}
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading transportation categories...</p>
        </div>
      ) : (
        <div className={styles.categoriesContainer}>
          {categories.map((category, index) => {
            const stats = getCategoryStats(category.name);
            const IconComponent = category.icon;
            
            return (
              <div
                key={index}
                className={styles.categoryCard}
                onClick={() => handleCategoryClick(category.name)}
                style={{
                  backgroundImage: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}25 100%)`,
                  borderTop: `4px solid ${category.color}`
                }}
              >
                <div className={styles.categoryHeader}>
                  <div className={styles.categoryIcon} style={{ color: category.color }}>
                    <IconComponent />
                  </div>
                  <div className={styles.categoryBadge}>
                    {stats.count} {stats.count === 1 ? 'service' : 'services'}
                  </div>
                </div>

                <div className={styles.categoryContent}>
                  <h2 className={styles.categoryTitle}>{category.name}</h2>
                  <p className={styles.categoryDescription}>{category.description}</p>

                  {stats.count > 0 && (
                    <div className={styles.categoryStats}>
                      <div className={styles.priceRange}>
                        <span className={styles.priceLabel}>From</span>
                        <span className={styles.priceValue}>
                          ${stats.minPrice}
                          {stats.maxPrice > stats.minPrice && (
                            <span className={styles.priceMax}> - ${stats.maxPrice}</span>
                          )}
                        </span>
                      </div>

                      {stats.avgRating > 0 && (
                        <div className={styles.ratingInfo}>
                          <FaStar className={styles.starIcon} />
                          <span className={styles.ratingValue}>{stats.avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={styles.categoryFooter}>
                  {stats.count > 0 ? (
                    <button className={styles.categoryButton}>
                      Explore {category.name}
                    </button>
                  ) : (
                    <div className={styles.comingSoon}>
                      Coming Soon
                    </div>
                  )}
                </div>

                {/* Background Image Overlay */}
                <div 
                  className={styles.categoryImageOverlay}
                  style={{
                    backgroundImage: `url(${category.image})`
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Popular Features Section */}
      <div className={styles.featuresSection}>
        <h2 className={styles.featuresTitle}>Why Choose Our Transportation Services?</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaUsers />
            </div>
            <h3>Professional Drivers</h3>
            <p>Licensed, experienced drivers with local knowledge and excellent service records</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaCar />
            </div>
            <h3>Modern Fleet</h3>
            <p>Well-maintained vehicles with comprehensive insurance and safety features</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaStar />
            </div>
            <h3>Highly Rated</h3>
            <p>Top-rated services with verified customer reviews and satisfaction guarantees</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaMapMarkerAlt />
            </div>
            <h3>Island Coverage</h3>
            <p>Services available across all major islands in Turks and Caicos</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to Explore Turks and Caicos?</h2>
          <p>Browse all transportation options or contact us for personalized recommendations</p>
          <div className={styles.ctaButtons}>
            <button 
              onClick={() => router.push('/transportation')}
              className={styles.ctaPrimary}
            >
              View All Services
            </button>
            <button 
              onClick={() => router.push('/contact')}
              className={styles.ctaSecondary}
            >
              Get Recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}