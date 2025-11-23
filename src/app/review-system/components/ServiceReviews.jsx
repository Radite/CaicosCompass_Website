// components/ServiceReviews.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ServiceReviews = ({ serviceId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [filterRating, setFilterRating] = useState(null);
  const [sortBy, setSortBy] = useState('-createdAt'); // newest first

  useEffect(() => {
    fetchReviews();
  }, [serviceId, page, filterRating, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page,
        limit: 10,
        sort: sortBy
      });

      if (filterRating) {
        params.append('rating', filterRating);
      }

      const response = await axios.get(
        `http://localhost:5000/api/reviews/service/${serviceId}?${params}`
      );

      if (response.data.success) {
        setReviews(response.data.data);
        setStats(response.data.stats);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markHelpful = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please log in to mark reviews as helpful');
        return;
      }

      await axios.post(
        `http://localhost:5000/api/reviews/${reviewId}/helpful`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh reviews to show updated helpful count
      fetchReviews();
    } catch (error) {
      console.error('Error marking helpful:', error);
      alert('Failed to mark review as helpful');
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <span className="stars">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '⯨'}
        {'☆'.repeat(emptyStars)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && page === 1) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  if (error) {
    return <div className="reviews-error">{error}</div>;
  }

  return (
    <div className="service-reviews">
      {/* Overall Rating Summary */}
      {stats && stats.totalReviews > 0 && (
        <div className="review-stats">
          <h3>Customer Reviews</h3>
          
          <div className="stats-summary">
            <div className="average-rating">
              <div className="rating-number">{stats.averageRating.toFixed(1)}</div>
              <div className="stars-large">{renderStars(stats.averageRating)}</div>
              <div className="review-count">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.ratingDistribution[star] || 0;
                const percentage =
                  stats.totalReviews > 0
                    ? (count / stats.totalReviews) * 100
                    : 0;

                return (
                  <div key={star} className="rating-bar-row">
                    <button
                      className="star-filter"
                      onClick={() =>
                        setFilterRating(filterRating === star ? null : star)
                      }
                    >
                      {star} ★
                    </button>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="reviews-controls">
        <div className="filters">
          {filterRating && (
            <button
              className="clear-filter"
              onClick={() => setFilterRating(null)}
            >
              Clear filter ({filterRating} ★)
            </button>
          )}
        </div>

        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-rating">Highest Rated</option>
            <option value="rating">Lowest Rated</option>
            <option value="-helpfulCount">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="no-reviews">
          {filterRating
            ? `No ${filterRating}-star reviews yet`
            : 'No reviews yet. Be the first to review!'}
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  {review.user.profilePicture ? (
                    <img
                      src={review.user.profilePicture}
                      alt={review.user.name}
                      className="reviewer-avatar"
                    />
                  ) : (
                    <div className="reviewer-avatar-placeholder">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="reviewer-details">
                    <h4>{review.user.name}</h4>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                    <span className="review-date">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="review-content">
                {review.subject && <h5 className="review-title">{review.subject}</h5>}
                {review.description && <p className="review-text">{review.description}</p>}

                {review.images && review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="review-image-wrapper">
                        <img
                          src={img.url}
                          alt={img.caption || `Review image ${idx + 1}`}
                        />
                        {img.caption && <p className="image-caption">{img.caption}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vendor Response */}
              {review.vendorResponse && review.vendorResponse.text && (
                <div className="vendor-response">
                  <div className="response-header">
                    <strong>Response from Vendor</strong>
                    <span className="response-date">
                      {formatDate(review.vendorResponse.respondedAt)}
                    </span>
                  </div>
                  <p>{review.vendorResponse.text}</p>
                </div>
              )}

              {/* Review Actions */}
              <div className="review-actions">
                <button
                  className="helpful-button"
                  onClick={() => markHelpful(review._id)}
                >
                  👍 Helpful ({review.helpfulCount})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="pagination-button"
          >
            Previous
          </button>

          <span className="page-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        .service-reviews {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        /* Stats Section */
        .review-stats {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .stats-summary {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 40px;
        }

        .average-rating {
          text-align: center;
        }

        .rating-number {
          font-size: 48px;
          font-weight: bold;
          color: #333;
        }

        .stars-large {
          font-size: 24px;
          color: #ffc107;
          margin: 10px 0;
        }

        .review-count {
          color: #666;
          font-size: 14px;
        }

        .rating-distribution {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .rating-bar-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .star-filter {
          min-width: 60px;
          background: none;
          border: 1px solid #ddd;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .star-filter:hover {
          background: #e9ecef;
        }

        .bar-container {
          flex: 1;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: #ffc107;
          transition: width 0.3s ease;
        }

        .count {
          min-width: 30px;
          text-align: right;
          font-size: 14px;
          color: #666;
        }

        /* Controls */
        .reviews-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e9ecef;
        }

        .clear-filter {
          background: #dc3545;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sort-controls label {
          font-size: 14px;
          color: #666;
        }

        .sort-controls select {
          padding: 6px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        /* Reviews List */
        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .review-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .reviewer-info {
          display: flex;
          gap: 12px;
        }

        .reviewer-avatar,
        .reviewer-avatar-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 50%;
        }

        .reviewer-avatar {
          object-fit: cover;
        }

        .reviewer-avatar-placeholder {
          background: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
        }

        .reviewer-details h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
        }

        .review-rating {
          color: #ffc107;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .review-date {
          font-size: 12px;
          color: #666;
        }

        .review-content {
          margin-bottom: 15px;
        }

        .review-title {
          font-size: 18px;
          margin: 0 0 10px 0;
          color: #333;
        }

        .review-text {
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .review-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
          margin-top: 15px;
        }

        .review-image-wrapper img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 4px;
        }

        .image-caption {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .vendor-response {
          background: #f8f9fa;
          border-left: 4px solid #007bff;
          padding: 15px;
          margin-top: 15px;
          border-radius: 4px;
        }

        .response-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .response-header strong {
          color: #007bff;
        }

        .response-date {
          font-size: 12px;
          color: #666;
        }

        .vendor-response p {
          margin: 0;
          color: #666;
          line-height: 1.6;
        }

        .review-actions {
          display: flex;
          gap: 10px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        }

        .helpful-button {
          background: none;
          border: 1px solid #ddd;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .helpful-button:hover {
          background: #f8f9fa;
          border-color: #007bff;
          color: #007bff;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 30px;
        }

        .pagination-button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .pagination-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .pagination-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 14px;
          color: #666;
        }

        /* Empty States */
        .no-reviews,
        .reviews-loading,
        .reviews-error {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 16px;
        }

        .reviews-error {
          color: #dc3545;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-summary {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .reviews-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .sort-controls {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceReviews;
