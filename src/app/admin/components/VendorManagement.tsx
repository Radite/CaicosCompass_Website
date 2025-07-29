// src/app/admin/components/VendorManagement.tsx
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Eye, Clock, MapPin, Phone, Globe } from 'lucide-react';
import styles from '../admin.module.css';

interface Business {
  _id: string;
  name: string;
  email: string;
  businessProfile: {
    businessName: string;
    businessType: string;
    businessPhone: string;
    businessAddress: {
      street: string;
      city: string;
      island: string;
    };
    businessWebsite?: string;
    businessDescription: string;
    servicesOffered: string[];
    isApproved: boolean;
    approvedAt?: Date;
  };
  createdAt: string;
}

export default function VendorManagement() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved'
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchBusinesses();
  }, [filter]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(`${API_BASE_URL}/api/admin/vendors?approved=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBusinesses(response.data.vendors);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId: string) => {
    try {
      setApproving(vendorId);
      const token = localStorage.getItem('authToken');

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/vendors/${vendorId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
        alert('✅ Business approved successfully! Approval email sent.');
        fetchBusinesses(); // Refresh the list
      }
    } catch (error) {
      console.error('Error approving business:', error);
      alert('❌ Failed to approve business. Please try again.');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (vendorId: string) => {
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (!rejectionReason) return;

    try {
      const token = localStorage.getItem('authToken');

      await axios.put(
        `${API_BASE_URL}/api/admin/vendors/${vendorId}/reject`,
        { rejectionReason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Business application rejected.');
      fetchBusinesses(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting business:', error);
      alert('Failed to reject business. Please try again.');
    }
  };

  const formatBusinessType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatServices = (services: string[]) => {
    return services.map(service => 
      service.charAt(0).toUpperCase() + service.slice(1)
    ).join(', ');
  };

  if (loading) {
    return <div className={styles.loading}>Loading businesses...</div>;
  }

  return (
    <div className={styles.vendorManagement}>
      <div className={styles.header}>
        <h2>Business Applications</h2>
        <div className={styles.filters}>
          <button
            className={filter === 'all' ? styles.activeFilter : ''}
            onClick={() => setFilter('all')}
          >
            All Applications
          </button>
          <button
            className={filter === 'false' ? styles.activeFilter : ''}
            onClick={() => setFilter('false')}
          >
            Pending Approval
          </button>
          <button
            className={filter === 'true' ? styles.activeFilter : ''}
            onClick={() => setFilter('true')}
          >
            Approved
          </button>
        </div>
      </div>

      <div className={styles.businessList}>
        {businesses.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No businesses found for the selected filter.</p>
          </div>
        ) : (
          businesses.map((business) => (
            <div key={business._id} className={styles.businessCard}>
              <div className={styles.businessHeader}>
                <div className={styles.businessInfo}>
                  <h3>{business.businessProfile.businessName}</h3>
                  <p className={styles.ownerName}>Owner: {business.name}</p>
                  <p className={styles.businessType}>
                    {formatBusinessType(business.businessProfile.businessType)}
                  </p>
                </div>
                <div className={styles.businessStatus}>
                  <span className={`${styles.statusBadge} ${
                    business.businessProfile.isApproved ? styles.approved : styles.pending
                  }`}>
                    {business.businessProfile.isApproved ? (
                      <>
                        <CheckCircle size={16} />
                        Approved
                      </>
                    ) : (
                      <>
                        <Clock size={16} />
                        Pending
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className={styles.businessDetails}>
                <div className={styles.contactInfo}>
                  <p><strong>Email:</strong> {business.email}</p>
                  <p><strong>Phone:</strong> {business.businessProfile.businessPhone}</p>
                  <p><strong>Location:</strong> {business.businessProfile.businessAddress.city}, {business.businessProfile.businessAddress.island}</p>
                  {business.businessProfile.businessWebsite && (
                    <p><strong>Website:</strong> 
                      <a href={business.businessProfile.businessWebsite} target="_blank" rel="noopener noreferrer">
                        {business.businessProfile.businessWebsite}
                      </a>
                    </p>
                  )}
                </div>

                <div className={styles.serviceInfo}>
                  <p><strong>Services:</strong> {formatServices(business.businessProfile.servicesOffered)}</p>
                  <p><strong>Description:</strong> {business.businessProfile.businessDescription}</p>
                </div>

                <div className={styles.applicationDate}>
                  <p><strong>Applied:</strong> {new Date(business.createdAt).toLocaleDateString()}</p>
                  {business.businessProfile.approvedAt && (
                    <p><strong>Approved:</strong> {new Date(business.businessProfile.approvedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {!business.businessProfile.isApproved && (
                <div className={styles.actions}>
                  <button
                    className={`${styles.approveBtn} ${approving === business._id ? styles.loading : ''}`}
                    onClick={() => handleApprove(business._id)}
                    disabled={approving === business._id}
                  >
                    {approving === business._id ? (
                      'Approving...'
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Approve & Send Email
                      </>
                    )}
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => handleReject(business._id)}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                  <button
                    className={styles.viewBtn}
                    onClick={() => setSelectedBusiness(business)}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Business Details Modal */}
      {selectedBusiness && (
        <div className={styles.modal} onClick={() => setSelectedBusiness(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{selectedBusiness.businessProfile.businessName}</h3>
              <button onClick={() => setSelectedBusiness(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h4>Business Information</h4>
                <p><strong>Business Name:</strong> {selectedBusiness.businessProfile.businessName}</p>
                <p><strong>Type:</strong> {formatBusinessType(selectedBusiness.businessProfile.businessType)}</p>
                <p><strong>Owner:</strong> {selectedBusiness.name}</p>
                <p><strong>Email:</strong> {selectedBusiness.email}</p>
                <p><strong>Phone:</strong> {selectedBusiness.businessProfile.businessPhone}</p>
                <p><strong>Address:</strong> {selectedBusiness.businessProfile.businessAddress.street}, {selectedBusiness.businessProfile.businessAddress.city}, {selectedBusiness.businessProfile.businessAddress.island}</p>
                {selectedBusiness.businessProfile.businessWebsite && (
                  <p><strong>Website:</strong> <a href={selectedBusiness.businessProfile.businessWebsite} target="_blank">{selectedBusiness.businessProfile.businessWebsite}</a></p>
                )}
                <p><strong>Services:</strong> {formatServices(selectedBusiness.businessProfile.servicesOffered)}</p>
                <p><strong>Description:</strong> {selectedBusiness.businessProfile.businessDescription}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}