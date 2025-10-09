"use client";

import React from "react";
import styles from "./press.module.css";
import { FileText, Download, Image, Mail, Globe, Award } from "lucide-react";

export default function PressMediaKitPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Globe className={styles.headerIcon} size={64} />
          <h1>Press & Media Kit</h1>
          <p>Resources for journalists, bloggers, and media professionals</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileText size={24} />
            <h2>About Caicos Compass</h2>
          </div>
          <p className={styles.lead}>
            Caicos Compass is the leading digital marketplace connecting travelers with local businesses across the Turks and Caicos Islands. Our platform makes discovering and booking authentic experiences effortless while supporting the local economy and sustainable tourism.
          </p>
          
          <div className={styles.quickFacts}>
            <h3>Quick Facts</h3>
            <div className={styles.factsGrid}>
              <div className={styles.factCard}>
                <div className={styles.factLabel}>Founded</div>
                <div className={styles.factValue}>2024</div>
              </div>
              <div className={styles.factCard}>
                <div className={styles.factLabel}>Headquarters</div>
                <div className={styles.factValue}>Providenciales, TCI</div>
              </div>
              <div className={styles.factCard}>
                <div className={styles.factLabel}>Business Partners</div>
                <div className={styles.factValue}>500+</div>
              </div>
              <div className={styles.factCard}>
                <div className={styles.factLabel}>Users</div>
                <div className={styles.factValue}>10,000+</div>
              </div>
              <div className={styles.factCard}>
                <div className={styles.factLabel}>Islands Covered</div>
                <div className={styles.factValue}>8</div>
              </div>
              <div className={styles.factCard}>
                <div className={styles.factLabel}>Average Rating</div>
                <div className={styles.factValue}>4.9★</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Award size={24} />
            <h2>Our Mission & Vision</h2>
          </div>
          
          <div className={styles.missionBox}>
            <h3>Mission</h3>
            <p>To empower travelers to explore the Turks and Caicos Islands with confidence while supporting and showcasing the incredible local businesses that make these islands special.</p>
          </div>

          <div className={styles.visionBox}>
            <h3>Vision</h3>
            <p>To be the most trusted and comprehensive platform for Turks and Caicos tourism, setting the standard for sustainable, community-focused travel marketplaces worldwide.</p>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileText size={24} />
            <h2>What We Do</h2>
          </div>
          
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <h4>For Travelers</h4>
              <ul>
                <li>Browse and book accommodations, activities, dining, and services</li>
                <li>AI-powered itinerary planning</li>
                <li>Verified reviews and ratings</li>
                <li>Secure booking and payment processing</li>
                <li>24/7 customer support</li>
              </ul>
            </div>

            <div className={styles.serviceCard}>
              <h4>For Local Businesses</h4>
              <ul>
                <li>Professional listing platform</li>
                <li>Booking and calendar management</li>
                <li>Automated payment processing</li>
                <li>Analytics and performance insights</li>
                <li>Marketing and promotional tools</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Image size={24} />
            <h2>Brand Assets</h2>
          </div>
          
          <p>Download our official logos, brand colors, and guidelines for use in your publications.</p>

          <div className={styles.assetsGrid}>
            <div className={styles.assetCard}>
              <div className={styles.assetPreview}>
                <div className={styles.logoPlaceholder}>
                  <Globe size={48} />
                  <div>Logo Preview</div>
                </div>
              </div>
              <h4>Primary Logo</h4>
              <p>Full-color logo for light backgrounds</p>
              <button className={styles.downloadButton}>
                <Download size={16} />
                Download PNG
              </button>
            </div>

            <div className={styles.assetCard}>
              <div className={styles.assetPreview}>
                <div className={styles.logoPlaceholder} style={{background: '#2c3e50'}}>
                  <Globe size={48} color="white" />
                  <div style={{color: 'white'}}>Logo Preview</div>
                </div>
              </div>
              <h4>White Logo</h4>
              <p>White logo for dark backgrounds</p>
              <button className={styles.downloadButton}>
                <Download size={16} />
                Download PNG
              </button>
            </div>

            <div className={styles.assetCard}>
              <div className={styles.assetPreview}>
                <div className={styles.logoPlaceholder}>
                  <Globe size={48} />
                  <div>Icon Only</div>
                </div>
              </div>
              <h4>Icon/Mark</h4>
              <p>Standalone compass icon</p>
              <button className={styles.downloadButton}>
                <Download size={16} />
                Download PNG
              </button>
            </div>
          </div>

          <div className={styles.brandColors}>
            <h3>Brand Colors</h3>
            <div className={styles.colorsGrid}>
              <div className={styles.colorSwatch}>
                <div className={styles.colorBox} style={{background: '#0275d8'}}></div>
                <div className={styles.colorName}>Primary Blue</div>
                <div className={styles.colorHex}>#0275d8</div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.colorBox} style={{background: '#20c997'}}></div>
                <div className={styles.colorName}>Accent Teal</div>
                <div className={styles.colorHex}>#20c997</div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.colorBox} style={{background: '#ffd700'}}></div>
                <div className={styles.colorName}>Gold</div>
                <div className={styles.colorHex}>#ffd700</div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.colorBox} style={{background: '#2c3e50'}}></div>
                <div className={styles.colorName}>Dark Gray</div>
                <div className={styles.colorHex}>#2c3e50</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileText size={24} />
            <h2>Press Releases & News</h2>
          </div>
          
          <div className={styles.newsList}>
            <div className={styles.newsItem}>
              <div className={styles.newsDate}>January 2025</div>
              <h4>Caicos Compass Launches AI-Powered Itinerary Planner</h4>
              <p>Revolutionary new feature allows travelers to create personalized trip plans in seconds using advanced artificial intelligence.</p>
              <a href="#" className={styles.readMore}>Read Full Release →</a>
            </div>

            <div className={styles.newsItem}>
              <div className={styles.newsDate}>December 2024</div>
              <h4>Platform Reaches 500 Local Business Partners</h4>
              <p>Caicos Compass celebrates major milestone, now representing the majority of tourism businesses across all eight islands.</p>
              <a href="#" className={styles.readMore}>Read Full Release →</a>
            </div>

            <div className={styles.newsItem}>
              <div className={styles.newsDate}>October 2024</div>
              <h4>10,000 Travelers Choose Caicos Compass</h4>
              <p>Platform reaches significant user milestone while maintaining industry-leading 4.9-star average rating.</p>
              <a href="#" className={styles.readMore}>Read Full Release →</a>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Award size={24} />
            <h2>Awards & Recognition</h2>
          </div>
          
          <div className={styles.awardsList}>
            <div className={styles.awardItem}>
              <div className={styles.awardIcon}>🏆</div>
              <div>
                <h4>Best Tourism Innovation 2024</h4>
                <p>Turks and Caicos Islands Tourism Board</p>
              </div>
            </div>

            <div className={styles.awardItem}>
              <div className={styles.awardIcon}>⭐</div>
              <div>
                <h4>Top-Rated Travel Platform</h4>
                <p>Caribbean Travel Excellence Awards</p>
              </div>
            </div>

            <div className={styles.awardItem}>
              <div className={styles.awardIcon}>🌟</div>
              <div>
                <h4>Sustainable Tourism Leader</h4>
                <p>Island Conservation Partnership</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileText size={24} />
            <h2>Key Statistics</h2>
          </div>
          
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <div className={styles.statNumber}>500+</div>
              <div className={styles.statLabel}>Local Business Partners</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNumber}>10,000+</div>
              <div className={styles.statLabel}>Active Users</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNumber}>50,000+</div>
              <div className={styles.statLabel}>Bookings Processed</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNumber}>4.9/5</div>
              <div className={styles.statLabel}>Average Rating</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNumber}>8</div>
              <div className={styles.statLabel}>Islands Covered</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNumber}>98%</div>
              <div className={styles.statLabel}>Customer Satisfaction</div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Mail size={24} />
            <h2>Media Contact</h2>
          </div>
          
          <div className={styles.contactBox}>
            <p className={styles.contactIntro}>
              For press inquiries, interviews, or additional information, please contact our media relations team:
            </p>
            
            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <strong>Email:</strong>
                <a href="mailto:press@caicoscompass.com">press@caicoscompass.com</a>
              </div>
              <div className={styles.contactItem}>
                <strong>Phone:</strong>
                <a href="tel:+16491234567">+1 (649) 123-4567</a>
              </div>
              <div className={styles.contactItem}>
                <strong>Address:</strong>
                <span>Providenciales, Turks and Caicos Islands</span>
              </div>
              <div className={styles.contactItem}>
                <strong>Media Kit:</strong>
                <button className={styles.downloadFullKit}>
                  <Download size={18} />
                  Download Complete Press Kit (ZIP)
                </button>
              </div>
            </div>

            <p className={styles.responseTime}>
              We typically respond to media inquiries within 24 hours.
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileText size={24} />
            <h2>Boilerplate</h2>
          </div>
          
          <div className={styles.boilerplate}>
            <p>
              <strong>About Caicos Compass</strong>
            </p>
            <p>
              Caicos Compass is the premier digital marketplace for Turks and Caicos Islands tourism, connecting travelers with authentic local experiences across all eight islands. Founded in 2024, the platform features 500+ verified business partners offering accommodations, activities, dining, transportation, and wellness services. With innovative features like AI-powered itinerary planning and a commitment to sustainable tourism, Caicos Compass has served over 10,000 travelers while maintaining a 4.9-star average rating. The company is headquartered in Providenciales, Turks and Caicos Islands. For more information, visit www.caicoscompass.com.
            </p>
          </div>
        </div>

        <div className={styles.usageGuidelines}>
          <h3>Brand Usage Guidelines</h3>
          <div className={styles.guidelinesList}>
            <div className={styles.guideline}>
              <span className={styles.guidelineIcon}>✓</span>
              <p>Use our official logos and brand assets as provided</p>
            </div>
            <div className={styles.guideline}>
              <span className={styles.guidelineIcon}>✓</span>
              <p>Maintain proper spacing and clear zone around logos</p>
            </div>
            <div className={styles.guideline}>
              <span className={styles.guidelineIcon}>✓</span>
              <p>Use brand colors as specified in the color palette</p>
            </div>
            <div className={styles.guideline}>
              <span className={styles.guidelineIcon}>✗</span>
              <p>Do not modify, distort, or recolor our logos</p>
            </div>
            <div className={styles.guideline}>
              <span className={styles.guidelineIcon}>✗</span>
              <p>Do not use outdated or unofficial brand assets</p>
            </div>
            <div className={styles.guideline}>
              <span className={styles.guidelineIcon}>✗</span>
              <p>Do not incorporate our brand into your own branding</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}