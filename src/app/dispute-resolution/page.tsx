"use client";

import React from "react";
import styles from "./dispute.module.css";
import { Scale, MessageCircle, Shield, CheckCircle, FileText } from "lucide-react";

export default function DisputeResolutionPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Scale className={styles.headerIcon} size={48} />
          <h1>Dispute Resolution Process</h1>
          <p>Fair and efficient resolution for all parties</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>Our Commitment to Fair Resolution</h2>
          </div>
          <p>
            At Caicos Compass, we strive to provide a positive experience for all users and service providers. However, we understand that disputes may occasionally arise. Our dispute resolution process is designed to be fair, transparent, and efficient for all parties involved.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <MessageCircle size={24} />
            <h2>Step 1: Direct Communication</h2>
          </div>
          
          <div className={styles.stepBox}>
            <h3>Resolve Issues Directly</h3>
            <p>We encourage users and service providers to communicate directly to resolve issues:</p>
            <ul>
              <li>Use the in-app messaging system to discuss concerns</li>
              <li>Clearly state the issue and desired resolution</li>
              <li>Be respectful and professional in all communications</li>
              <li>Document all conversations for reference</li>
              <li>Give the other party reasonable time to respond (24-48 hours)</li>
            </ul>
            
            <div className={styles.tipBox}>
              <CheckCircle size={18} />
              <p><strong>Tip:</strong> Most disputes are resolved through direct communication. Many issues stem from misunderstandings that can be clarified through respectful dialogue.</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileText size={24} />
            <h2>Step 2: File a Formal Dispute</h2>
          </div>
          
          <div className={styles.stepBox}>
            <h3>When to File a Dispute</h3>
            <p>File a formal dispute if:</p>
            <ul>
              <li>Direct communication fails to resolve the issue</li>
              <li>The other party is unresponsive for more than 48 hours</li>
              <li>You believe there has been a violation of our Terms of Service</li>
              <li>There are safety or quality concerns</li>
              <li>Financial discrepancies or payment issues occur</li>
            </ul>

            <h3>How to File a Dispute</h3>
            <ol className={styles.procedureList}>
              <li>Log in to your Caicos Compass account</li>
              <li>Navigate to "My Bookings" or "Dashboard"</li>
              <li>Select the relevant booking</li>
              <li>Click "Report an Issue" or "File a Dispute"</li>
              <li>Complete the dispute form with detailed information</li>
            </ol>

            <h3>Required Information</h3>
            <ul>
              <li><strong>Booking ID:</strong> Reference number for the reservation</li>
              <li><strong>Description:</strong> Detailed explanation of the issue</li>
              <li><strong>Evidence:</strong> Photos, screenshots, receipts, or other documentation</li>
              <li><strong>Desired Outcome:</strong> What resolution you're seeking (refund, replacement service, etc.)</li>
              <li><strong>Communication History:</strong> Records of previous attempts to resolve</li>
            </ul>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>Step 3: Platform Mediation</h2>
          </div>
          
          <div className={styles.stepBox}>
            <h3>Review Process</h3>
            <p>Once you file a dispute, our mediation team will:</p>
            <ul>
              <li><strong>Acknowledge Receipt:</strong> Within 24 hours</li>
              <li><strong>Review Documentation:</strong> Examine all evidence and communication history</li>
              <li><strong>Contact Both Parties:</strong> Gather additional information if needed</li>
              <li><strong>Investigate:</strong> May contact the service provider for their account</li>
              <li><strong>Propose Resolution:</strong> Recommend a fair solution based on findings</li>
            </ul>

            <h3>Timeline</h3>
            <ul>
              <li><strong>Simple Disputes:</strong> 3-5 business days</li>
              <li><strong>Complex Disputes:</strong> 7-10 business days</li>
              <li><strong>Urgent Safety Issues:</strong> Prioritized within 24 hours</li>
            </ul>

            <h3>Possible Outcomes</h3>
            <ul>
              <li><strong>Full Refund:</strong> If service was not provided as described</li>
              <li><strong>Partial Refund:</strong> If service was partially deficient</li>
              <li><strong>Service Credit:</strong> Future booking credit on the platform</li>
              <li><strong>Replacement Service:</strong> Alternative provider arranged</li>
              <li><strong>No Action:</strong> If dispute is unfounded or violates terms</li>
            </ul>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Scale size={24} />
            <h2>Step 4: Escalation & Arbitration</h2>
          </div>
          
          <div className={styles.stepBox}>
            <h3>When Mediation Doesn't Resolve the Issue</h3>
            <p>If you're unsatisfied with the mediation outcome, you may:</p>
            <ul>
              <li><strong>Request Review:</strong> Ask for a senior team member to review the case</li>
              <li><strong>Provide Additional Evidence:</strong> Submit new information not previously considered</li>
              <li><strong>Proceed to Arbitration:</strong> For disputes exceeding $1,000</li>
            </ul>

            <h3>Binding Arbitration</h3>
            <p>For unresolved disputes, parties agree to binding arbitration:</p>
            <ul>
              <li>Governed by American Arbitration Association rules</li>
              <li>Takes place in Providenciales, Turks and Caicos Islands</li>
              <li>Decision is final and legally binding</li>
              <li>Each party bears their own costs unless otherwise determined</li>
              <li>Class action lawsuits are waived (as stated in Terms of Service)</li>
            </ul>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileText size={24} />
            <h2>Common Dispute Scenarios</h2>
          </div>
          
          <h3>Service Quality Issues</h3>
          <div className={styles.scenarioBox}>
            <p><strong>Example:</strong> Activity/tour didn't match description</p>
            <p><strong>Resolution:</strong> Partial or full refund based on discrepancy severity</p>
          </div>

          <h3>Accommodation Problems</h3>
          <div className={styles.scenarioBox}>
            <p><strong>Example:</strong> Property not as advertised, cleanliness issues</p>
            <p><strong>Resolution:</strong> Relocation to alternative accommodation or refund</p>
          </div>

          <h3>Cancellations</h3>
          <div className={styles.scenarioBox}>
            <p><strong>Example:</strong> Service provider cancels last minute</p>
            <p><strong>Resolution:</strong> Full refund + possible compensation/credit</p>
          </div>

          <h3>Payment Disputes</h3>
          <div className={styles.scenarioBox}>
            <p><strong>Example:</strong> Charged incorrect amount or duplicate charges</p>
            <p><strong>Resolution:</strong> Refund of overcharged amount</p>
          </div>

          <h3>Safety Concerns</h3>
          <div className={styles.scenarioBox}>
            <p><strong>Example:</strong> Unsafe conditions, harassment, or injury</p>
            <p><strong>Resolution:</strong> Immediate investigation, possible vendor suspension, full refund</p>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={24} />
            <h2>Your Rights & Responsibilities</h2>
          </div>
          
          <h3>Your Rights</h3>
          <ul>
            <li>To file a dispute for legitimate concerns</li>
            <li>To receive fair and impartial mediation</li>
            <li>To provide evidence and tell your side of the story</li>
            <li>To receive timely communication about your dispute</li>
            <li>To appeal mediation decisions</li>
          </ul>

          <h3>Your Responsibilities</h3>
          <ul>
            <li>Provide honest and accurate information</li>
            <li>Submit disputes in good faith (not frivolous claims)</li>
            <li>Respond promptly to requests for information</li>
            <li>Treat all parties with respect throughout the process</li>
            <li>Accept final arbitration decisions</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <MessageCircle size={24} />
            <h2>Contact Our Resolution Team</h2>
          </div>
          <p>For questions about the dispute resolution process:</p>
          <div className={styles.contactBox}>
            <p><strong>Dispute Resolution Department</strong></p>
            <p>Email: disputes@caicoscompass.com</p>
            <p>Phone: +1 (649) 123-4567</p>
            <p>Hours: Monday-Friday, 9 AM - 6 PM EST</p>
            <p>Emergency Line (Safety Issues): Available 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
}