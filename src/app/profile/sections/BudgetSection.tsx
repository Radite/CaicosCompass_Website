// src/app/profile/sections/BudgetSection.tsx
"use client";

import React, { useState } from "react";
import { SectionProps } from "../types";

export const BudgetSection: React.FC<SectionProps> = ({ user, onEdit, styles }) => {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Budget Information</h3>
        <p className={styles.sectionDescription}>
          Set your budget and allocation preferences
        </p>
      </div>

      <div className={styles.profileInfoList}>
        <div className={styles.profileInfoItem}>
          <div className={styles.infoContent}>
            <div className={styles.infoIcon}>
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className={styles.infoDetails}>
              <p className={styles.infoLabel}>Total Budget</p>
              <p className={styles.infoValue}>
                ${user?.budget?.total || "Not set"}
              </p>
            </div>
          </div>
          <button 
            className={styles.editButton}
            onClick={() => onEdit('budget', user?.budget || {})}
          >
            {user?.budget?.total ? 'Edit' : 'Add'}
          </button>
        </div>

        <div className={styles.profileInfoItem}>
          <div className={styles.infoContent}>
            <div className={styles.infoIcon}>
              <i className="fas fa-chart-pie"></i>
            </div>
            <div className={styles.infoDetails}>
              <p className={styles.infoLabel}>Budget Allocation</p>
              <p className={styles.infoValue}>
                {user?.budget?.allocation ? 
                  `Accommodation: ${user.budget.allocation.accommodation || 0}%, Food: ${user.budget.allocation.food || 0}%, Activities: ${user.budget.allocation.activities || 0}%, Transport: ${user.budget.allocation.transportation || 0}%` 
                  : "Not set"}
              </p>
            </div>
          </div>
          <button 
            className={styles.editButton}
            onClick={() => onEdit('budget', user?.budget || {})}
          >
            {user?.budget?.allocation ? 'Edit' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface BudgetFormProps {
  user: any;
  formData: any;
  setFormData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  styles: any;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ 
  user, 
  formData, 
  setFormData, 
  onSave, 
  onCancel, 
  saving, 
  styles 
}) => {
  const [budgetErrors, setBudgetErrors] = useState<any>({});

  const handleAllocationChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    const allocation = formData.allocation || user?.budget?.allocation || {
      accommodation: 0,
      food: 0,
      activities: 0,
      transportation: 0
    };
    
    if (numValue > 100) {
      setBudgetErrors((prev: any) => ({
        ...prev,
        [category]: "Cannot exceed 100%"
      }));
      return;
    }
    
    if (numValue < 0) {
      setBudgetErrors((prev: any) => ({
        ...prev,
        [category]: "Cannot be negative"
      }));
      return;
    }
    
    setBudgetErrors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors[category];
      return newErrors;
    });
    
    const newAllocation = {
      ...allocation,
      [category]: numValue
    };
    
    setFormData({
      ...formData,
      allocation: newAllocation
    });
  };

  const autoDistribute = () => {
    const allocation = formData.allocation || user?.budget?.allocation || {
      accommodation: 0,
      food: 0,
      activities: 0,
      transportation: 0
    };
    
    const categories = ['accommodation', 'food', 'activities', 'transportation'];
    const emptyCategories = categories.filter(cat => !allocation[cat] || allocation[cat] === 0);
    
    if (emptyCategories.length === 0) return;
    
    const totalPercentage = (allocation.accommodation || 0) + 
                           (allocation.food || 0) + 
                           (allocation.activities || 0) + 
                           (allocation.transportation || 0);
    
    const remainingToDistribute = 100 - totalPercentage;
    const perCategory = Math.floor(remainingToDistribute / emptyCategories.length);
    const extra = remainingToDistribute % emptyCategories.length;
    
    const newAllocation = { ...allocation };
    
    emptyCategories.forEach((category, index) => {
      newAllocation[category] = perCategory + (index < extra ? 1 : 0);
    });
    
    setFormData({
      ...formData,
      allocation: newAllocation
    });
  };

  const resetAllocations = () => {
    setFormData({
      ...formData,
      allocation: {
        accommodation: 0,
        food: 0,
        activities: 0,
        transportation: 0
      }
    });
    setBudgetErrors({});
  };

  const suggestBalanced = () => {
    setFormData({
      ...formData,
      allocation: {
        accommodation: 40,
        food: 25,
        activities: 25,
        transportation: 10
      }
    });
    setBudgetErrors({});
  };

  const allocation = formData.allocation || user?.budget?.allocation || {
    accommodation: 0,
    food: 0,
    activities: 0,
    transportation: 0
  };
  
  const totalPercentage = (allocation.accommodation || 0) + 
                         (allocation.food || 0) + 
                         (allocation.activities || 0) + 
                         (allocation.transportation || 0);
  
  const isValidTotal = totalPercentage === 100;
  const remaining = 100 - totalPercentage;

  return (
    <div>
      <div className="mb-4">
        <label className="form-label">
          Total Budget ($) <span style={{color: '#dc3545'}}>*</span>
        </label>
        <input
          type="number"
          className="form-control"
          min="0"
          step="0.01"
          value={formData.total ?? user?.budget?.total ?? ''}
          onChange={(e) => setFormData({...formData, total: parseFloat(e.target.value) || 0})}
          placeholder="Enter your total budget"
        />
        <small className="form-text text-muted">
          Enter your total travel budget in USD
        </small>
      </div>

      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #e9ecef',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h5 style={{ margin: 0, color: '#2d3748' }}>
            Budget Allocation (%)
          </h5>
          
          <div style={{
            background: isValidTotal ? '#d4edda' : totalPercentage > 100 ? '#f8d7da' : '#fff3cd',
            color: isValidTotal ? '#155724' : totalPercentage > 100 ? '#721c24' : '#856404',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: '600',
            fontSize: '0.9rem',
            border: `2px solid ${isValidTotal ? '#c3e6cb' : totalPercentage > 100 ? '#f5c6cb' : '#ffeaa7'}`
          }}>
            {totalPercentage}% / 100%
            {!isValidTotal && totalPercentage < 100 && (
              <span style={{ marginLeft: '8px', fontSize: '0.8rem' }}>
                ({remaining}% remaining)
              </span>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            style={{
              background: '#e3f2fd',
              border: '1px solid #bbdefb',
              color: '#1976d2',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
            onClick={suggestBalanced}
          >
            Suggest Balanced (40/25/25/10)
          </button>
          <button
            type="button"
            style={{
              background: '#f3e5f5',
              border: '1px solid #e1bee7',
              color: '#7b1fa2',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
            onClick={autoDistribute}
            disabled={totalPercentage >= 100}
          >
            Auto-Distribute Remaining
          </button>
          <button
            type="button"
            style={{
              background: '#ffebee',
              border: '1px solid #ffcdd2',
              color: '#c62828',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
            onClick={resetAllocations}
          >
            Reset All
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {['accommodation', 'food', 'activities', 'transportation'].map((category) => (
            <div key={category}>
              <label className="form-label">
                {category === 'accommodation' && '🏨 Accommodation'}
                {category === 'food' && '🍽️ Food & Dining'}
                {category === 'activities' && '🎯 Activities & Tours'}
                {category === 'transportation' && '🚗 Transportation'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  className={`form-control ${budgetErrors[category] ? 'is-invalid' : ''}`}
                  min="0"
                  max="100"
                  step="0.5"
                  value={allocation[category] || ''}
                  onChange={(e) => handleAllocationChange(category, e.target.value)}
                  placeholder="0"
                  style={{ paddingRight: '30px' }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6c757d',
                  fontWeight: '500'
                }}>
                  %
                </span>
              </div>
              {budgetErrors[category] && (
                <small style={{ color: '#dc3545', fontSize: '0.8rem' }}>
                  {budgetErrors[category]}
                </small>
              )}
              {formData.total && allocation[category] && (
                <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                  ${((formData.total * allocation[category]) / 100).toLocaleString()}
                </small>
              )}
            </div>
          ))}
        </div>

        {!isValidTotal && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: totalPercentage > 100 ? '#f8d7da' : '#fff3cd',
            color: totalPercentage > 100 ? '#721c24' : '#856404',
            borderRadius: '8px',
            fontSize: '0.9rem',
            border: `1px solid ${totalPercentage > 100 ? '#f5c6cb' : '#ffeaa7'}`
          }}>
            {totalPercentage > 100 ? (
              <>⚠️ Total exceeds 100% by {totalPercentage - 100}%. Please adjust your allocation.</>
            ) : (
              <>📊 You have {remaining}% remaining to allocate. Use "Auto-Distribute" or adjust manually.</>
            )}
          </div>
        )}

        {isValidTotal && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            fontSize: '0.9rem',
            border: '1px solid #c3e6cb'
          }}>
            ✅ Perfect! Your budget allocation adds up to 100%.
          </div>
        )}
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.btnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button 
          className={styles.btnPrimary} 
          onClick={onSave} 
          disabled={saving || !isValidTotal || Object.keys(budgetErrors).length > 0}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};