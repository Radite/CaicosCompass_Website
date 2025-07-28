// File Path: src/app/admin/components/InfoPagesManager.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Star, Search, 
  BarChart3, Globe, TrendingUp, Save, X, 
  CheckCircle, AlertCircle, FileText
} from 'lucide-react';
import styles from './InfoPagesManager.module.css';

interface InfoPage {
  _id: string;
  title: string;
  description: string;
  slug: string;
  icon: string;
  color: string;
  category: string;
  featured: boolean;
  priority: number;
  views: number;
  lastUpdated: string;
  isActive: boolean;
  tags: string[];
  sections: Section[];
  markers: MapMarker[];
}

interface Section {
  title: string;
  content: ContentItem[];
}

interface ContentItem {
  name: string;
  description: string;
  image?: string;
  additionalInfo?: any;
}

interface MapMarker {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
  type: string;
}

interface Analytics {
  overview: {
    totalPages: number;
    activePages: number;
    featuredPages: number;
    inactivePages: number;
    totalViews: number;
  };
  categoryStats: Array<{ _id: string; count: number }>;
  topViewedPages: Array<{ title: string; views: number; slug: string }>;
  recentlyUpdated: Array<{ title: string; lastUpdated: string; slug: string }>;
}

const InfoPagesManager: React.FC = () => {
  const [pages, setPages] = useState<InfoPage[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPage, setEditingPage] = useState<InfoPage | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'essential-services', label: 'Essential Services' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'dining', label: 'Dining' },
    { value: 'activities', label: 'Activities' },
    { value: 'culture-history', label: 'Culture & History' },
    { value: 'practical-info', label: 'Practical Info' },
    { value: 'safety-health', label: 'Safety & Health' },
    { value: 'weather-climate', label: 'Weather & Climate' },
    { value: 'sustainability', label: 'Sustainability' }
  ];

  useEffect(() => {
    fetchPages();
    fetchAnalytics();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchPages = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/info?limit=100`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setPages(data.data);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      showNotification('error', 'Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/info/admin/analytics`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleToggleActive = async (id: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/info/${id}/toggle-active`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setPages(pages.map(page => 
          page._id === id ? { ...page, isActive: data.data.isActive } : page
        ));
        showNotification('success', data.message);
      }
    } catch (error) {
      console.error('Error toggling page status:', error);
      showNotification('error', 'Failed to update page status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/info/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setPages(pages.filter(page => page._id !== id));
        showNotification('success', 'Page deleted successfully');
        fetchAnalytics(); // Refresh analytics
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      showNotification('error', 'Failed to delete page');
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || page.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading info pages...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
          <button onClick={() => setNotification(null)} className={styles.notificationClose}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Info Pages Manager</h1>
            <p className={styles.subtitle}>Manage travel guides and information pages</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className={styles.createButton}
          >
            <Plus size={20} />
            Create New Page
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className={styles.analytics}>
          <div className={styles.analyticsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div>
                  <p className={styles.statLabel}>Total Pages</p>
                  <p className={styles.statValue}>{analytics.overview.totalPages}</p>
                </div>
                <div className={styles.statIcon}>
                  <Globe size={24} />
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div>
                  <p className={styles.statLabel}>Active Pages</p>
                  <p className={`${styles.statValue} ${styles.success}`}>{analytics.overview.activePages}</p>
                </div>
                <div className={`${styles.statIcon} ${styles.success}`}>
                  <Eye size={24} />
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div>
                  <p className={styles.statLabel}>Featured Pages</p>
                  <p className={`${styles.statValue} ${styles.warning}`}>{analytics.overview.featuredPages}</p>
                </div>
                <div className={`${styles.statIcon} ${styles.warning}`}>
                  <Star size={24} />
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div>
                  <p className={styles.statLabel}>Total Views</p>
                  <p className={`${styles.statValue} ${styles.info}`}>
                    {analytics.overview.totalViews.toLocaleString()}
                  </p>
                </div>
                <div className={`${styles.statIcon} ${styles.info}`}>
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filtersContent}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.categorySelect}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.select}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.resultsCount}>
          {filteredPages.length} {filteredPages.length === 1 ? 'page' : 'pages'} found
        </div>
      </div>

      {/* Pages Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableHeader}>Page</th>
              <th className={styles.tableHeader}>Category</th>
              <th className={styles.tableHeader}>Status</th>
              <th className={styles.tableHeader}>Views</th>
              <th className={styles.tableHeader}>Last Updated</th>
              <th className={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {filteredPages.map((page) => (
              <tr key={page._id} className={styles.tableRow}>
                <td className={styles.tableCell}>
                  <div className={styles.pageInfo}>
                    <div 
                      className={styles.pageIcon}
                      style={{ backgroundColor: page.color }}
                    >
                      📄
                    </div>
                    <div>
                      <div className={styles.pageTitle}>
                        {page.title}
                        {page.featured && <Star className={styles.featuredIcon} size={16} />}
                      </div>
                      <div className={styles.pageDescription}>
                        {page.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.categoryBadge}>
                    {categories.find(c => c.value === page.category)?.label || page.category}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span className={`${styles.statusBadge} ${page.isActive ? styles.active : styles.inactive}`}>
                    {page.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  {page.views.toLocaleString()}
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.dateText}>
                    {formatDate(page.lastUpdated)}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actions}>
                    <button
                      onClick={() => setEditingPage(page)}
                      className={`${styles.actionButton} ${styles.edit}`}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(page._id)}
                      className={`${styles.actionButton} ${page.isActive ? styles.danger : styles.success}`}
                      title={page.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {page.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(page._id)}
                      className={`${styles.actionButton} ${styles.danger}`}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPages.length === 0 && (
          <div className={styles.emptyState}>
            <FileText size={48} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No pages found</h3>
            <p className={styles.emptyDescription}>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Top Viewed Pages */}
      {analytics && analytics.topViewedPages.length > 0 && (
        <div className={styles.topViewed}>
          <h3 className={styles.sectionTitle}>Top Viewed Pages</h3>
          <div className={styles.topViewedList}>
            {analytics.topViewedPages.map((page, index) => (
              <div key={page.slug} className={styles.topViewedItem}>
                <span className={styles.rank}>#{index + 1}</span>
                <span className={styles.topViewedTitle}>{page.title}</span>
                <span className={styles.topViewedViews}>
                  {page.views.toLocaleString()} views
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPagesManager;