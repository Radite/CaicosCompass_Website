"use client";

import React from "react";
import styles from "./cancellation.module.css";
import { XCircle, DollarSign, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function CancellationPolicyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <XCircle className={styles.headerIcon} size={48} />
          <h1>Cancellation & Refund Policy</h1>
          <p>Last updated: January 1, 2025</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <AlertTriangle size={24} />
            <h2>Overview</h2>
          </div>
          <p>
            At Caicos Compass, we understand that travel plans can change. This Cancellation and Refund Policy outlines the terms for canceling bookings and obtaining refunds. Please note that specific cancellation policies may vary by service provider and will be clearly displayed before you confirm your booking.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Clock size={24} />
            <h2>Standard Cancellation Policies</h2>
          </div>
          
          <h3>Types of Cancellation Policies</h3>
          <p>Service providers on Caicos Compass may choose from the following standard policies:</p>

          <div className={styles.policyCard}>
            <div className={styles.policyHeader}>
              <CheckCircle size={20} />
              <h4>Flexible Policy</h4>
            </div>
            <ul>
              <li><strong>Full Refund:</strong> Cancel up to 24 hours before the scheduled service time</li>
              <li><strong>50% Refund:</strong> Cancel between 12-24 hours before service time</li>
              <li><strong>No Refund:</strong> Cancel less than 12 hours before service time</li>
            </ul>
            <p className={styles.policyNote}>
              Best for: Day tours, activities, restaurant reservations
            </p>
          </div>

          <div className={styles.policyCard}>
            <div className={styles.policyHeader}>
              <CheckCircle size={20} />
              <h4>Moderate Policy</h4>
            </div>
            <ul>
              <li><strong>Full Refund:</strong> Cancel up to 5 days before arrival/service</li>
              <li><strong>50% Refund:</strong> Cancel between 2-5 days before arrival/service</li>
              <li><strong>No Refund:</strong> Cancel less than 2 days before arrival/service</li>
            </ul>
            <p className={styles.policyNote}>
              Best for: Multi-day tours, spa packages, transportation services
            </p>
          </div>

          <div className={styles.policyCard}>
            <div className={styles.policyHeader}>
              <AlertTriangle size={20} />
              <h4>Strict Policy</h4>
            </div>
            <ul>
              <li><strong>Full Refund:</strong> Cancel up to 14 days before arrival/service</li>
              <li><strong>50% Refund:</strong> Cancel between 7-14 days before arrival/service</li>
              <li><strong>No Refund:</strong> Cancel less than 7 days before arrival/service</li>
            </ul>
            <p className={styles.policyNote}>
              Best for: Accommodations, villa rentals, special event bookings
            </p>
          </div>

          <div className={styles.policyCard}>
            <div className={styles.policyHeader}>
              <XCircle size={20} />
              <h4>Non-Refundable Policy</h4>
            </div>
            <ul>
              <li><strong>No Refund:</strong> No refunds for any cancellations after booking confirmation</li>
              <li>May be modified subject to service provider approval</li>
              <li>Typically offered at discounted rates</li>
            </ul>
            <p className={styles.policyNote}>
              Best for: Special promotional rates, last-minute deals
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <DollarSign size={24} />
            <h2>How to Cancel a Booking</h2>
          </div>
          
          <h3>Step-by-Step Cancellation Process</h3>
          <ol className={styles.stepList}>
            <li>
              <strong>Log in to your Caicos Compass account</strong>
              <p>Access your account using your email and password</p>
            </li>
            <li>
              <strong>Go to "My Bookings" or "Itinerary"</strong>
              <p>Find the booking you wish to cancel</p>
            </li>
            <li>
              <strong>Click "Cancel Booking"</strong>
              <p>Review the cancellation policy and refund amount</p>
            </li>
            <li>
              <strong>Confirm Cancellation</strong>
              <p>Provide a reason (optional) and confirm your cancellation</p>
            </li>
            <li>
              <strong>Receive Confirmation</strong>
              <p>You'll receive an email confirming the cancellation and refund details</p>
            </li>
          </ol>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <DollarSign size={24} />
            <h2>Refund Processing</h2>
          </div>
          
          <h3>Timeline for Refunds</h3>
          <ul>
            <li>Refund approval: Within 24 hours of cancellation</li>
            <li>Processing time: 5-10 business days</li>
            <li>Refunds are issued to the original payment method</li>
            <li>Bank processing times may vary</li>
          </ul>

          <h3>Refund Calculation</h3>
          <p>Refunds are calculated based on:</p>
          <ul>
            <li>The applicable cancellation policy</li>
            <li>Time of cancellation relative to service date</li>
            <li>Total booking amount (including any applicable fees)</li>
            <li>Service fees may be non-refundable depending on timing</li>
          </ul>

          <div className={styles.noteBox}>
            <AlertTriangle size={20} />
            <p>
              <strong>Important:</strong> Service fees charged by Caicos Compass may not be refundable in certain circumstances. The refund amount will be clearly displayed before you confirm your cancellation.
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <AlertTriangle size={24} />
            <h2>Special Circumstances</h2>
          </div>
          
          <h3>Weather-Related Cancellations</h3>
          <ul>
            <li>Severe weather may result in service provider cancellations</li>
            <li>Full refund or rescheduling option provided</li>
            <li>Service providers determine what constitutes unsafe weather conditions</li>
          </ul>

          <h3>Service Provider Cancellations</h3>
          <ul>
            <li>If a service provider cancels, you receive a full refund</li>
            <li>Refunds are processed within 24-48 hours</li>
            <li>You'll be notified immediately via email and in-app notification</li>
            <li>Caicos Compass is not liable for additional costs (e.g., non-refundable flights)</li>
          </ul>

          <h3>No-Show Policy</h3>
          <ul>
            <li>Failure to show up for a confirmed booking is treated as a last-minute cancellation</li>
            <li>No refunds for no-shows unless otherwise stated in the specific policy</li>
            <li>Contact the service provider immediately if you're running late</li>
          </ul>

          <h3>Medical Emergencies</h3>
          <ul>
            <li>Medical emergencies may be eligible for special consideration</li>
            <li>Documentation (doctor's note, hospital records) may be required</li>
            <li>Contact our support team within 48 hours</li>
            <li>Decisions are made on a case-by-case basis</li>
          </ul>

          <h3>Natural Disasters & Force Majeure</h3>
          <ul>
            <li>Hurricanes, earthquakes, or other natural disasters</li>
            <li>Government-mandated travel restrictions</li>
            <li>Full refund or rescheduling typically provided</li>
            <li>Official documentation may be required</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Clock size={24} />
            <h2>Modification vs. Cancellation</h2>
          </div>
          
          <h3>Modifying Your Booking</h3>
          <p>Instead of canceling, you may be able to modify your booking:</p>
          <ul>
            <li><strong>Date Changes:</strong> Subject to availability and provider approval</li>
            <li><strong>Time Changes:</strong> Must be requested at least 24 hours in advance</li>
            <li><strong>Guest Count Changes:</strong> May result in price adjustments</li>
            <li><strong>Service Upgrades:</strong> Pay the difference if available</li>
          </ul>
          
          <h3>How to Request Modifications</h3>
          <ul>
            <li>Contact the service provider through the messaging system</li>
            <li>Or use the "Modify Booking" option in your itinerary</li>
            <li>Modifications subject to provider approval</li>
            <li>Some modifications may incur fees</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <DollarSign size={24} />
            <h2>Service-Specific Policies</h2>
          </div>
          
          <h3>Accommodations (Hotels, Villas, Vacation Rentals)</h3>
          <ul>
            <li>Typically use Moderate or Strict cancellation policies</li>
            <li>Multi-night stays may have different policies for each night</li>
            <li>Peak season bookings may have stricter policies</li>
            <li>Cleaning fees may be non-refundable</li>
          </ul>

          <h3>Activities & Tours</h3>
          <ul>
            <li>Usually Flexible or Moderate policies</li>
            <li>Group bookings may have different cancellation terms</li>
            <li>Private tours may have stricter cancellation policies</li>
          </ul>

          <h3>Restaurants</h3>
          <ul>
            <li>Generally Flexible policy (24 hours notice)</li>
            <li>Large group reservations may require more notice</li>
            <li>Deposits for special events may be non-refundable</li>
          </ul>

          <h3>Transportation Services</h3>
          <ul>
            <li>Flexible to Moderate policies depending on service type</li>
            <li>Airport transfers may require 48 hours notice</li>
            <li>Multi-day rentals may have prorated refunds</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <AlertTriangle size={24} />
            <h2>Important Notes</h2>
          </div>
          
          <ul>
            <li>Always review the specific cancellation policy before booking</li>
            <li>Cancellation policies are displayed during the booking process</li>
            <li>Policies may vary by season, property, or service type</li>
            <li>Some promotional rates may have non-refundable policies</li>
            <li>Service fees may not be refundable in all circumstances</li>
            <li>Refunds are subject to the provider's cancellation policy</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <CheckCircle size={24} />
            <h2>Contact Us</h2>
          </div>
          <p>If you have questions about cancellations or refunds, please contact us:</p>
          <div className={styles.contactBox}>
            <p><strong>Customer Support</strong></p>
            <p>Email: support@caicoscompass.com</p>
            <p>Phone: +1 (649) 123-4567</p>
            <p>Hours: Monday-Sunday, 8 AM - 8 PM EST</p>
          </div>
        </div>

        <div className={styles.acknowledgment}>
          <AlertTriangle size={20} />
          <p>
            By making a booking through Caicos Compass, you acknowledge that you have read and understood the applicable cancellation policy for your specific booking.
          </p>
        </div>
      </div>
    </div>
  );
}