"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, Sparkles, Clock, MapPin, Star, ArrowRight } from "lucide-react";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const heroImages = [
    {
      src: "https://www.visittci.com/thing/grace-bay-beach-pr/aerial_2048x1365.jpg",
      alt: "Grace Bay Beach Aerial View",
      title: "Paradise Awaits"
    },
    {
      src: "https://a0.muscache.com/im/pictures/miso/Hosting-41823986/original/204ee13c-f4dd-44da-82df-81f9cb001c2e.jpeg",
      alt: "Luxury Beachfront Villa",
      title: "Luxury Redefined"
    },
    {
      src: "https://corksandtacos.com/wp-content/uploads/2023/10/POST-IMAGES-LANDSCAPE221.jpg",
      alt: "Tropical Paradise",
      title: "Unforgettable Moments"
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
    
    // Enhanced Bootstrap carousel initialization
    import("bootstrap/dist/js/bootstrap.bundle.min.js").then((bootstrap) => {
      const carouselElement = document.getElementById("heroCarousel");
      const { Carousel } = bootstrap;
      if (carouselElement && Carousel) {
        const carousel = new Carousel(carouselElement, {
          interval: 6000,
          ride: 'carousel',
          pause: 'hover',
          wrap: true,
          touch: true
        });

        // Listen to slide events for enhanced animations
        carouselElement.addEventListener('slide.bs.carousel', (event) => {
          setCurrentSlide(event.to);
        });
      }
    });

    // Enhanced scroll animations
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

    // Observe all sections for scroll animations
    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToCategories = () => {
    document.getElementById('categories')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <>
      {/* Enhanced Hero Section */}
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
      >
        <div
          id="heroCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="6000"
        >
          <div className="carousel-indicators">
            {heroImages.map((_, index) => (
              <button
                key={index}
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to={index}
                className={index === 0 ? "active" : ""}
                aria-current={index === 0 ? "true" : "false"}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
          
          <div className="carousel-inner">
            {heroImages.map((image, index) => (
              <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                <img
                  src={image.src}
                  className="d-block w-100"
                  alt={image.alt}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="slide-overlay"></div>
              </div>
            ))}
          </div>
          
          <button 
            className="scroll-indicator"
            onClick={scrollToCategories}
            aria-label="Scroll to explore categories"
          >
            <ChevronDown className="scroll-arrow" />
          </button>
        </div>
        
        <div className="hero-overlay"></div>
        
        <div className="container hero-content text-center">
          <div className="hero-badge mb-3">
            <Sparkles className="sparkles-icon" />
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
              <input
                type="text"
                className="ai-input"
                placeholder="e.g., 'A 3-day romantic getaway with private dining and snorkeling'"
                aria-label="Describe your perfect vacation"
              />
              <button 
                className="ai-submit-btn"
                onClick={() => window.location.href = '/ai-itinerary'}
                aria-label="Plan my trip"
              >
                <Sparkles className="btn-icon" />
                Plan My Trip
              </button>
            </div>
            
            <div className="ai-features">
              <div className="feature-item">
                <Clock className="feature-icon" />
                <span>Instant Results</span>
              </div>
              <div className="feature-item">
                <MapPin className="feature-icon" />
                <span>Personalized Routes</span>
              </div>
              <div className="feature-item">
                <Star className="feature-icon" />
                <span>Premium Experiences</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
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
                  <div className="step-number">{item.step}</div>
                  <div className="step-icon-emoji">{item.icon}</div>
                  <h5 className="step-title">{item.title}</h5>
                  <p className="step-description">{item.description}</p>
                  <div className="step-connector"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Categories Section */}
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
                title: "Luxury Stays",
                image: "https://www.visittci.com/core/cover-emerald-cay-estate-aerial_1024x341.jpg", 
                href: "/stays",
                description: "Premium Accommodations"
              },
              {
                title: "Fine Dining",
                image: "https://www.visittci.com/core/cover-beach-house-dessert-and-wine_1024x341.jpg",
                href: "/dining", 
                description: "Culinary Experiences"
              },
              {
                title: "Transportation",
                image: "https://www.visittci.com/core/cover-jeep-wranglers-at-west-harbour-bluff_1024x341.jpg",
                href: "/transportationcategories",
                description: "Getting Around"
              },
              {
                title: "Shopping & Markets", 
                image: "https://www.visittci.com/core/cover-ports-of-call-grace-bay-providenciales_1024x341.jpg",
                href: "/shopping",
                description: "Local Treasures"
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
                      alt={category.title}
                      className="category-image"
                      loading="lazy"
                    />
                    <div className="category-overlay"></div>
                  </div>
                  <div className="category-content">
                    <h5 className="category-title">{category.title}</h5>
                    <p className="category-description">{category.description}</p>
                    <a 
                      href={category.href} 
                      className="category-link"
                      aria-label={`Explore ${category.title}`}
                    >
                      <span>Explore</span>
                      <ArrowRight className="link-icon" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Quick Access Section */}
      <section className="quick-access-section">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="access-card ai-card">
                <div className="access-icon">
                  <Sparkles />
                </div>
                <div className="access-content">
                  <h3>AI Itinerary Builder</h3>
                  <p>Let artificial intelligence craft your perfect day-by-day travel plan</p>
                  <a href="/ai-itinerary" className="access-btn">
                    Start Planning
                    <ArrowRight className="btn-arrow" />
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="access-card info-card">
                <div className="access-icon">
                  <MapPin />
                </div>
                <div className="access-content">
                  <h3>Travel Information</h3>
                  <p>Essential guides, tips, and local insights for your journey</p>
                  <a href="/info" className="access-btn">
                    Learn More
                    <ArrowRight className="btn-arrow" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
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
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="star-icon filled" />
                  ))}
                </div>
                <blockquote className="testimonial-quote">
                  "The AI itinerary was a game-changer. It planned our anniversary trip flawlessly, 
                  finding hidden gems we never would have discovered on our own. Truly effortless luxury."
                </blockquote>
                <div className="testimonial-author">
                  <div className="author-avatar">A</div>
                  <div className="author-info">
                    <strong>Alexandra V.</strong>
                    <span>Anniversary Trip</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="star-icon filled" />
                  ))}
                </div>
                <blockquote className="testimonial-quote">
                  "I was skeptical about an AI planning my family's vacation, but it was incredible. 
                  It balanced activities for the kids with relaxation for us perfectly. We saved so much time."
                </blockquote>
                <div className="testimonial-author">
                  <div className="author-avatar">M</div>
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
    </>
  );
}