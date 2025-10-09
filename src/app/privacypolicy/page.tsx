"use client";

import React from "react";
import styles from "./privacy.module.css";
import { Lock, Shield, Eye, Database, Users, Globe } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Lock className={styles.headerIcon} size={48} />
          <h1>Privacy Policy</h1>
          <p>Last updated: January 1, 2025</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>1. Introduction</h2>
          </div>
          <p>
            Welcome to Caicos Compass. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform to book accommodations, activities, and services across the Turks and Caicos Islands.
          </p>
          <p>
            By using Caicos Compass, you consent to the data practices described in this policy. If you do not agree with this policy, please do not use our services.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Database size={24} />
            <h2>2. Information We Collect</h2>
          </div>
          
          <h3>2.1 Information You Provide Directly</h3>
          <p>We collect information you voluntarily provide when using our services:</p>
          
          <h4>Account Information:</h4>
          <ul>
            <li>Name, email address, phone number</li>
            <li>Date of birth (to verify minimum age requirement of 13)</li>
            <li>Password and authentication credentials</li>
            <li>Profile picture (optional)</li>
          </ul>

          <h4>Booking Information:</h4>
          <ul>
            <li>Travel dates and preferences</li>
            <li>Guest information (names, ages, special requirements)</li>
            <li>Payment information (credit card details, billing address)</li>
            <li>Communication with service providers</li>
          </ul>

          <h4>Business/Vendor Information (for service providers):</h4>
          <ul>
            <li>Business name, type, and license number</li>
            <li>Business address and contact information</li>
            <li>Bank account details for payments</li>
            <li>Tax identification numbers</li>
            <li>Service descriptions, pricing, and availability</li>
          </ul>

          <h4>User-Generated Content:</h4>
          <ul>
            <li>Reviews and ratings</li>
            <li>Photos and videos</li>
            <li>Messages and communications</li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <p>When you use our platform, we automatically collect:</p>
          
          <h4>Device and Usage Information:</h4>
          <ul>
            <li>IP address and geographic location</li>
            <li>Device type, operating system, and browser type</li>
            <li>Pages viewed, links clicked, and search queries</li>
            <li>Date, time, and duration of visits</li>
            <li>Referring website or source</li>
          </ul>

          <h4>Cookies and Similar Technologies:</h4>
          <ul>
            <li>Session cookies for authentication and preferences</li>
            <li>Analytics cookies to understand user behavior</li>
            <li>Advertising cookies for personalized marketing</li>
          </ul>

          <h3>2.3 Information from Third Parties</h3>
          <p>We may receive information from:</p>
          <ul>
            <li>Social media platforms (when you use social login)</li>
            <li>Payment processors (transaction confirmations)</li>
            <li>Identity verification services</li>
            <li>Analytics and marketing partners</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Eye size={24} />
            <h2>3. How We Use Your Information</h2>
          </div>
          
          <p>We use collected information for the following purposes:</p>

          <h3>3.1 Service Delivery</h3>
          <ul>
            <li>Processing bookings and payments</li>
            <li>Facilitating communication between users and service providers</li>
            <li>Sending booking confirmations and updates</li>
            <li>Providing customer support</li>
          </ul>

          <h3>3.2 Platform Improvement</h3>
          <ul>
            <li>Analyzing usage patterns and trends</li>
            <li>Personalizing user experience and recommendations</li>
            <li>Testing new features and services</li>
            <li>Improving search functionality and relevance</li>
          </ul>

          <h3>3.3 Communication</h3>
          <ul>
            <li>Sending transactional emails (booking confirmations, receipts)</li>
            <li>Providing customer service and support</li>
            <li>Sending marketing communications (with your consent)</li>
            <li>Notifying you of platform updates and changes</li>
          </ul>

          <h3>3.4 Safety and Security</h3>
          <ul>
            <li>Preventing fraud and unauthorized access</li>
            <li>Investigating and addressing violations of our Terms of Service</li>
            <li>Protecting our legal rights and property</li>
            <li>Complying with legal obligations</li>
          </ul>

          <h3>3.5 Marketing and Advertising</h3>
          <ul>
            <li>Displaying personalized ads and offers</li>
            <li>Measuring advertising effectiveness</li>
            <li>Conducting market research</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Users size={24} />
            <h2>4. How We Share Your Information</h2>
          </div>
          
          <p>We may share your information in the following circumstances:</p>

          <h3>4.1 With Service Providers</h3>
          <p>
            When you make a booking, we share necessary information (name, contact details, booking details) with the service provider to fulfill your reservation.
          </p>

          <h3>4.2 With Service Partners</h3>
          <p>We work with third-party service providers who perform services on our behalf:</p>
          <ul>
            <li>Payment processors (Stripe, PayPal)</li>
            <li>Email service providers (Brevo/Sendinblue)</li>
            <li>Analytics providers (Google Analytics)</li>
            <li>Cloud hosting services</li>
            <li>Customer support tools</li>
          </ul>

          <h3>4.3 For Legal Reasons</h3>
          <p>We may disclose information when required by law or to:</p>
          <ul>
            <li>Comply with legal processes, court orders, or government requests</li>
            <li>Enforce our Terms of Service</li>
            <li>Protect rights, property, or safety of Caicos Compass, users, or the public</li>
            <li>Investigate potential violations or fraud</li>
          </ul>

          <h3>4.4 Business Transfers</h3>
          <p>
            If Caicos Compass is involved in a merger, acquisition, or sale of assets, your information may be transferred. We will notify you before your information becomes subject to a different privacy policy.
          </p>

          <h3>4.5 With Your Consent</h3>
          <p>
            We may share information for other purposes with your explicit consent.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>5. Data Security</h2>
          </div>
          
          <p>We implement industry-standard security measures to protect your data:</p>

          <h3>5.1 Technical Safeguards</h3>
          <ul>
            <li>SSL/TLS encryption for data transmission</li>
            <li>Encrypted storage of sensitive information</li>
            <li>Secure password hashing (bcrypt)</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Firewalls and intrusion detection systems</li>
          </ul>

          <h3>5.2 Administrative Safeguards</h3>
          <ul>
            <li>Access controls limiting who can access your data</li>
            <li>Employee training on data protection</li>
            <li>Confidentiality agreements with staff and partners</li>
            <li>Regular security policy reviews and updates</li>
          </ul>

          <h3>5.3 Physical Safeguards</h3>
          <ul>
            <li>Secure data centers with restricted access</li>
            <li>Environmental controls and monitoring</li>
            <li>Backup and disaster recovery procedures</li>
          </ul>

          <p className={styles.disclaimer}>
            <strong>Important:</strong> While we strive to protect your data, no method of transmission over the internet is 100% secure. You use our services at your own risk.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Lock size={24} />
            <h2>6. Your Privacy Rights</h2>
          </div>
          
          <p>You have the following rights regarding your personal data:</p>

          <h3>6.1 Access and Portability</h3>
          <ul>
            <li>Request a copy of your personal data</li>
            <li>Download your data in a portable format</li>
          </ul>

          <h3>6.2 Correction and Update</h3>
          <ul>
            <li>Update your account information at any time</li>
            <li>Request correction of inaccurate data</li>
          </ul>

          <h3>6.3 Deletion</h3>
          <ul>
            <li>Request deletion of your account and personal data</li>
            <li>Note: Some data may be retained for legal or business purposes</li>
          </ul>

          <h3>6.4 Opt-Out Rights</h3>
          <ul>
            <li>Unsubscribe from marketing emails</li>
            <li>Disable cookies through browser settings</li>
            <li>Opt out of personalized advertising</li>
          </ul>

          <h3>6.5 Data Retention</h3>
          <p>We retain your data for as long as:</p>
          <ul>
            <li>Your account remains active</li>
            <li>Necessary to provide services</li>
            <li>Required by law or for legal defense</li>
            <li>Legitimate business purposes exist</li>
          </ul>

          <p>
            To exercise these rights, contact us at privacy@caicoscompass.com. We will respond within 30 days.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Database size={24} />
            <h2>7. Cookies and Tracking</h2>
          </div>
          
          <p>We use cookies and similar technologies to enhance your experience:</p>

          <h3>7.1 Types of Cookies</h3>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for basic site functionality (login, security)</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            <li><strong>Marketing Cookies:</strong> Deliver personalized ads and measure campaign effectiveness</li>
          </ul>

          <h3>7.2 Managing Cookies</h3>
          <p>
            You can control cookies through your browser settings. Note that disabling certain cookies may affect platform functionality.
          </p>

          <h3>7.3 Third-Party Tracking</h3>
          <p>Third parties may use cookies to collect information about your activity. We do not control these cookies. Review third-party privacy policies for details.</p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Users size={24} />
            <h2>8. Children's Privacy</h2>
          </div>
          <p>
            Caicos Compass is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover we have collected such information, we will delete it immediately.
          </p>
          <p>
            If you believe a child under 13 has provided us with personal information, please contact us at privacy@caicoscompass.com.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Globe size={24} />
            <h2>9. International Data Transfers</h2>
          </div>
          <p>
            Your information may be transferred to and maintained on servers located outside your country of residence. By using Caicos Compass, you consent to the transfer of information to countries that may have different data protection laws than your jurisdiction.
          </p>
          <p>
            We ensure appropriate safeguards are in place to protect your data, including:
          </p>
          <ul>
            <li>Standard contractual clauses</li>
            <li>Data processing agreements with service providers</li>
            <li>Privacy Shield certification (where applicable)</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>10. Changes to This Privacy Policy</h2>
          </div>
          <p>
            We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of material changes via:
          </p>
          <ul>
            <li>Email notification</li>
            <li>In-app notification</li>
            <li>Prominent notice on our website</li>
          </ul>
          <p>
            Continued use of Caicos Compass after changes become effective constitutes acceptance of the updated policy.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Lock size={24} />
            <h2>11. Contact Us</h2>
          </div>
          <p>For questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
          <div className={styles.contactBox}>
            <p><strong>Caicos Compass Privacy Team</strong></p>
            <p>Email: privacy@caicoscompass.com</p>
            <p>Phone: +1 (649) 123-4567</p>
            <p>Address: Providenciales, Turks and Caicos Islands</p>
          </div>
        </div>

        <div className={styles.acknowledgment}>
          <Shield size={20} />
          <p>
            By using Caicos Compass, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
          </p>
        </div>
      </div>
    </div>
  );
}