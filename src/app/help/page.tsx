"use client";

import React, { useState } from "react";
import { HelpCircle, ShieldCheck, CreditCard, MessageCircle } from "lucide-react";

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const faqSections = [
    {
      title: "Getting Started",
      icon: <HelpCircle className="text-primary" size={48} />,
      items: [
        {
          question: "How does Caicos Compass work?",
          answer: "Caicos Compass is a comprehensive travel platform connecting you with local services across Turks and Caicos. Book activities, accommodations, transportation, and dining experiences with ease."
        },
        {
          question: "How do I create an account?",
          answer: "Download the app, click 'Sign Up', enter your email or use social media login, verify your email, and complete your profile."
        }
      ]
    },
    {
      title: "Bookings & Payments",
      icon: <CreditCard className="text-primary" size={48} />,
      items: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept credit/debit cards, PayPal, Apple Pay, and select cryptocurrency wallets."
        },
        {
          question: "Can I cancel or modify my booking?",
          answer: "Cancellation policies vary by service provider. Most bookings can be modified or cancelled up to 24-48 hours before the scheduled service."
        }
      ]
    },
    {
      title: "Safety & Support",
      icon: <ShieldCheck className="text-primary" size={48} />,
      items: [
        {
          question: "Is my personal information secure?",
          answer: "We use industry-standard encryption to protect your data. Personal information is never shared without your consent."
        },
        {
          question: "What if I need help during my trip?",
          answer: "Access in-app emergency contacts, 24/7 customer support, offline island information, and local emergency service numbers."
        }
      ]
    }
  ];

  const toggleSection = (title: string) => {
    setActiveSection(activeSection === title ? null : title);
  };

  return (
    <>
<section className="hero-carousel" style={{ height: '300px' }}>
  <div className="hero-overlay"></div>
  <div className="container hero-content text-center animate-fade">
    <h1>
      Help & <span className="gold-accent">Support</span>
    </h1>
    <p>Everything you need to know about using Caicos Compass</p>
  </div>
</section>


      <section id="help-faq" className="py-5">
        <div className="container">
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {faqSections.map((section) => (
              <div key={section.title} className="col">
                <div className="card category-card shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="mb-4 d-flex justify-content-center">
                      {section.icon}
                    </div>
                    <h3 className="card-title mb-3">{section.title}</h3>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => toggleSection(section.title)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activeSection && (
            <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex={-1}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{activeSection} Details</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setActiveSection(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {faqSections
                      .find(section => section.title === activeSection)
                      ?.items.map((item, index) => (
                        <div key={index} className="mb-3">
                          <h5 className="text-primary">{item.question}</h5>
                          <p>{item.answer}</p>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="quick-access py-5">
        <div className="container">
          <div className="row row-cols-1 row-cols-md-2 g-4">
            <div className="col">
              <div className="card text-center">
                <div className="card-body">
                  <div className="mb-4 d-flex justify-content-center">
                    <MessageCircle className="text-primary" size={48} />
                  </div>
                  <h3 className="card-title">Contact Support</h3>
                  <p className="card-text">
                    Need personalized assistance? Our support team is ready to help.
                  </p>
                  <div className="mt-3">
                    <p>Email: support@caicoscompass.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card text-center">
                <div className="card-body">
                  <div className="mb-4 d-flex justify-content-center">
                    <ShieldCheck className="text-primary" size={48} />
                  </div>
                  <h3 className="card-title">Liability Notice</h3>
                  <p className="card-text">
                    Caicos Compass is a booking platform. Service providers are responsible for service quality and delivery. Users engage at their own risk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}