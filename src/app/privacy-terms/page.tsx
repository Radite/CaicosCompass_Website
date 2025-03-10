"use client";

import React from "react";
import { FileText, Lock, Globe } from "lucide-react";

export default function PrivacyTermsPage() {
  return (
    <>
      <section className="hero-carousel">
        <div className="hero-overlay"></div>
        <div className="container hero-content text-center animate-fade">
          <h1>
            Privacy <span className="gold-accent">Policy</span> & Terms
          </h1>
          <p>
            Understanding how we protect your information and govern our platform
          </p>
        </div>
      </section>

      <section id="privacy-terms" className="py-5">
        <div className="container">
          <div className="row row-cols-1 row-cols-md-3 g-4">
            <div className="col">
              <div className="card category-card shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="mb-4 d-flex justify-content-center">
                    <Lock className="text-primary" size={48} />
                  </div>
                  <h3 className="card-title mb-3">Privacy Policy</h3>
                  <p className="card-text">
                    How we collect, use, and protect your personal information
                  </p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card category-card shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="mb-4 d-flex justify-content-center">
                    <FileText className="text-primary" size={48} />
                  </div>
                  <h3 className="card-title mb-3">Terms of Service</h3>
                  <p className="card-text">
                    Legal terms governing the use of Caicos Compass
                  </p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card category-card shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="mb-4 d-flex justify-content-center">
                    <Globe className="text-primary" size={48} />
                  </div>
                  <h3 className="card-title mb-3">Liability Notice</h3>
                  <p className="card-text">
                    Platform usage and responsibility guidelines
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-5">
            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-body">
                  <h4 className="card-title text-primary">Privacy Policy Highlights</h4>
                  <ul className="list-unstyled">
                    <li>• Personal information collection and usage</li>
                    <li>• Data protection and encryption</li>
                    <li>• Information sharing practices</li>
                    <li>• User rights and control</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-body">
                  <h4 className="card-title text-primary">Terms of Service Key Points</h4>
                  <ul className="list-unstyled">
                    <li>• Platform usage agreement</li>
                    <li>• Booking and payment terms</li>
                    <li>• User responsibilities</li>
                    <li>• Dispute resolution</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="quick-access py-5">
        <div className="container">
          <div className="row row-cols-1 row-cols-md-2 g-4">
            <div className="col">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="card-title">Full Privacy Policy</h3>
                  <p className="card-text">
                    Read our comprehensive privacy policy document
                  </p>
                  <a href="/privacy-full" className="btn btn-primary">
                    View Full Policy
                  </a>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="card-title">Complete Terms of Service</h3>
                  <p className="card-text">
                    Detailed legal terms and conditions
                  </p>
                  <a href="/terms-full" className="btn btn-primary">
                    View Full Terms
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}