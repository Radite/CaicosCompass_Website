"use client";

import React from "react";
import styles from "./testimonials.module.css";
import { Star, Quote, TrendingUp, Heart, Award } from "lucide-react";

export default function TestimonialsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Heart className={styles.headerIcon} size={64} />
          <h1>Success Stories & Testimonials</h1>
          <p>Real experiences from travelers and business partners</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <div className={styles.statNumber}>10,000+</div>
            <div className={styles.statLabel}>Happy Travelers</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>4.9★</div>
            <div className={styles.statLabel}>Average Rating</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>500+</div>
            <div className={styles.statLabel}>Partner Businesses</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>98%</div>
            <div className={styles.statLabel}>Would Recommend</div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Traveler Stories</h2>
          <p className={styles.sectionSubtitle}>Discover how Caicos Compass made their trips unforgettable</p>

          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={styles.starFilled} size={18} />
                ))}
              </div>
              <Quote className={styles.quoteIcon} size={32} />
              <p className={styles.testimonialText}>
                "The AI itinerary planner was a game-changer. It planned our anniversary trip flawlessly, finding hidden gems we never would have discovered on our own. Every recommendation was perfect - from the secluded beach to the romantic dinner spot. Truly effortless luxury."
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>AV</div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>Alexandra V.</div>
                  <div className={styles.authorDetail}>Anniversary Trip • Providenciales</div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={styles.starFilled} size={18} />
                ))}
              </div>
              <Quote className={styles.quoteIcon} size={32} />
              <p className={styles.testimonialText}>
                "I was skeptical about an AI planning my family's vacation, but it was incredible. It balanced activities for the kids with relaxation for us perfectly. We saved so much time and discovered experiences we would have missed. Best family vacation ever!"
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>MJ</div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>Michael J.</div>
                  <div className={styles.authorDetail}>Family Vacation • Grand Turk</div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={styles.starFilled} size={18} />
                ))}
              </div>
              <Quote className={styles.quoteIcon} size={32} />
              <p className={styles.testimonialText}>
                "Booking through Caicos Compass was seamless. I found an amazing villa, scheduled snorkeling tours, and reserved restaurants all in one place. The reviews were accurate, the pricing was transparent, and every vendor exceeded our expectations. Will definitely use again!"
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>SL</div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>Sarah L.</div>
                  <div className={styles.authorDetail}>Solo Adventure • Providenciales</div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={styles.starFilled} size={18} />
                ))}
              </div>
              <Quote className={styles.quoteIcon} size={32} />
              <p className={styles.testimonialText}>
                "The customer service was outstanding. When our original tour got canceled due to weather, the Caicos Compass team immediately helped us find an alternative and even got us a discount. They truly care about making your trip special."
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>DK</div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>David K.</div>
                  <div className={styles.authorDetail}>Couple's Getaway • North Caicos</div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={styles.starFilled} size={18} />
                ))}
              </div>
              <Quote className={styles.quoteIcon} size={32} />
              <p className={styles.testimonialText}>
                "As a first-time visitor to Turks and Caicos, I had no idea where to start. Caicos Compass made everything easy - from finding the perfect beachfront hotel to booking authentic local experiences. The verified reviews gave me confidence in every choice."
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>JW</div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>Jessica W.</div>
                  <div className={styles.authorDetail}>First Visit • Providenciales</div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={styles.starFilled} size={18} />
                ))}
              </div>
              <Quote className={styles.quoteIcon} size={32} />
              <p className={styles.testimonialText}>
                "We visit Turks and Caicos every year, and Caicos Compass has become our go-to. Love being able to save favorites and rebook activities we enjoyed last time. The platform just keeps getting better - now with AI recommendations, it's even more personalized."
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>RT</div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>Robert T.</div>
                  <div className={styles.authorDetail}>Annual Visitor • Multi-Island</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Vendor Success Stories</h2>
          <p className={styles.sectionSubtitle}>Local businesses thriving with Caicos Compass</p>

          <div className={styles.vendorStories}>
            <div className={styles.vendorCard}>
              <div className={styles.vendorHeader}>
                <TrendingUp className={styles.vendorIcon} size={40} />
                <div>
                  <h3>Island Paradise Tours</h3>
                  <div className={styles.vendorBadge}>Tour Operator • Providenciales</div>
                </div>
              </div>
              <div className={styles.growthMetrics}>
                <div className={styles.metric}>
                  <div className={styles.metricValue}>300%</div>
                  <div className={styles.metricLabel}>Booking Increase</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricValue}>$150K</div>
                  <div className={styles.metricLabel}>Additional Revenue</div>
                </div>
              </div>
              <p className={styles.vendorQuote}>
                "Joining Caicos Compass was the best business decision we made. In our first year, bookings tripled and we reached customers we never could have found on our own. The dashboard makes management effortless, and the support team actually cares about our success. We've hired 3 new guides to keep up with demand!"
              </p>
              <div className={styles.vendorAuthor}>— Marcus Thompson, Owner</div>
            </div>

            <div className={styles.vendorCard}>
              <div className={styles.vendorHeader}>
                <Award className={styles.vendorIcon} size={40} />
                <div>
                  <h3>Oceanview Luxury Villa</h3>
                  <div className={styles.vendorBadge}>Accommodation • Grace Bay</div>
                </div>
              </div>
              <div className={styles.growthMetrics}>
                <div className={styles.metric}>
                  <div className={styles.metricValue}>95%</div>
                  <div className={styles.metricLabel}>Occupancy Rate</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricValue}>4.9★</div>
                  <div className={styles.metricLabel}>Average Rating</div>
                </div>
              </div>
              <p className={styles.vendorQuote}>
                "The verified reviews and professional photos on Caicos Compass helped showcase our villa's true luxury. We went from struggling to fill weekdays to being booked months in advance. The commission is fair considering the quality customers and exposure we get."
              </p>
              <div className={styles.vendorAuthor}>— Elena Rodriguez, Property Manager</div>
            </div>

            <div className={styles.vendorCard}>
              <div className={styles.vendorHeader}>
                <Heart className={styles.vendorIcon} size={40} />
                <div>
                  <h3>Caribbean Spice Restaurant</h3>
                  <div className={styles.vendorBadge}>Dining • Downtown Provo</div>
                </div>
              </div>
              <div className={styles.growthMetrics}>
                <div className={styles.metric}>
                  <div className={styles.metricValue}>500+</div>
                  <div className={styles.metricLabel}>New Customers/Month</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricValue}>200+</div>
                  <div className={styles.metricLabel}>5-Star Reviews</div>
                </div>
              </div>
              <p className={styles.vendorQuote}>
                "Caicos Compass put us on the map! We're a family-run restaurant, and before joining we relied mostly on walk-ins. Now we get tourists who specifically seek us out based on the platform's recommendations. The reservation system has eliminated our no-show problem too."
              </p>
              <div className={styles.vendorAuthor}>— James & Patricia Williams, Owners</div>
            </div>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <h2>Join Our Success Story</h2>
          <p>Whether you're planning your dream vacation or growing your business, Caicos Compass is here to help you succeed.</p>
          <div className={styles.ctaButtons}>
            <a href="/" className={styles.primaryButton}>Start Exploring</a>
            <a href="/vendor-signup" className={styles.secondaryButton}>Become a Partner</a>
          </div>
        </div>
      </div>
    </div>
  );
}