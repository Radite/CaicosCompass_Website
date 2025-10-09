"use client";

import React from "react";
import styles from "./howItWorks.module.css";
import { Search, Calendar, CreditCard, CheckCircle, Star, MapPin, Shield, Sparkles } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Sparkles className={styles.headerIcon} size={64} />
          <h1>How Caicos Compass Works</h1>
          <p>Book your perfect Turks and Caicos experience in four simple steps</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.stepsSection}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepIcon}>
              <Search size={48} />
            </div>
            <div className={styles.stepContent}>
              <h2>Discover & Explore</h2>
              <p>Browse our curated collection of experiences across the Turks and Caicos Islands. Use filters to find exactly what you're looking for:</p>
              <ul>
                <li>Choose your island destination (Providenciales, Grand Turk, and more)</li>
                <li>Select activity type (water sports, dining, accommodations, tours)</li>
                <li>Filter by price range, ratings, and availability</li>
                <li>Read authentic reviews from verified travelers</li>
                <li>View detailed photos and descriptions</li>
              </ul>
              <div className={styles.tipBox}>
                <Star size={18} />
                <p><strong>Pro Tip:</strong> Use our AI-powered itinerary planner to get personalized recommendations based on your preferences and travel dates!</p>
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepIcon}>
              <Calendar size={48} />
            </div>
            <div className={styles.stepContent}>
              <h2>Select Date & Options</h2>
              <p>Choose your preferred dates and customize your experience:</p>
              <ul>
                <li>Check real-time availability on our calendar</li>
                <li>Select time slots that work for your schedule</li>
                <li>Choose number of guests or travelers</li>
                <li>Add special requests or requirements</li>
                <li>Select from different package options and upgrades</li>
                <li>See transparent pricing with no hidden fees</li>
              </ul>
              <div className={styles.tipBox}>
                <Calendar size={18} />
                <p><strong>Flexible Booking:</strong> Many activities offer free cancellation up to 24-48 hours before your experience!</p>
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepIcon}>
              <CreditCard size={48} />
            </div>
            <div className={styles.stepContent}>
              <h2>Book & Pay Securely</h2>
              <p>Complete your reservation with our secure payment system:</p>
              <ul>
                <li>Create your free Caicos Compass account (or sign in)</li>
                <li>Review your booking details and total cost</li>
                <li>Choose from multiple payment methods (cards, PayPal, Apple Pay)</li>
                <li>Your payment is secured with industry-standard encryption</li>
                <li>Receive instant booking confirmation via email</li>
                <li>Access your booking details in your account dashboard</li>
              </ul>
              <div className={styles.securityBox}>
                <Shield size={20} />
                <div>
                  <strong>100% Secure Payments</strong>
                  <p>Your financial information is protected with SSL encryption and never stored on our servers.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepIcon}>
              <CheckCircle size={48} />
            </div>
            <div className={styles.stepContent}>
              <h2>Enjoy Your Experience</h2>
              <p>Show up and have an amazing time!</p>
              <ul>
                <li>Receive booking confirmation with all details</li>
                <li>Get directions and contact information for your provider</li>
                <li>Access your booking from anywhere via our mobile app</li>
                <li>Message the service provider if you have questions</li>
                <li>Check-in and enjoy your experience</li>
                <li>Leave a review to help future travelers</li>
              </ul>
              <div className={styles.tipBox}>
                <MapPin size={18} />
                <p><strong>Need Help?</strong> Our customer support team is available 24/7 to assist with any questions or concerns during your trip!</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Why Choose Caicos Compass?</h2>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>✓</div>
              <h3>Verified Businesses</h3>
              <p>Every service provider is vetted and verified to ensure quality and safety.</p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>💰</div>
              <h3>Best Price Guarantee</h3>
              <p>We work directly with local providers to offer competitive prices.</p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>⭐</div>
              <h3>Authentic Reviews</h3>
              <p>Read honest feedback from verified travelers who've been there.</p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>🔒</div>
              <h3>Secure Booking</h3>
              <p>Your information and payments are protected with advanced security.</p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>📱</div>
              <h3>Easy Management</h3>
              <p>View, modify, or cancel bookings anytime from your dashboard.</p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>🎯</div>
              <h3>Local Expertise</h3>
              <p>Discover hidden gems and authentic experiences you won't find elsewhere.</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Booking Made Even Easier</h2>
          
          <div className={styles.featureBox}>
            <div className={styles.featureIcon}>
              <Sparkles size={32} />
            </div>
            <div className={styles.featureContent}>
              <h3>AI-Powered Itinerary Planning</h3>
              <p>Tell us what you're looking for, and our AI will create a personalized itinerary in seconds! Just describe your dream vacation - like "3-day romantic getaway with private dining and snorkeling" - and we'll handle the rest.</p>
              <a href="/ai-itinerary" className={styles.featureButton}>Try AI Planner</a>
            </div>
          </div>

          <div className={styles.featureBox}>
            <div className={styles.featureIcon}>
              <Calendar size={32} />
            </div>
            <div className={styles.featureContent}>
              <h3>Save Your Favorites</h3>
              <p>Create wish lists of activities and experiences you want to try. Share them with travel companions and book them all at once when you're ready.</p>
              <a href="/signup" className={styles.featureButton}>Create Account</a>
            </div>
          </div>

          <div className={styles.featureBox}>
            <div className={styles.featureIcon}>
              <Star size={32} />
            </div>
            <div className={styles.featureContent}>
              <h3>Rewards Program</h3>
              <p>Earn points with every booking and redeem them for discounts on future experiences. The more you explore, the more you save!</p>
              <a href="/signup" className={styles.featureButton}>Join Now</a>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>Do I need to create an account to book?</h4>
              <p>Yes, creating a free account allows you to manage your bookings, save favorites, track your trip history, and receive personalized recommendations.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>Can I modify or cancel my booking?</h4>
              <p>Yes! Cancellation policies vary by service provider and are clearly displayed before booking. Most activities offer free cancellation up to 24-48 hours in advance.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>How do I contact the service provider?</h4>
              <p>You can message providers directly through our platform after booking. Their contact information is also included in your confirmation email.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>What payment methods do you accept?</h4>
              <p>We accept major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and select cryptocurrency wallets.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>Is my payment information secure?</h4>
              <p>Absolutely! We use bank-level encryption and never store your full credit card details. All payments are processed through secure, PCI-compliant payment gateways.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>What if I need help during my trip?</h4>
              <p>Our customer support team is available 24/7 via phone, email, or live chat. You can reach us anytime if you need assistance.</p>
            </div>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <h2>Ready to Start Exploring?</h2>
          <p>Join thousands of travelers who have discovered the best of Turks and Caicos with Caicos Compass.</p>
          <div className={styles.ctaButtons}>
            <a href="/" className={styles.primaryButton}>Browse Experiences</a>
            <a href="/ai-itinerary" className={styles.secondaryButton}>Plan with AI</a>
          </div>
        </div>
      </div>
    </div>
  );
}