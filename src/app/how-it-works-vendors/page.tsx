"use client";

import React from "react";
import styles from "./howItWorksVendors.module.css";
import { FileText, CheckCircle, Briefcase, TrendingUp, DollarSign, Users } from "lucide-react";

export default function HowItWorksVendorsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Briefcase className={styles.headerIcon} size={64} />
          <h1>Grow Your Business with Caicos Compass</h1>
          <p>Join hundreds of successful vendors reaching thousands of travelers</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.stepsSection}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepIcon}>
              <FileText size={48} />
            </div>
            <div className={styles.stepContent}>
              <h2>Apply to Become a Partner</h2>
              <p>Getting started is quick and easy. Our simple application process takes just minutes:</p>
              <ul>
                <li>Fill out the vendor application form with your business details</li>
                <li>Provide your business license and registration documents</li>
                <li>Submit proof of insurance (liability coverage required)</li>
                <li>Add your tax identification and bank account information</li>
                <li>Describe your services and what makes your business unique</li>
              </ul>
              
              <div className={styles.requirementsBox}>
                <h4>What You'll Need:</h4>
                <ul>
                  <li>Valid Turks and Caicos business license</li>
                  <li>Liability insurance ($1M minimum recommended)</li>
                  <li>Tax ID number</li>
                  <li>Bank account for payments</li>
                  <li>Photos of your business/services</li>
                  <li>Business contact information</li>
                </ul>
              </div>
              
              <a href="/vendor-signup" className={styles.stepButton}>Start Your Application</a>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepIcon}>
              <CheckCircle size={48} />
            </div>
            <div className={styles.stepContent}>
              <h2>Verification & Approval</h2>
              <p>Our team reviews your application to ensure quality standards:</p>
              <ul>
                <li>Document verification (typically within 24-48 hours)</li>
                <li>Business background and quality review</li>
                <li>Confirmation of licenses, permits, and insurance</li>
                <li>Initial phone consultation to answer questions</li>
                <li>Approval notification via email</li>
              </ul>
              
              <div className={styles.tipBox}>
                <CheckCircle size={18} />
                <p><strong>Quick Approval:</strong> Most applications are approved within 2 business days. We prioritize quality vendors who meet our standards.</p>
              </div>
              
              <h3 className={styles.subsectionTitle}>What We Look For</h3>
              <div className={styles.criteriaGrid}>
                <div className={styles.criteriaCard}>
                  <span className={styles.criteriaIcon}>✓</span>
                  <p>Valid licenses & insurance</p>
                </div>
                <div className={styles.criteriaCard}>
                  <span className={styles.criteriaIcon}>⭐</span>
                  <p>Quality service commitment</p>
                </div>
                <div className={styles.criteriaCard}>
                  <span className={styles.criteriaIcon}>📝</span>
                  <p>Complete documentation</p>
                </div>
                <div className={styles.criteriaCard}>
                  <span className={styles.criteriaIcon}>🤝</span>
                  <p>Professional reputation</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepIcon}>
              <Briefcase size={48} />
            </div>
            <div className={styles.stepContent}>
              <h2>Create Your Listings</h2>
              <p>Once approved, use our powerful vendor dashboard to showcase your services:</p>
              
              <h3 className={styles.subsectionTitle}>Dashboard Features</h3>
              <ul>
                <li><strong>Service Listings:</strong> Create detailed listings for each service you offer</li>
                <li><strong>Photo Gallery:</strong> Upload high-quality images to attract customers</li>
                <li><strong>Pricing & Availability:</strong> Set your prices and manage your calendar</li>
                <li><strong>Cancellation Policies:</strong> Choose policies that work for your business</li>
                <li><strong>Special Offers:</strong> Create promotions and seasonal deals</li>
                <li><strong>Business Profile:</strong> Showcase your story, team, and what makes you special</li>
              </ul>
              
              <h3 className={styles.subsectionTitle}>Service Types You Can List</h3>
              <div className={styles.serviceTypes}>
                <span className={styles.serviceTag}>🏨 Accommodations</span>
                <span className={styles.serviceTag}>🌊 Water Activities</span>
                <span className={styles.serviceTag}>🍽️ Restaurants</span>
                <span className={styles.serviceTag}>🚗 Transportation</span>
                <span className={styles.serviceTag}>💆 Wellness & Spa</span>
                <span className={styles.serviceTag}>🎯 Tours & Excursions</span>
                <span className={styles.serviceTag}>🛍️ Retail & Shopping</span>
                <span className={styles.serviceTag}>🎨 Experiences</span>
              </div>
              
              <div className={styles.tipBox}>
                <Briefcase size={18} />
                <p><strong>Best Practice:</strong> Listings with 5+ high-quality photos and detailed descriptions receive 3x more bookings!</p>
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepIcon}>
              <Users size={48} />
            </div>
            <div className={styles.stepContent}>
              <h2>Receive & Manage Bookings</h2>
              <p>Start getting bookings from thousands of travelers:</p>
              
              <h3 className={styles.subsectionTitle}>Booking Management</h3>
              <ul>
                <li><strong>Real-Time Notifications:</strong> Instant alerts for new bookings via email and SMS</li>
                <li><strong>Auto-Confirm or Manual:</strong> Choose to auto-accept or manually review each booking</li>
                <li><strong>Customer Communication:</strong> Built-in messaging system to communicate with guests</li>
                <li><strong>Calendar Management:</strong> Easy-to-use calendar to manage availability</li>
                <li><strong>Booking Details:</strong> Access complete customer information and special requests</li>
                <li><strong>Status Tracking:</strong> Track bookings from confirmation to completion</li>
              </ul>
              
              <div className={styles.responseBox}>
                <h4>⏱️ Response Time Matters</h4>
                <p>Respond to booking requests within 24 hours to maintain good standing and higher search rankings. Auto-confirm makes this even easier!</p>
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepIcon}>
              <DollarSign size={48} />
            </div>
            <div className={styles.stepContent}>
              <h2>Get Paid Automatically</h2>
              <p>We handle payments so you can focus on delivering great experiences:</p>
              
              <h3 className={styles.subsectionTitle}>How Payments Work</h3>
              <ul>
                <li>Customers pay the full amount at booking</li>
                <li>We hold funds securely until service completion</li>
                <li>Platform commission is automatically deducted</li>
                <li>Funds transferred to your account within 24-48 hours after service</li>
                <li>Weekly payout summaries and detailed reporting</li>
              </ul>
              
              <div className={styles.pricingBox}>
                <h4>💰 Commission Structure</h4>
                <div className={styles.pricingTiers}>
                  <div className={styles.pricingTier}>
                    <div className={styles.tierBadge}>New Vendor</div>
                    <div className={styles.tierRate}>10%</div>
                    <p>First 3 months</p>
                  </div>
                  <div className={styles.pricingTier}>
                    <div className={styles.tierBadge}>Standard</div>
                    <div className={styles.tierRate}>15%</div>
                    <p>Regular commission</p>
                  </div>
                  <div className={styles.pricingTier}>
                    <div className={styles.tierBadge}>Premium</div>
                    <div className={styles.tierRate}>10%</div>
                    <p>4.8+ stars, 50+ reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepIcon}>
              <TrendingUp size={48} />
            </div>
            <div className={styles.stepContent}>
              <h2>Grow & Optimize</h2>
              <p>Use our tools and insights to continuously improve your business:</p>
              
              <h3 className={styles.subsectionTitle}>Analytics & Insights</h3>
              <ul>
                <li><strong>Performance Dashboard:</strong> Track bookings, revenue, and trends</li>
                <li><strong>Customer Reviews:</strong> Monitor feedback and ratings</li>
                <li><strong>Booking Analytics:</strong> Understand peak times and demand patterns</li>
                <li><strong>Revenue Reports:</strong> Detailed financial reporting and forecasting</li>
                <li><strong>Search Performance:</strong> See how customers find your listings</li>
              </ul>
              
              <h3 className={styles.subsectionTitle}>Growth Opportunities</h3>
              <ul>
                <li><strong>Featured Listings:</strong> Promotional opportunities to boost visibility</li>
                <li><strong>Seasonal Campaigns:</strong> Participate in platform-wide marketing</li>
                <li><strong>Referral Program:</strong> Earn bonuses for referring new vendors</li>
                <li><strong>Best Practices Guide:</strong> Learn from top-performing vendors</li>
                <li><strong>Marketing Materials:</strong> Free promotional assets and templates</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Why Partner with Caicos Compass?</h2>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitNumber}>🎯</div>
              <h3>Targeted Exposure</h3>
              <p>Reach travelers actively searching for experiences in Turks and Caicos</p>
            </div>
            
            <div className={styles.benefitCard}>
              <div className={styles.benefitNumber}>📱</div>
              <h3>Easy Management</h3>
              <p>Intuitive dashboard to manage everything from one place</p>
            </div>
            
            <div className={styles.benefitCard}>
              <div className={styles.benefitNumber}>💰</div>
              <h3>Reliable Income</h3>
              <p>Automated payments within 24-48 hours of service completion</p>
            </div>
            
            <div className={styles.benefitCard}>
              <div className={styles.benefitNumber}>🚀</div>
              <h3>Marketing Support</h3>
              <p>Benefit from our platform-wide marketing and SEO efforts</p>
            </div>
            
            <div className={styles.benefitCard}>
              <div className={styles.benefitNumber}>👥</div>
              <h3>Dedicated Support</h3>
              <p>Access to a business support team that understands your needs</p>
            </div>
            
            <div className={styles.benefitCard}>
              <div className={styles.benefitNumber}>📊</div>
              <h3>Data & Insights</h3>
              <p>Powerful analytics to make informed business decisions</p>
            </div>
          </div>
        </div>

        <div className={styles.supportSection}>
          <h2>We're Here to Help You Succeed</h2>
          <p>Our vendor support team is dedicated to helping you maximize your success on the platform.</p>
          
          <div className={styles.supportGrid}>
            <div className={styles.supportCard}>
              <h3>📚 Resources</h3>
              <ul>
                <li>Step-by-step setup guides</li>
                <li>Video tutorials</li>
                <li>Best practices documentation</li>
                <li>FAQ and knowledge base</li>
              </ul>
            </div>
            
            <div className={styles.supportCard}>
              <h3>💬 Live Support</h3>
              <ul>
                <li>Email: business@caicoscompass.com</li>
                <li>Phone: +1 (649) 123-4567</li>
                <li>Hours: Mon-Fri, 9 AM - 6 PM EST</li>
                <li>In-dashboard messaging</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <h2>Ready to Grow Your Business?</h2>
          <p>Join Caicos Compass and start reaching more customers today</p>
          <a href="/vendor-signup" className={styles.ctaButton}>Start Your Application</a>
          <p className={styles.ctaSubtext}>Or <a href="/vendor-agreement">view our partnership agreement</a> to learn more</p>
        </div>
      </div>
    </div>
  );
}