"use client";

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer: React.FC = () => {
  return (
    <footer
      className="text-center"
      style={{
        backgroundColor: '#0275d8',
        color: '#fff',
        padding: '2rem 0'
      }}
    >
      <div className="container">
        <p className="mb-1">&copy; 2025 CaicosCompass. All Rights Reserved.</p>
        {/* Privacy Policy and Terms of Service Links in one line */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            width: '100%'
          }}
        >
          <Link href="/privacy-terms" passHref legacyBehavior>
            <a style={{ color: '#fff', textDecoration: 'none' }}>
              Privacy Policy
            </a>
          </Link>
          <span>|</span>
          <Link href="/privacy-terms" passHref legacyBehavior>
            <a style={{ color: '#fff', textDecoration: 'none' }}>
              Terms of Service
            </a>
          </Link>
        </div>
        {/* Social Media Icons on a new line */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <a
            href="https://www.facebook.com/IIAxzd/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#fff', fontSize: '1.2rem' }}
          >
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a
            href="https://www.instagram.com/caicoscompass/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#fff', fontSize: '1.2rem' }}
          >
            <FontAwesomeIcon icon={faInstagram} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
