// components/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReviewForm = ({ serviceId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    rating: 5,
    subject: '',
    description: '',
    images: []
  });

  const [errors, setErrors] = useState({});

  // Check if user can review this service
  useEffect(() => {
    checkReviewEligibility();
  }, [serviceId]);

  const checkReviewEligibility = async () => {
    try {
      setChecking(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:5000/api/reviews/can-review/${serviceId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.canReview) {
        setCanReview(true);
        setBookingId(response.data.bookingId);
      } else {
        setCanReview(false);
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setMessage('Error checking review eligibility. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rating) {
      newErrors.rating = 'Rating is required';
    } else if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    if (formData.subject && !formData.description) {
      newErrors.description = 'Description is required when title is provided';
    }

    if (formData.subject && formData.subject.length > 100) {
      newErrors.subject = 'Title must be 100 characters or less';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');

      const payload = {
        bookingId,
        rating: formData.rating
      };

      // Only include optional fields if they have values
      if (formData.subject) payload.subject = formData.subject;
      if (formData.description) payload.description = formData.description;
      if (formData.images && formData.images.length > 0) {
        payload.images = formData.images;
      }

      const response = await axios.post(
        'http://localhost:5000/api/reviews',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert('Review submitted successfully!');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to submit review. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // TODO: Implement image upload to your storage service
    // For now, this is a placeholder
    const uploadedImages = [];
    
    for (const file of files) {
      // Upload to your storage service and get URL
      // const url = await uploadImageToStorage(file);
      // uploadedImages.push({ url, caption: '' });
    }
    
    setFormData({
      ...formData,
      images: [...formData.images, ...uploadedImages]
    });
  };

  if (checking) {
    return (
      <div className="review-form">
        <p>Checking review eligibility...</p>
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="review-form">
        <div className="alert alert-warning">
          <p>{message}</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="btn-secondary">
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="review-form">
      <h3>Write Your Review</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Rating - REQUIRED */}
        <div className="form-group">
          <label htmlFor="rating">
            Rating <span className="required">*</span>
          </label>
          <select
            id="rating"
            value={formData.rating}
            onChange={(e) =>
              setFormData({ ...formData, rating: parseInt(e.target.value) })
            }
            className={errors.rating ? 'error' : ''}
            required
          >
            <option value={5}>★★★★★ Excellent</option>
            <option value={4}>★★★★☆ Good</option>
            <option value={3}>★★★☆☆ Average</option>
            <option value={2}>★★☆☆☆ Poor</option>
            <option value={1}>★☆☆☆☆ Terrible</option>
          </select>
          {errors.rating && (
            <span className="error-message">{errors.rating}</span>
          )}
        </div>

        {/* Subject - OPTIONAL */}
        <div className="form-group">
          <label htmlFor="subject">
            Review Title <span className="optional">(Optional)</span>
          </label>
          <input
            id="subject"
            type="text"
            maxLength={100}
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            placeholder="e.g., Amazing island adventure!"
            className={errors.subject ? 'error' : ''}
          />
          <small>
            {formData.subject.length}/100 characters
          </small>
          {errors.subject && (
            <span className="error-message">{errors.subject}</span>
          )}
        </div>

        {/* Description - REQUIRED if subject is provided */}
        <div className="form-group">
          <label htmlFor="description">
            Review Description{' '}
            {formData.subject ? (
              <span className="required">*</span>
            ) : (
              <span className="optional">(Optional)</span>
            )}
          </label>
          <textarea
            id="description"
            rows={5}
            maxLength={1000}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Share your experience with this service..."
            className={errors.description ? 'error' : ''}
            required={!!formData.subject}
          />
          <small>
            {formData.description.length}/1000 characters
          </small>
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>

        {/* Images - OPTIONAL */}
        <div className="form-group">
          <label htmlFor="images">
            Photos <span className="optional">(Optional)</span>
          </label>
          <input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
          />
          <small>You can upload multiple photos</small>
          
          {formData.images.length > 0 && (
            <div className="image-preview">
              {formData.images.map((img, idx) => (
                <div key={idx} className="image-preview-item">
                  <img src={img.url} alt={`Preview ${idx + 1}`} />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = [...formData.images];
                      newImages.splice(idx, 1);
                      setFormData({ ...formData, images: newImages });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        .review-form {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .required {
          color: red;
        }

        .optional {
          color: #666;
          font-weight: normal;
        }

        input[type='text'],
        select,
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        input.error,
        select.error,
        textarea.error {
          border-color: red;
        }

        .error-message {
          color: red;
          font-size: 12px;
          display: block;
          margin-top: 4px;
        }

        small {
          display: block;
          margin-top: 4px;
          color: #666;
          font-size: 12px;
        }

        .image-preview {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .image-preview-item {
          position: relative;
        }

        .image-preview-item img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 4px;
        }

        .image-preview-item button {
          position: absolute;
          top: 4px;
          right: 4px;
          background: red;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 11px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .alert {
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .alert-warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
        }
      `}</style>
    </div>
  );
};

export default ReviewForm;
