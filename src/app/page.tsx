"use client";

import React, { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").then((bootstrap) => {
      const carouselElement = document.getElementById("heroCarousel");
      // Use the Carousel export from the imported module
      const { Carousel } = bootstrap;
      if (carouselElement && Carousel) {
        new Carousel(carouselElement);
      }
    });
  }, []);

  return (
    <>
      {/* Hero Carousel Section */}
      <section className="hero-carousel">
        <div
          id="heroCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="5000"
        >
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                src="https://www.visittci.com/thing/grace-bay-beach-pr/aerial_2048x1365.jpg"
                className="d-block w-100"
                alt="Turks and Caicos Beach Aerial View"
              />
            </div>
            <div className="carousel-item">
              <img
                src="https://a0.muscache.com/im/pictures/miso/Hosting-41823986/original/204ee13c-f4dd-44da-82df-81f9cb001c2e.jpeg"
                className="d-block w-100"
                alt="Luxury Beachfront Villa"
              />
            </div>
            <div className="carousel-item">
              <img
                src="https://corksandtacos.com/wp-content/uploads/2023/10/POST-IMAGES-LANDSCAPE221.jpg"
                className="d-block w-100"
                alt="Tropical Paradise"
              />
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
        <div className="hero-overlay"></div>
        <div className="container hero-content text-center animate-fade">
          <h1>
            Discover <span className="gold-accent">Paradise</span> in Turks and Caicos
          </h1>
          <p>
            Explore pristine beaches, vibrant local culture, and unforgettable experiences.
            Start planning your dream getaway today!
          </p>
          <a href="#categories" className="btn hero-btn mt-4">
            Explore Now
          </a>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories">
        <div className="container">
          <div className="text-center mb-5">
            <h2>Explore Categories</h2>
            <p className="text-muted">Curated experiences for your perfect getaway</p>
          </div>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
            {/* Category 1: Things To Do */}
            <div className="col">
              <div className="card category-card shadow-sm h-100">
                <div className="overflow-hidden">
                  <img
                    src="https://www.visittci.com/core/cover-ocean-outback-adventures-slide_1024x341.jpg"
                    className="card-img-top"
                    alt="Excursions"
                  />
                </div>
                <div className="card-body text-center">
                  <h5 className="card-title">Things To Do</h5>
                  <a href="/things-to-do" className="btn btn-outline-primary">
                    View More
                  </a>
                </div>
              </div>
            </div>

            {/* Category 2: Stays */}
            <div className="col">
              <div className="card category-card shadow-sm h-100">
                <div className="overflow-hidden">
                  <img
                    src="https://www.visittci.com/core/cover-emerald-cay-estate-aerial_1024x341.jpg"
                    className="card-img-top"
                    alt="Stays"
                  />
                </div>
                <div className="card-body text-center">
                  <h5 className="card-title">Stays</h5>
                  <a href="/stays" className="btn btn-outline-primary">
                    View More
                  </a>
                </div>
              </div>
            </div>

            {/* Category 3: Dining */}
            <div className="col">
              <div className="card category-card shadow-sm h-100">
                <div className="overflow-hidden">
                  <img
                    src="https://www.visittci.com/core/cover-beach-house-dessert-and-wine_1024x341.jpg"
                    className="card-img-top"
                    alt="Dining"
                  />
                </div>
                <div className="card-body text-center">
                  <h5 className="card-title">Dining</h5>
                  <a href="/dining" className="btn btn-outline-primary">
                    View More
                  </a>
                </div>
              </div>
            </div>

            {/* Category 4: Transportation */}
            <div className="col">
              <div className="card category-card shadow-sm h-100">
                <div className="overflow-hidden">
                  <img
                    src="https://www.visittci.com/core/cover-jeep-wranglers-at-west-harbour-bluff_1024x341.jpg"
                    className="card-img-top"
                    alt="Transportation"
                  />
                </div>
                <div className="card-body text-center">
                  <h5 className="card-title">Transportation</h5>
                  <a href="/transportationcategories" className="btn btn-outline-primary">
                    View More
                  </a>
                </div>
              </div>
            </div>

            {/* Category 5: Shopping & Markets */}
            <div className="col">
              <div className="card category-card shadow-sm h-100">
                <div className="overflow-hidden">
                  <img
                    src="https://www.visittci.com/core/cover-ports-of-call-grace-bay-providenciales_1024x341.jpg"
                    className="card-img-top"
                    alt="Shopping & Markets"
                  />
                </div>
                <div className="card-body text-center">
                  <h5 className="card-title">Shopping & Markets</h5>
                  <a href="/shopping" className="btn btn-outline-primary">
                    View More
                  </a>
                </div>
              </div>
            </div>

            {/* Category 6: Wellness & Spa */}
            <div className="col">
              <div className="card category-card shadow-sm h-100">
                <div className="overflow-hidden">
                  <img
                    src="https://www.wherewhenhow.com/images/turks-caicos-islands/magazine/spas-2017/spa-palms-courtyard-4.jpg"
                    className="card-img-top"
                    alt="Wellness & Spa"
                  />
                </div>
                <div className="card-body text-center">
                  <h5 className="card-title">Wellness & Spa</h5>
                  <a href="/wellnessspa" className="btn btn-outline-primary">
                    View More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section for AI Itinerary and Information */}
      <section className="quick-access py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2>Plan Your Journey</h2>
            <p>Discover our AI Itinerary and essential travel information</p>
          </div>
          <div className="row row-cols-1 row-cols-md-2 g-4">
            <div className="col">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="card-title">AI Itinerary</h3>
                  <p className="card-text">
                    Plan your perfect day with our smart itinerary builder.
                  </p>
                  <a href="/ai-itinerary" className="btn btn-primary">
                    Go to AI Itinerary
                  </a>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="card-title">Information</h3>
                  <p className="card-text">
                    Explore essential travel information.
                  </p>
                  <a href="/information" className="btn btn-primary">
                    Go to Information
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </>
  );
}
