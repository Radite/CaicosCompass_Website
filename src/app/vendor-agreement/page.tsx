"use client";

import React from "react";
import styles from "./vendorAgreement.module.css";
import { Briefcase, DollarSign, Shield, FileCheck, AlertTriangle } from "lucide-react";

export default function VendorAgreementPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Briefcase className={styles.headerIcon} size={48} />
          <h1>Vendor Partnership Agreement</h1>
          <p>Last updated: January 1, 2025</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileCheck size={24} />
            <h2>1. Agreement Overview</h2>
          </div>
          <p>
            This Vendor Partnership Agreement ("Agreement") is between Caicos Compass ("Platform," "we," "us") and you ("Vendor," "Service Provider," "you") for the provision of services through our marketplace platform connecting travelers with local businesses across the Turks and Caicos Islands.
          </p>
          <p>
            By creating a vendor account and listing services on Caicos Compass, you acknowledge that you have read, understood, and agree to be bound by this Agreement and our Terms of Service.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>2. Vendor Eligibility and Registration</h2>
          </div>
          
          <h3>2.1 Eligibility Requirements</h3>
          <p>To become a vendor on Caicos Compass, you must:</p>
          <ul>
            <li>Be at least 18 years of age</li>
            <li>Have legal authorization to operate a business in Turks and Caicos Islands</li>
            <li>Possess all required business licenses, permits, and insurance</li>
            <li>Provide accurate and complete business information</li>
            <li>Comply with all applicable local, national, and international laws</li>
          </ul>

          <h3>2.2 Business Types</h3>
          <p>We accept the following types of vendors:</p>
          <ul>
            <li>Restaurants and dining establishments</li>
            <li>Hotels, resorts, and accommodation providers</li>
            <li>Villa and property rental operators</li>
            <li>Airbnb and vacation rental hosts</li>
            <li>Tour and activity operators</li>
            <li>Transportation services (taxi, car rental, boat charter)</li>
            <li>Retail shops and boutiques</li>
            <li>Wellness and spa facilities</li>
            <li>Other tourism-related services (subject to approval)</li>
          </ul>

          <h3>2.3 Required Documentation</h3>
          <p>Upon registration, you must provide:</p>
          <ul>
            <li>Valid business license or registration certificate</li>
            <li>Tax identification number</li>
            <li>Proof of insurance (liability, workers' compensation where applicable)</li>
            <li>Bank account information for payment processing</li>
            <li>Government-issued ID of authorized representative</li>
            <li>Business address and contact information</li>
          </ul>

          <h3>2.4 Verification Process</h3>
          <p>
            All vendor applications undergo a verification process (typically 24-48 hours). We reserve the right to reject applications that do not meet our quality standards or eligibility requirements.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Briefcase size={24} />
            <h2>3. Vendor Responsibilities</h2>
          </div>
          
          <h3>3.1 Service Quality</h3>
          <p>You agree to:</p>
          <ul>
            <li>Provide services as described in your listings</li>
            <li>Maintain high-quality standards and professional service</li>
            <li>Honor all confirmed bookings unless extraordinary circumstances arise</li>
            <li>Respond to booking requests within 24 hours</li>
            <li>Communicate professionally with customers</li>
            <li>Resolve customer issues promptly and fairly</li>
          </ul>

          <h3>3.2 Accurate Listings</h3>
          <p>You must ensure your listings contain:</p>
          <ul>
            <li>Truthful and accurate descriptions</li>
            <li>Current pricing and availability</li>
            <li>Clear photos that accurately represent your service/facility</li>
            <li>Transparent cancellation policies</li>
            <li>Full disclosure of any restrictions or requirements</li>
            <li>Updates to reflect changes in services, pricing, or availability</li>
          </ul>

          <h3>3.3 Legal Compliance</h3>
          <p>You are responsible for:</p>
          <ul>
            <li>Maintaining all required licenses and permits</li>
            <li>Complying with health and safety regulations</li>
            <li>Following environmental and sustainability guidelines</li>
            <li>Paying all applicable taxes</li>
            <li>Adhering to labor laws and employment standards</li>
            <li>Meeting accessibility requirements where applicable</li>
          </ul>

          <h3>3.4 Insurance Coverage</h3>
          <p>You must maintain adequate insurance including:</p>
          <ul>
            <li>General liability insurance (minimum $1,000,000 coverage recommended)</li>
            <li>Professional liability insurance (where applicable)</li>
            <li>Workers' compensation insurance (if you have employees)</li>
            <li>Vehicle insurance (for transportation services)</li>
            <li>Property insurance (for accommodation providers)</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <DollarSign size={24} />
            <h2>4. Pricing, Payments, and Fees</h2>
          </div>
          
          <h3>4.1 Setting Prices</h3>
          <ul>
            <li>You have full control over your pricing</li>
            <li>Prices must be displayed in USD</li>
            <li>All taxes and fees must be clearly disclosed</li>
            <li>Price changes only apply to new bookings, not confirmed reservations</li>
          </ul>

          <h3>4.2 Platform Commission</h3>
          <p>Caicos Compass charges a service fee on completed bookings:</p>
          <ul>
            <li><strong>Standard Commission:</strong> 15% of the total booking value</li>
            <li><strong>Premium Partners:</strong> 10% for vendors with exceptional ratings (4.8+ stars, 50+ reviews)</li>
            <li><strong>New Vendors:</strong> First 3 months at reduced rate of 10% (introductory offer)</li>
          </ul>
          <p>
            Commission is calculated on the gross booking amount (excluding taxes). The commission structure may be adjusted with 30 days' written notice.
          </p>

          <h3>4.3 Payment Processing</h3>
          <ul>
            <li>Payments are processed through our secure payment gateway</li>
            <li>Customers pay the full amount at time of booking</li>
            <li>We hold funds until service completion or check-in (for accommodations)</li>
            <li>Payouts are released within 24-48 hours after service completion</li>
            <li>We withhold commission before transferring funds to your account</li>
          </ul>

          <h3>4.4 Payout Schedule</h3>
          <ul>
            <li><strong>Activities/Tours:</strong> Payout 24 hours after service completion</li>
            <li><strong>Accommodations:</strong> Payout 24 hours after check-in</li>
            <li><strong>Restaurants:</strong> Payout 24 hours after reservation date</li>
            <li><strong>Transportation:</strong> Payout 24 hours after service completion</li>
          </ul>

          <h3>4.5 Refunds and Chargebacks</h3>
          <ul>
            <li>Refunds are processed according to your cancellation policy</li>
            <li>You are responsible for refunds initiated by you</li>
            <li>Chargebacks may be deducted from future payouts</li>
            <li>Excessive chargebacks may result in account suspension</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileCheck size={24} />
            <h2>5. Booking Management</h2>
          </div>
          
          <h3>5.1 Accepting Bookings</h3>
          <ul>
            <li>You may set booking requests to auto-confirm or manual approval</li>
            <li>Manual requests must be responded to within 24 hours</li>
            <li>Failure to respond may result in automatic decline</li>
          </ul>

          <h3>5.2 Cancellations by Vendor</h3>
          <ul>
            <li>Vendor-initiated cancellations should be avoided when possible</li>
            <li>Customers receive full refund for vendor cancellations</li>
            <li>Excessive cancellations (>5% of bookings) may result in penalties:</li>
            <ul>
              <li>Reduced search ranking</li>
              <li>Warning notifications to customers</li>
              <li>Increased commission rates</li>
              <li>Account suspension or termination</li>
            </ul>
          </ul>

          <h3>5.3 No-Shows</h3>
          <ul>
            <li>If a customer doesn't show up, document the no-show</li>
            <li>You may be entitled to full payment depending on cancellation policy</li>
            <li>Report no-shows through the platform within 24 hours</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>6. Platform Rules and Policies</h2>
          </div>
          
          <h3>6.1 Prohibited Activities</h3>
          <p>Vendors may not:</p>
          <ul>
            <li>Discriminate against customers based on race, religion, gender, disability, etc.</li>
            <li>Request off-platform payments to avoid fees</li>
            <li>Share customer contact information without consent</li>
            <li>Post fake reviews or manipulate ratings</li>
            <li>Copy or use competitors' content or images</li>
            <li>Engage in fraudulent or deceptive practices</li>
            <li>Offer services that violate local laws or regulations</li>
          </ul>

          <h3>6.2 Content Standards</h3>
          <ul>
            <li>All content must be original or properly licensed</li>
            <li>Photos must accurately represent your service/facility</li>
            <li>Descriptions must be truthful and not misleading</li>
            <li>No offensive, inappropriate, or explicit content</li>
          </ul>

          <h3>6.3 Customer Reviews</h3>
          <ul>
            <li>Reviews are an important part of our platform</li>
            <li>You may respond professionally to reviews</li>
            <li>Do not pressure customers for positive reviews</li>
            <li>Do not offer incentives for reviews</li>
            <li>Do not post fake reviews or ask others to do so</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <AlertTriangle size={24} />
            <h2>7. Liability and Indemnification</h2>
          </div>
          
          <h3>7.1 Vendor Liability</h3>
          <p>You are solely responsible for:</p>
          <ul>
            <li>The quality and safety of your services</li>
            <li>Injuries or damages occurring during service provision</li>
            <li>Employee actions and conduct</li>
            <li>Compliance with all applicable laws and regulations</li>
            <li>Accuracy of your listings and descriptions</li>
          </ul>

          <h3>7.2 Platform Liability</h3>
          <p>Caicos Compass:</p>
          <ul>
            <li>Is a marketplace platform, not a service provider</li>
            <li>Does not guarantee booking volume or revenue</li>
            <li>Is not responsible for customer actions or behavior</li>
            <li>Does not verify all vendor claims or service quality</li>
            <li>May remove listings or suspend accounts at our discretion</li>
          </ul>

          <h3>7.3 Indemnification</h3>
          <p>
            You agree to indemnify and hold harmless Caicos Compass from any claims, damages, losses, or expenses (including legal fees) arising from:
          </p>
          <ul>
            <li>Your provision of services</li>
            <li>Your breach of this Agreement</li>
            <li>Your violation of any laws or regulations</li>
            <li>Your infringement of third-party rights</li>
            <li>Customer injuries or property damage</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileCheck size={24} />
            <h2>8. Intellectual Property</h2>
          </div>
          
          <h3>8.1 Your Content</h3>
          <ul>
            <li>You retain ownership of photos, descriptions, and other content you upload</li>
            <li>You grant us a license to use your content for platform operations and marketing</li>
            <li>Content must not infringe on third-party intellectual property rights</li>
          </ul>

          <h3>8.2 Platform Content</h3>
          <ul>
            <li>Caicos Compass name, logo, and branding are our property</li>
            <li>You may use our branding to promote your presence on the platform</li>
            <li>You may not modify our branding or use it in misleading ways</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>9. Term and Termination</h2>
          </div>
          
          <h3>9.1 Agreement Term</h3>
          <p>
            This Agreement begins when you create your vendor account and continues until terminated by either party.
          </p>

          <h3>9.2 Termination by Vendor</h3>
          <ul>
            <li>You may terminate at any time with 30 days' written notice</li>
            <li>You must fulfill all confirmed bookings before termination</li>
            <li>Outstanding payments will be settled according to payout schedule</li>
          </ul>

          <h3>9.3 Termination by Platform</h3>
          <p>We may suspend or terminate your account for:</p>
          <ul>
            <li>Violation of this Agreement or Terms of Service</li>
            <li>Fraudulent or illegal activity</li>
            <li>Excessive customer complaints or poor ratings</li>
            <li>Failure to maintain required licenses or insurance</li>
            <li>Excessive booking cancellations</li>
            <li>Non-payment of platform fees</li>
          </ul>

          <h3>9.4 Effect of Termination</h3>
          <ul>
            <li>Your listings will be removed from the platform</li>
            <li>Access to vendor dashboard will be disabled</li>
            <li>Confirmed bookings must still be honored</li>
            <li>Final payouts will be processed after confirmation of service completion</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileCheck size={24} />
            <h2>10. Modifications to Agreement</h2>
          </div>
          <p>
            We may modify this Agreement with 30 days' notice. Significant changes will be communicated via email. Continued use of the platform after changes become effective constitutes acceptance of the modified Agreement.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Briefcase size={24} />
            <h2>11. Support and Resources</h2>
          </div>
          <p>As a Caicos Compass vendor, you have access to:</p>
          <ul>
            <li>Vendor dashboard for managing listings and bookings</li>
            <li>Analytics and performance reports</li>
            <li>Marketing tools and promotional opportunities</li>
            <li>Dedicated business support team</li>
            <li>Educational resources and best practices guides</li>
          </ul>

          <div className={styles.contactBox}>
            <p><strong>Vendor Support</strong></p>
            <p>Email: business@caicoscompass.com</p>
            <p>Phone: +1 (649) 123-4567</p>
            <p>Hours: Monday-Friday, 9 AM - 6 PM EST</p>
          </div>
        </div>

        <div className={styles.acknowledgment}>
          <AlertTriangle size={20} />
          <p>
            By creating a vendor account on Caicos Compass, you acknowledge that you have read, understood, and agree to be bound by this Vendor Partnership Agreement.
          </p>
        </div>
      </div>
    </div>
  );
}