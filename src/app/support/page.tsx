"use client";

import React, { useState } from 'react';
import axios from 'axios';
import styles from './support.module.css';
import { 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Send,
  User,
  Tag,
  FileText,
  Loader2
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FormData {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  category?: string;
  subject?: string;
  message?: string;
}

const CATEGORIES = [
  { value: 'general_inquiry', label: 'General Inquiry', icon: '💬' },
  { value: 'booking_issue', label: 'Booking Issue', icon: '📅' },
  { value: 'payment_problem', label: 'Payment Problem', icon: '💳' },
  { value: 'technical_support', label: 'Technical Support', icon: '🔧' },
  { value: 'account_access', label: 'Account Access', icon: '🔐' },
  { value: 'feature_request', label: 'Feature Request', icon: '✨' },
  { value: 'bug_report', label: 'Bug Report', icon: '🐛' },
  { value: 'partnership_inquiry', label: 'Partnership Inquiry', icon: '🤝' },
  { value: 'vendor_support', label: 'Vendor Support', icon: '🏢' },
  { value: 'refund_request', label: 'Refund Request', icon: '💰' },
  { value: 'complaint', label: 'Complaint', icon: '⚠️' },
  { value: 'other', label: 'Other', icon: '📝' }
];

export default function SupportPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    ticketNumber?: string;
  }>({ type: null, message: '' });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/tickets`, formData);

      if (response.data.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Your support ticket has been submitted successfully! We\'ll get back to you soon.',
          ticketNumber: response.data.data.ticketNumber
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          category: '',
          subject: '',
          message: ''
        });

        // Scroll to success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      
      let errorMessage = 'Failed to submit your ticket. Please try again.';
      
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <MessageSquare size={40} />
          </div>
          <h1 className={styles.title}>Contact Support</h1>
          <p className={styles.subtitle}>
            Need help? Submit a support ticket and our team will assist you as soon as possible.
          </p>
        </div>

        {/* Success/Error Message */}
        {submitStatus.type && (
          <div className={`${styles.alert} ${styles[submitStatus.type]}`}>
            <div className={styles.alertIcon}>
              {submitStatus.type === 'success' ? (
                <CheckCircle size={24} />
              ) : (
                <AlertCircle size={24} />
              )}
            </div>
            <div className={styles.alertContent}>
              <p className={styles.alertMessage}>{submitStatus.message}</p>
              {submitStatus.ticketNumber && (
                <p className={styles.ticketNumber}>
                  Ticket Number: <strong>{submitStatus.ticketNumber}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Support Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Name Field */}
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                <User size={18} />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
              {errors.name && (
                <span className={styles.errorText}>{errors.name}</span>
              )}
            </div>

            {/* Email Field */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                <Mail size={18} />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="your.email@example.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>
          </div>

          {/* Category Field */}
          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              <Tag size={18} />
              <span>Category *</span>
            </label>
            <div className={styles.selectWrapper}>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`${styles.select} ${errors.category ? styles.inputError : ''}`}
                disabled={isSubmitting}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && (
              <span className={styles.errorText}>{errors.category}</span>
            )}
          </div>

          {/* Subject Field */}
          <div className={styles.formGroup}>
            <label htmlFor="subject" className={styles.label}>
              <FileText size={18} />
              <span>Subject *</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`${styles.input} ${errors.subject ? styles.inputError : ''}`}
              placeholder="Brief description of your issue"
              disabled={isSubmitting}
            />
            {errors.subject && (
              <span className={styles.errorText}>{errors.subject}</span>
            )}
          </div>

          {/* Message Field */}
          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>
              <MessageSquare size={18} />
              <span>Message *</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
              placeholder="Please describe your issue in detail..."
              rows={8}
              disabled={isSubmitting}
            />
            <div className={styles.charCount}>
              {formData.message.length} / 5000 characters
            </div>
            {errors.message && (
              <span className={styles.errorText}>{errors.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Submit Ticket</span>
              </>
            )}
          </button>
        </form>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <h3 className={styles.infoTitle}>What to expect:</h3>
          <ul className={styles.infoList}>
            <li>
              <CheckCircle size={18} className={styles.infoIcon} />
              <span>You'll receive a confirmation email with your ticket number</span>
            </li>
            <li>
              <CheckCircle size={18} className={styles.infoIcon} />
              <span>Our team typically responds within 24-48 hours</span>
            </li>
            <li>
              <CheckCircle size={18} className={styles.infoIcon} />
              <span>You'll be notified via email when your ticket is updated</span>
            </li>
            <li>
              <CheckCircle size={18} className={styles.infoIcon} />
              <span>For urgent issues, please call us at +1-649-XXX-XXXX</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}