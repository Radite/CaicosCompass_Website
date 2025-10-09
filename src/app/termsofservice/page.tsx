"use client";

import React from "react";
import styles from "./terms.module.css";
import { FileText, Shield, AlertCircle, Scale } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <FileText className={styles.headerIcon} size={48} />
          <h1>Terms of Service</h1>
          <p>Last updated: January 1, 2025</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>1. Acceptance of Terms</h2>
          </div>
          <p>
            Welcome to Caicos Compass. By accessing or using our platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.
          </p>
          <p>
            Caicos Compass provides a marketplace platform connecting travelers with local service providers including accommodations, activities, tours, dining, transportation, and wellness services across the Turks and Caicos Islands.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileText size={24} />
            <h2>2. User Accounts and Registration</h2>
          </div>
          <h3>2.1 Account Creation</h3>
          <p>To access certain features, you must create an account by providing:</p>
          <ul>
            <li>Valid email address</li>
            <li>Accurate personal information (name, contact details)</li>
            <li>Date of birth (must be 13 years or older)</li>
            <li>Secure password</li>
          </ul>
          
          <h3>2.2 Account Security</h3>
          <p>You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access</li>
          </ul>

          <h3>2.3 Account Types</h3>
          <p>We offer three account types:</p>
          <ul>
            <li><strong>User Accounts:</strong> For travelers booking services</li>
            <li><strong>Business Manager Accounts:</strong> For vendors offering services</li>
            <li><strong>Admin Accounts:</strong> For platform administration</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Scale size={24} />
            <h2>3. Booking and Payment Terms</h2>
          </div>
          
          <h3>3.1 Booking Process</h3>
          <p>
            When you make a booking through Caicos Compass, you enter into a direct contractual relationship with the service provider. Caicos Compass acts as a facilitator and is not a party to this contract.
          </p>

          <h3>3.2 Payment Methods</h3>
          <p>We accept the following payment methods:</p>
          <ul>
            <li>Credit and debit cards (Visa, Mastercard, American Express)</li>
            <li>PayPal</li>
            <li>Apple Pay</li>
            <li>Select cryptocurrency wallets</li>
          </ul>

          <h3>3.3 Pricing and Fees</h3>
          <ul>
            <li>All prices are displayed in USD unless otherwise stated</li>
            <li>Prices include applicable taxes unless noted</li>
            <li>Service fees may apply and will be clearly disclosed before booking</li>
            <li>Prices are subject to change but confirmed bookings honor the price at time of booking</li>
          </ul>

          <h3>3.4 Payment Authorization</h3>
          <p>
            By providing payment information, you authorize us to charge the total amount for your booking, including any applicable fees and taxes. Payment may be processed immediately or according to the provider's payment schedule.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <AlertCircle size={24} />
            <h2>4. Cancellation and Refund Policy</h2>
          </div>
          
          <h3>4.1 Cancellation Policies</h3>
          <p>Cancellation policies vary by service provider and are displayed before booking. Common policies include:</p>
          <ul>
            <li><strong>Flexible:</strong> Full refund 1 day (24 hours) prior to arrival/service</li>
            <li><strong>Moderate:</strong> Full refund 5 days prior to arrival/service</li>
            <li><strong>Strict:</strong> Full refund 14 days prior to arrival/service</li>
            <li><strong>Non-refundable:</strong> No refunds after booking confirmation</li>
          </ul>

          <h3>4.2 Standard Activity Cancellation</h3>
          <p>Unless otherwise specified by the service provider:</p>
          <ul>
            <li>Free cancellation up to 48 hours before your experience</li>
            <li>50% refund for cancellations between 24-48 hours before scheduled time</li>
            <li>No refunds for cancellations less than 24 hours before scheduled time</li>
            <li>Rescheduling possible subject to availability (minimum 24 hours notice required)</li>
          </ul>

          <h3>4.3 Refund Processing</h3>
          <p>
            Approved refunds will be processed to the original payment method within 5-10 business days. Processing times may vary depending on your financial institution.
          </p>

          <h3>4.4 Provider Cancellations</h3>
          <p>
            If a service provider cancels your confirmed booking, you will receive a full refund and notification within 24 hours. We are not liable for any additional costs incurred.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Scale size={24} />
            <h2>5. User Responsibilities</h2>
          </div>
          
          <h3>5.1 Accurate Information</h3>
          <p>You agree to provide accurate, current, and complete information during registration and booking processes.</p>

          <h3>5.2 Lawful Use</h3>
          <p>You agree to use Caicos Compass only for lawful purposes and not to:</p>
          <ul>
            <li>Violate any local, state, national, or international law</li>
            <li>Infringe on the rights of others</li>
            <li>Harass, abuse, or harm other users or service providers</li>
            <li>Post false, misleading, or fraudulent content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use automated systems to access the platform (bots, scrapers)</li>
          </ul>

          <h3>5.3 Reviews and Feedback</h3>
          <p>When posting reviews, you agree to:</p>
          <ul>
            <li>Provide honest and accurate feedback based on personal experience</li>
            <li>Avoid profanity, discriminatory language, or personal attacks</li>
            <li>Not post content that violates others' privacy or intellectual property</li>
            <li>Disclose any conflicts of interest or compensation received</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>6. Vendor/Business Manager Terms</h2>
          </div>
          
          <h3>6.1 Vendor Registration</h3>
          <p>Service providers must:</p>
          <ul>
            <li>Provide valid business license and registration documents</li>
            <li>Maintain accurate business information and service descriptions</li>
            <li>Comply with all local laws and regulations</li>
            <li>Hold appropriate insurance coverage</li>
          </ul>

          <h3>6.2 Service Listings</h3>
          <p>Vendors are responsible for:</p>
          <ul>
            <li>Accurate pricing and availability information</li>
            <li>Responding to booking requests within 24 hours</li>
            <li>Honoring confirmed bookings</li>
            <li>Providing services as described</li>
            <li>Maintaining quality standards</li>
          </ul>

          <h3>6.3 Platform Fees</h3>
          <p>
            Caicos Compass charges a service fee on completed bookings. Fee structure and payment terms are detailed in separate vendor agreements.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <AlertCircle size={24} />
            <h2>7. Dispute Resolution</h2>
          </div>
          
          <h3>7.1 Direct Resolution</h3>
          <p>
            We encourage users and service providers to resolve disputes directly. Caicos Compass provides messaging tools to facilitate communication.
          </p>

          <h3>7.2 Mediation</h3>
          <p>
            If direct resolution fails, either party may request Caicos Compass mediation. We will review the case and provide a recommended resolution within 5-7 business days.
          </p>

          <h3>7.3 Arbitration</h3>
          <p>
            Any disputes not resolved through mediation shall be settled by binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in Providenciales, Turks and Caicos Islands.
          </p>

          <h3>7.4 Class Action Waiver</h3>
          <p>
            You agree to resolve disputes on an individual basis and waive any right to participate in class action lawsuits or class-wide arbitration.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>8. Liability and Disclaimers</h2>
          </div>
          
          <h3>8.1 Platform Role</h3>
          <p>
            Caicos Compass is a marketplace platform connecting users with independent service providers. We do not provide, own, or control the services listed on our platform.
          </p>

          <h3>8.2 Limitation of Liability</h3>
          <p>
            To the fullest extent permitted by law, Caicos Compass shall not be liable for:
          </p>
          <ul>
            <li>Quality, safety, or legality of services provided by vendors</li>
            <li>Truth or accuracy of vendor listings or user reviews</li>
            <li>Performance or conduct of users or vendors</li>
            <li>Injuries, losses, or damages arising from use of services</li>
            <li>Indirect, incidental, special, or consequential damages</li>
          </ul>

          <h3>8.3 Service Disclaimer</h3>
          <p>
            The platform is provided "as is" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>

          <h3>8.4 Maximum Liability</h3>
          <p>
            Our total liability for any claims shall not exceed the amount paid by you for the specific service in question.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileText size={24} />
            <h2>9. Intellectual Property</h2>
          </div>
          
          <p>All content on Caicos Compass, including text, graphics, logos, images, and software, is owned by or licensed to us and protected by copyright, trademark, and other intellectual property laws.</p>
          
          <h3>9.1 Limited License</h3>
          <p>We grant you a limited, non-exclusive, non-transferable license to access and use the platform for personal, non-commercial purposes.</p>

          <h3>9.2 User Content</h3>
          <p>
            By posting content (reviews, photos, etc.), you grant us a worldwide, royalty-free license to use, reproduce, and display that content on our platform and marketing materials.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <AlertCircle size={24} />
            <h2>10. Privacy and Data Protection</h2>
          </div>
          <p>
            Your use of Caicos Compass is subject to our Privacy Policy, which describes how we collect, use, and protect your personal information. By using our services, you consent to our data practices as described in the Privacy Policy.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileText size={24} />
            <h2>11. Modifications to Terms</h2>
          </div>
          <p>
            We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the modified terms.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Scale size={24} />
            <h2>12. Governing Law and Jurisdiction</h2>
          </div>
          <p>
            These Terms of Service shall be governed by and construed in accordance with the laws of the Turks and Caicos Islands, without regard to conflict of law principles.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileText size={24} />
            <h2>13. Contact Information</h2>
          </div>
          <p>For questions about these Terms of Service, please contact us:</p>
          <div className={styles.contactBox}>
            <p><strong>Caicos Compass Legal Department</strong></p>
            <p>Email: legal@caicoscompass.com</p>
            <p>Phone: +1 (649) 123-4567</p>
            <p>Address: Providenciales, Turks and Caicos Islands</p>
          </div>
        </div>

        <div className={styles.acknowledgment}>
          <AlertCircle size={20} />
          <p>
            By using Caicos Compass, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}