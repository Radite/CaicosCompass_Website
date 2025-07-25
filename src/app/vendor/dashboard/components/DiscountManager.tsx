"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTags, faPlus, faEdit, faTrash, faCalendar, 
  faPercent, faDollarSign, faUsers, faClock, faToggleOn, faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import styles from '../dashboard.module.css';

interface DiscountManagerProps {
  vendorData: any;
}

interface Discount {
  _id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'early-bird' | 'last-minute' | 'group' | 'extended-stay';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  applicableListings: string[];
  conditions: {
    minAdvanceBooking?: number; // days
    minStayDuration?: number; // nights
    minGroupSize?: number; // people
    dayOfWeek?: string[]; // specific days
    season?: string; // high, low, shoulder
  };
  createdAt: string;
}

interface NewDiscount {
  name: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxDiscount: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  applicableListings: string[];
  conditions: {
    minAdvanceBooking: number;
    minStayDuration: number;
    minGroupSize: number;
    dayOfWeek: string[];
    season: string;
  };
}

export default function DiscountManager({ vendorData }: DiscountManagerProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [listings, setListings] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [loading, setLoading] = useState(true);
  const [newDiscount, setNewDiscount] = useState<NewDiscount>({
    name: '',
    type: 'percentage',
    value: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    validFrom: '',
    validTo: '',
    usageLimit: 0,
    applicableListings: [],
    conditions: {
      minAdvanceBooking: 0,
      minStayDuration: 0,
      minGroupSize: 0,
      dayOfWeek: [],
      season: ''
    }
  });

  const discountTypes = [
    { 
      value: 'percentage', 
      label: 'Percentage Off', 
      icon: faPercent,
      description: 'Reduce price by a percentage'
    },
    { 
      value: 'fixed', 
      label: 'Fixed Amount Off', 
      icon: faDollarSign,
      description: 'Reduce price by a fixed amount'
    },
    { 
      value: 'early-bird', 
      label: 'Early Bird Special', 
      icon: faClock,
      description: 'Discount for advance bookings'
    },
    { 
      value: 'last-minute', 
      label: 'Last Minute Deal', 
      icon: faClock,
      description: 'Discount for last-minute bookings'
    },
    { 
      value: 'group', 
      label: 'Group Discount', 
      icon: faUsers,
      description: 'Discount for group bookings'
    },
    { 
      value: 'extended-stay', 
      label: 'Extended Stay', 
      icon: faCalendar,
      description: 'Discount for longer stays'
    }
  ];

  const seasons = ['high', 'low', 'shoulder'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchDiscounts();
    fetchListings();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/discounts`,
        { headers: getAuthHeaders() }
      );
      setDiscounts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/listings`,
        { headers: getAuthHeaders() }
      );
      setListings(response.data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleCreateDiscount = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/discounts`,
        newDiscount,
        { headers: getAuthHeaders() }
      );
      
      setShowCreateForm(false);
      resetForm();
      fetchDiscounts();
      alert('Discount created successfully!');
    } catch (error) {
      console.error('Error creating discount:', error);
      alert('Error creating discount. Please try again.');
    }
  };

  const handleUpdateDiscount = async () => {
    if (!editingDiscount) return;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/discounts/${editingDiscount._id}`,
        newDiscount,
        { headers: getAuthHeaders() }
      );
      
      setEditingDiscount(null);
      setShowCreateForm(false);
      resetForm();
      fetchDiscounts();
      alert('Discount updated successfully!');
    } catch (error) {
      console.error('Error updating discount:', error);
      alert('Error updating discount. Please try again.');
    }
  };

  const handleDeleteDiscount = async (discountId: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/discounts/${discountId}`,
        { headers: getAuthHeaders() }
      );
      
      fetchDiscounts();
      alert('Discount deleted successfully!');
    } catch (error) {
      console.error('Error deleting discount:', error);
      alert('Error deleting discount. Please try again.');
    }
  };

  const toggleDiscountStatus = async (discountId: string, currentStatus: boolean) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/discounts/${discountId}/toggle`,
        { isActive: !currentStatus },
        { headers: getAuthHeaders() }
      );
      
      fetchDiscounts();
    } catch (error) {
      console.error('Error toggling discount status:', error);
    }
  };

  const resetForm = () => {
    setNewDiscount({
      name: '',
      type: 'percentage',
      value: 0,
      minOrderValue: 0,
      maxDiscount: 0,
      validFrom: '',
      validTo: '',
      usageLimit: 0,
      applicableListings: [],
      conditions: {
        minAdvanceBooking: 0,
        minStayDuration: 0,
        minGroupSize: 0,
        dayOfWeek: [],
        season: ''
      }
    });
  };

  const handleEditDiscount = (discount: Discount) => {
    setEditingDiscount(discount);
    setNewDiscount({
      name: discount.name,
      type: discount.type,
      value: discount.value,
      minOrderValue: discount.minOrderValue || 0,
      maxDiscount: discount.maxDiscount || 0,
      validFrom: discount.validFrom.split('T')[0],
      validTo: discount.validTo.split('T')[0],
      usageLimit: discount.usageLimit || 0,
      applicableListings: discount.applicableListings,
      conditions: {
        minAdvanceBooking: discount.conditions.minAdvanceBooking || 0,
        minStayDuration: discount.conditions.minStayDuration || 0,
        minGroupSize: discount.conditions.minGroupSize || 0,
        dayOfWeek: discount.conditions.dayOfWeek || [],
        season: discount.conditions.season || ''
      }
    });
    setShowCreateForm(true);
  };

  const updateCondition = (field: string, value: any) => {
    setNewDiscount(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [field]: value
      }
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDiscountIcon = (type: string) => {
    return discountTypes.find(dt => dt.value === type)?.icon || faTags;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading discounts...</p>
      </div>
    );
  }

  return (
    <div className={styles.discountManager}>
      {/* Header */}
      <div className={styles.discountHeader}>
        <div className={styles.headerInfo}>
          <h2>Promotions & Discounts</h2>
          <p>Create and manage special offers for your listings</p>
        </div>
        
        <button 
          className={styles.createBtn}
          onClick={() => {
            setShowCreateForm(true);
            setEditingDiscount(null);
            resetForm();
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Create Discount</span>
        </button>
      </div>

      {/* Active Discounts */}
      <div className={styles.discountsList}>
        <h3>Active Discounts ({discounts.filter(d => d.isActive).length})</h3>
        
        {discounts.length === 0 ? (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faTags} className={styles.emptyIcon} />
            <h3>No discounts created yet</h3>
            <p>Create your first discount to attract more customers!</p>
            <button 
              className={styles.createBtn}
              onClick={() => setShowCreateForm(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Create Discount</span>
            </button>
          </div>
        ) : (
          <div className={styles.discountsGrid}>
            {discounts.map((discount) => (
              <div key={discount._id} className={`${styles.discountCard} ${!discount.isActive ? styles.inactive : ''}`}>
                <div className={styles.discountHeader}>
                  <div className={styles.discountIcon}>
                    <FontAwesomeIcon icon={getDiscountIcon(discount.type)} />
                  </div>
                  <div className={styles.discountInfo}>
                    <h4>{discount.name}</h4>
                    <span className={styles.discountType}>
                      {discountTypes.find(dt => dt.value === discount.type)?.label}
                    </span>
                  </div>
                  <div className={styles.discountActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleEditDiscount(discount)}
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => toggleDiscountStatus(discount._id, discount.isActive)}
                      title={discount.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <FontAwesomeIcon icon={discount.isActive ? faToggleOn : faToggleOff} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.danger}`}
                      onClick={() => handleDeleteDiscount(discount._id)}
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>

                <div className={styles.discountDetails}>
                  <div className={styles.discountValue}>
                    {discount.type === 'percentage' ? (
                      <span>{discount.value}% OFF</span>
                    ) : (
                      <span>${discount.value} OFF</span>
                    )}
                  </div>

                  <div className={styles.discountDates}>
                    <FontAwesomeIcon icon={faCalendar} />
                    <span>{formatDate(discount.validFrom)} - {formatDate(discount.validTo)}</span>
                  </div>

                  <div className={styles.discountUsage}>
                    <div className={styles.usageBar}>
                      <div 
                        className={styles.usageProgress}
                        style={{ 
                          width: discount.usageLimit ? 
                            `${(discount.usedCount / discount.usageLimit) * 100}%` : '0%' 
                        }}
                      ></div>
                    </div>
                    <span>
                      {discount.usedCount} / {discount.usageLimit || '∞'} used
                    </span>
                  </div>

                  <div className={styles.applicableListings}>
                    <strong>Applicable to:</strong>
                    <span>
                      {discount.applicableListings.length === 0 
                        ? 'All listings' 
                        : `${discount.applicableListings.length} listing(s)`
                      }
                    </span>
                  </div>

                  <div className={`${styles.discountStatus} ${discount.isActive ? styles.active : styles.inactive}`}>
                    {discount.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Discount Modal */}
      {showCreateForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingDiscount ? 'Edit Discount' : 'Create New Discount'}</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingDiscount(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Discount Name *</label>
                <input
                  type="text"
                  value={newDiscount.name}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Summer Special"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Discount Type *</label>
                <select
                  value={newDiscount.type}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, type: e.target.value }))}
                >
                  {discountTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    {newDiscount.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                  </label>
                  <input
                    type="number"
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, value: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                    max={newDiscount.type === 'percentage' ? "100" : undefined}
                  />
                </div>

                {newDiscount.type === 'percentage' && (
                  <div className={styles.formGroup}>
                    <label>Maximum Discount ($)</label>
                    <input
                      type="number"
                      value={newDiscount.maxDiscount}
                      onChange={(e) => setNewDiscount(prev => ({ ...prev, maxDiscount: Number(e.target.value) }))}
                      placeholder="Optional"
                      min="0"
                    />
                  </div>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Valid From *</label>
                  <input
                    type="date"
                    value={newDiscount.validFrom}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, validFrom: e.target.value }))}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Valid To *</label>
                  <input
                    type="date"
                    value={newDiscount.validTo}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, validTo: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Minimum Order Value ($)</label>
                  <input
                    type="number"
                    value={newDiscount.minOrderValue}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, minOrderValue: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    value={newDiscount.usageLimit}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, usageLimit: Number(e.target.value) }))}
                    placeholder="Unlimited"
                    min="0"
                  />
                </div>
              </div>

              {/* Applicable Listings */}
              <div className={styles.formGroup}>
                <label>Applicable Listings</label>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={newDiscount.applicableListings.length === 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewDiscount(prev => ({ ...prev, applicableListings: [] }));
                        }
                      }}
                    />
                    <span>All listings</span>
                  </label>
                  
                  {listings.map((listing: any) => (
                    <label key={listing._id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={newDiscount.applicableListings.includes(listing._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewDiscount(prev => ({
                              ...prev,
                              applicableListings: [...prev.applicableListings, listing._id]
                            }));
                          } else {
                            setNewDiscount(prev => ({
                              ...prev,
                              applicableListings: prev.applicableListings.filter(id => id !== listing._id)
                            }));
                          }
                        }}
                      />
                      <span>{listing.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Advanced Conditions */}
              <div className={styles.advancedConditions}>
                <h4>Advanced Conditions</h4>
                
                {(newDiscount.type === 'early-bird' || newDiscount.type === 'last-minute') && (
                  <div className={styles.formGroup}>
                    <label>
                      {newDiscount.type === 'early-bird' ? 'Minimum Advance Booking (days)' : 'Maximum Advance Booking (days)'}
                    </label>
                    <input
                      type="number"
                      value={newDiscount.conditions.minAdvanceBooking}
                      onChange={(e) => updateCondition('minAdvanceBooking', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                )}

                {newDiscount.type === 'extended-stay' && (
                  <div className={styles.formGroup}>
                    <label>Minimum Stay Duration (nights)</label>
                    <input
                      type="number"
                      value={newDiscount.conditions.minStayDuration}
                      onChange={(e) => updateCondition('minStayDuration', Number(e.target.value))}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                )}

                {newDiscount.type === 'group' && (
                  <div className={styles.formGroup}>
                    <label>Minimum Group Size</label>
                    <input
                      type="number"
                      value={newDiscount.conditions.minGroupSize}
                      onChange={(e) => updateCondition('minGroupSize', Number(e.target.value))}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label>Applicable Days of Week</label>
                  <div className={styles.checkboxGroup}>
                    {daysOfWeek.map(day => (
                      <label key={day} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={newDiscount.conditions.dayOfWeek.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateCondition('dayOfWeek', [...newDiscount.conditions.dayOfWeek, day]);
                            } else {
                              updateCondition('dayOfWeek', newDiscount.conditions.dayOfWeek.filter(d => d !== day));
                            }
                          }}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Season</label>
                  <select
                    value={newDiscount.conditions.season}
                    onChange={(e) => updateCondition('season', e.target.value)}
                  >
                    <option value="">Any season</option>
                    {seasons.map(season => (
                      <option key={season} value={season}>
                        {season.charAt(0).toUpperCase() + season.slice(1)} season
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingDiscount(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button 
                className={styles.saveBtn}
                onClick={editingDiscount ? handleUpdateDiscount : handleCreateDiscount}
              >
                {editingDiscount ? 'Update Discount' : 'Create Discount'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}