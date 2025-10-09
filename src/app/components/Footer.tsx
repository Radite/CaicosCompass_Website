"use client";

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer: React.FC = () => {
  return (
    <footer className="footer-container" style={{ backgroundColor: '#0275d8', color: '#fff', padding: '3rem 0' }}>
      <div className="container">
        <div className="row">
          {/* Company Info */}
          <div className="col-md-3 col-lg-2 mb-4">
            <h5>Caicos Compass</h5>
            <p>Your trusted guide to the Turks and Caicos Islands</p>
          </div>

          {/* Company Links */}
          <div className="col-md-3 col-lg-2 mb-4">
            <h5>Company</h5>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><Link href="/about" style={{ color: '#fff', textDecoration: 'none' }}>About Us</Link></li>
              <li><Link href="/how-it-works" style={{ color: '#fff', textDecoration: 'none' }}>How It Works</Link></li>
              <li><Link href="/testimonials" style={{ color: '#fff', textDecoration: 'none' }}>Success Stories</Link></li>
              <li><Link href="/press" style={{ color: '#fff', textDecoration: 'none' }}>Press & Media</Link></li>
            </ul>
          </div>

          {/* Support & Help */}
          <div className="col-md-3 col-lg-2 mb-4">
            <h5>Support & Help</h5>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><Link href="/support" style={{ color: '#fff', textDecoration: 'none' }}>Contact Support</Link></li>
              <li><Link href="/faq" style={{ color: '#fff', textDecoration: 'none' }}>FAQs</Link></li>
              <li><Link href="/help" style={{ color: '#fff', textDecoration: 'none' }}>Help Center</Link></li>
              <li><Link href="/contact" style={{ color: '#fff', textDecoration: 'none' }}>Contact Us</Link></li>
            </ul>
          </div>

          {/* For Vendors */}
          <div className="col-md-3 col-lg-3 mb-4">
            <h5>For Businesses</h5>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><Link href="/how-it-works-vendors" style={{ color: '#fff', textDecoration: 'none' }}>Become a Partner</Link></li>
              <li><Link href="/vendor-agreement" style={{ color: '#fff', textDecoration: 'none' }}>Vendor Agreement</Link></li>
              <li><Link href="/vendor-signup" style={{ color: '#fff', textDecoration: 'none' }}>Sign Up</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-md-3 col-lg-3 mb-4">
            <h5>Legal & Policies</h5>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><Link href="/terms-full" style={{ color: '#fff', textDecoration: 'none' }}>Terms of Service</Link></li>
              <li><Link href="/privacy-full" style={{ color: '#fff', textDecoration: 'none' }}>Privacy Policy</Link></li>
              <li><Link href="/cancellation-policy" style={{ color: '#fff', textDecoration: 'none' }}>Cancellation Policy</Link></li>
              <li><Link href="/dispute-resolution" style={{ color: '#fff', textDecoration: 'none' }}>Dispute Resolution</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="row mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-1">&copy; 2025 CaicosCompass. All Rights Reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <a href="https://www.facebook.com/IIAxzd/" target="_blank" rel="noopener noreferrer" 
                 style={{ color: '#fff', fontSize: '1.2rem' }}>
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="https://www.instagram.com/caicoscompass/" target="_blank" rel="noopener noreferrer" 
                 style={{ color: '#fff', fontSize: '1.2rem' }}>
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;