"use client";

import React from "react";
import styles from "./about.module.css";
import { Compass, Heart, Users, Award, Globe, TrendingUp } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Compass className={styles.headerIcon} size={64} />
          <h1>About Caicos Compass</h1>
          <p>Your trusted guide to the Turks and Caicos Islands</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Heart size={24} />
            <h2>Our Story</h2>
          </div>
          <p>
            Caicos Compass was born from a passion for the breathtaking beauty and vibrant culture of the Turks and Caicos Islands. As frequent visitors to these paradise islands, we recognized a need for a comprehensive, user-friendly platform that connects travelers with authentic local experiences.
          </p>
          <p>
            Founded in 2024, we started with a simple mission: to make discovering and booking activities, accommodations, dining, and services in Turks and Caicos effortless and enjoyable. What began as a small team of travel enthusiasts has grown into a thriving marketplace supporting local businesses and creating unforgettable experiences for thousands of travelers.
          </p>
          <p>
            Today, Caicos Compass is the leading booking platform for the Turks and Caicos Islands, trusted by visitors and residents alike to discover the very best our islands have to offer.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Compass size={24} />
            <h2>Our Mission</h2>
          </div>
          <p className={styles.missionText}>
            To empower travelers to explore the Turks and Caicos Islands with confidence while supporting and showcasing the incredible local businesses that make these islands special.
          </p>
          <p>
            We believe every visitor deserves authentic, high-quality experiences, and every local business deserves a platform to shine. By connecting the two, we're building a sustainable tourism ecosystem that benefits everyone.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Award size={24} />
            <h2>Our Values</h2>
          </div>
          
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Heart size={32} />
              </div>
              <h3>Authenticity</h3>
              <p>We showcase genuine local experiences and verified businesses, ensuring travelers connect with the real Turks and Caicos.</p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Users size={32} />
              </div>
              <h3>Community First</h3>
              <p>We prioritize supporting local businesses and entrepreneurs, helping them grow and thrive in the tourism industry.</p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Award size={32} />
              </div>
              <h3>Quality & Trust</h3>
              <p>Every listing is verified and vetted. We maintain high standards to ensure safe, reliable, and exceptional experiences.</p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Globe size={32} />
              </div>
              <h3>Sustainability</h3>
              <p>We promote responsible tourism practices that protect the natural beauty and cultural heritage of the islands.</p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <TrendingUp size={32} />
              </div>
              <h3>Innovation</h3>
              <p>We continuously improve our platform with cutting-edge technology to make booking seamless and enjoyable.</p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Heart size={32} />
              </div>
              <h3>Customer Care</h3>
              <p>Your satisfaction is our priority. We provide dedicated support and ensure every booking exceeds expectations.</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <TrendingUp size={24} />
            <h2>What We Offer</h2>
          </div>
          
          <div className={styles.offeringsGrid}>
            <div className={styles.offeringCard}>
              <h3>🏨 Accommodations</h3>
              <p>Hotels, resorts, villas, and vacation rentals across all islands - from luxury beachfront properties to cozy island retreats.</p>
            </div>

            <div className={styles.offeringCard}>
              <h3>🌊 Activities & Tours</h3>
              <p>Snorkeling, diving, island tours, water sports, eco-adventures, and unique local experiences curated by expert guides.</p>
            </div>

            <div className={styles.offeringCard}>
              <h3>🍽️ Dining Experiences</h3>
              <p>From beachside cafés to fine dining, discover the best restaurants and culinary experiences the islands have to offer.</p>
            </div>

            <div className={styles.offeringCard}>
              <h3>🚗 Transportation</h3>
              <p>Reliable car rentals, airport transfers, private drivers, and boat charters to help you explore with ease.</p>
            </div>

            <div className={styles.offeringCard}>
              <h3>💆 Wellness & Spa</h3>
              <p>Relaxation and rejuvenation with island-inspired spa treatments, yoga retreats, and wellness services.</p>
            </div>

            <div className={styles.offeringCard}>
              <h3>🛍️ Local Shops</h3>
              <p>Discover unique boutiques, art galleries, and local crafts that capture the spirit of the islands.</p>
            </div>
          </div>
        </div>

        <div className={styles.statsSection}>
          <h2>Caicos Compass by the Numbers</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>500+</div>
              <div className={styles.statLabel}>Local Business Partners</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>10,000+</div>
              <div className={styles.statLabel}>Happy Travelers</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>8</div>
              <div className={styles.statLabel}>Islands Covered</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>4.9★</div>
              <div className={styles.statLabel}>Average Rating</div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Users size={24} />
            <h2>Our Commitment to You</h2>
          </div>
          
          <div className={styles.commitmentBox}>
            <h3>For Travelers</h3>
            <ul>
              <li>Verified and vetted service providers</li>
              <li>Transparent pricing with no hidden fees</li>
              <li>Secure payment processing</li>
              <li>24/7 customer support</li>
              <li>Easy booking and management</li>
              <li>Honest reviews from real customers</li>
            </ul>
          </div>

          <div className={styles.commitmentBox}>
            <h3>For Business Partners</h3>
            <ul>
              <li>Powerful dashboard to manage listings and bookings</li>
              <li>Marketing and promotional opportunities</li>
              <li>Fair and transparent commission structure</li>
              <li>Dedicated business support team</li>
              <li>Analytics and performance insights</li>
              <li>Timely and reliable payouts</li>
            </ul>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Globe size={24} />
            <h2>Join Our Community</h2>
          </div>
          <p>
            Whether you're planning your dream vacation or looking to grow your island business, Caicos Compass is here to help. Join thousands of travelers and hundreds of local businesses who trust us to deliver exceptional experiences.
          </p>
          
          <div className={styles.ctaGrid}>
            <div className={styles.ctaCard}>
              <h3>For Travelers</h3>
              <p>Start exploring amazing experiences across the Turks and Caicos Islands.</p>
              <a href="/" className={styles.ctaButton}>Explore Now</a>
            </div>

            <div className={styles.ctaCard}>
              <h3>For Businesses</h3>
              <p>List your services and reach thousands of potential customers.</p>
              <a href="/vendor-signup" className={styles.ctaButton}>Become a Partner</a>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Heart size={24} />
            <h2>Contact Us</h2>
          </div>
          <p>Have questions? We'd love to hear from you!</p>
          <div className={styles.contactBox}>
            <p><strong>Caicos Compass</strong></p>
            <p>Email: info@caicoscompass.com</p>
            <p>Phone: +1 (649) 123-4567</p>
            <p>Address: Providenciales, Turks and Caicos Islands</p>
            <p>Business Hours: Monday-Friday, 9 AM - 6 PM EST</p>
          </div>
          
          <div className={styles.socialLinks}>
            <a href="https://www.facebook.com/IIAxzd/" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.instagram.com/caicoscompass/" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </div>
    </div>
  );
}