"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, ChevronDown, ChevronRight, Eye, Calendar, Tag,
  Filter, RefreshCw, AlertTriangle, HelpCircle, BookOpen,
  MessageCircle, FileText, Settings, Mail, Phone
} from 'lucide-react';
import styles from './faq.module.css';

interface Category {
  _id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  faqCount?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: Category;
  tags: string[];
  priority: number;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FAQResponse {
  success: boolean;
  data: FAQ[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  message?: string;
}

interface CategoryResponse {
  success: boolean;
  data: Category[];
  message?: string;
}

interface FAQStats {
  total: number;
  totalViews: number;
  byStatus: Array<{
    _id: string;
    count: number;
  }>;
}

interface FAQStatsResponse {
  success: boolean;
  data: FAQStats;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FAQStats | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalFAQs, setTotalFAQs] = useState<number>(0);
  const itemsPerPage = 10;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [currentPage, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const fetchInitialData = async (): Promise<void> => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (): Promise<void> => {
    try {
      console.log('🔄 Fetching categories from API...');
      
      const response = await axios.get<CategoryResponse>(`${API_BASE_URL}/api/categories`);
      
      console.log('📥 Categories API Response:', response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
        console.log('✅ Categories set successfully:', response.data.data.length, 'categories');
      } else {
        console.error('❌ Unexpected categories response structure:', response.data);
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchFAQs = async (): Promise<void> => {
    try {
      console.log('🔄 Fetching FAQs from API...');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        status: 'published'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await axios.get<FAQResponse>(`${API_BASE_URL}/api/faqs?${params}`);
      
      console.log('📥 FAQs API Response:', response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setFaqs(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalFAQs(response.data.pagination.total);
        setError(null);
        console.log('✅ FAQs set successfully:', response.data.data.length, 'FAQs');
      } else {
        console.error('❌ Unexpected FAQs response structure:', response.data);
        setError(response.data.message || 'Failed to fetch FAQs');
        setFaqs([]);
      }
    } catch (error) {
      console.error('❌ Error fetching FAQs:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Network error. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
      setFaqs([]);
    }
  };

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await axios.get<FAQStatsResponse>(`${API_BASE_URL}/api/faqs/stats`);
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching FAQ stats:', error);
    }
  };

  const toggleFaqExpansion = async (faqId: string): Promise<void> => {
    setExpandedFaqs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
        // Track view when expanding
        trackFAQView(faqId);
      }
      return newSet;
    });
  };

  const trackFAQView = async (faqId: string): Promise<void> => {
    try {
      await axios.get(`${API_BASE_URL}/api/faqs/${faqId}`);
      // Refresh stats after tracking view
      fetchStats();
    } catch (error) {
      console.error('Error tracking FAQ view:', error);
    }
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c._id === categoryId);
    return category?.name || 'Unknown';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTagClick = (tag: string): void => {
    setSearchTerm(tag);
  };

  const clearFilters = (): void => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('priority');
  };

  const refreshData = async (): Promise<void> => {
    await fetchInitialData();
    await fetchFAQs();
  };

  const renderPagination = (): React.ReactNode => {
    if (totalPages <= 1) return null;

    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={styles.paginationBtn}
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className={styles.paginationBtn}
            >
              1
            </button>
            {startPage > 2 && <span className={styles.ellipsis}>...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`${styles.paginationBtn} ${currentPage === page ? styles.activePage : ''}`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={styles.paginationBtn}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={styles.paginationBtn}
        >
          Next
        </button>
      </div>
    );
  };

  const renderStats = (): React.ReactNode => {
    if (!stats) return null;

    return (
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <HelpCircle />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{stats.total}</h3>
            <p className={styles.statLabel}>Total FAQs</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Eye />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{stats.totalViews}</h3>
            <p className={styles.statLabel}>Total Views</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <BookOpen />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{categories.length}</h3>
            <p className={styles.statLabel}>Categories</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FileText />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>
              {stats.byStatus.find(s => s._id === 'published')?.count || 0}
            </h3>
            <p className={styles.statLabel}>Published</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Frequently Asked Questions</h1>
            <p className={styles.subtitle}>
              Find answers to common questions. Use the search and filters below to quickly locate the information you need.
            </p>
          </div>
          <div className={styles.headerRight}>
            <button onClick={refreshData} className={styles.refreshBtn}>
              <RefreshCw className={styles.refreshIcon} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Stats */}
        {renderStats()}

        {/* Search and Filters */}
        <div className={styles.filtersCard}>
          <div className={styles.filtersHeader}>
            <h2 className={styles.filtersTitle}>Search & Filter</h2>
            {(searchTerm || selectedCategory !== 'all' || sortBy !== 'priority') && (
              <button onClick={clearFilters} className={styles.clearFiltersBtn}>
                Clear Filters
              </button>
            )}
          </div>
          
          <div className={styles.filtersGrid}>
            {/* Search */}
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Category Filter */}
            <div className={styles.selectContainer}>
              <Filter className={styles.selectIcon} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category.name}>
                    {category.name} ({category.faqCount || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className={styles.selectContainer}>
              <Settings className={styles.selectIcon} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.select}
              >
                <option value="priority">By Priority</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Results summary */}
          <div className={styles.resultsSummary}>
            Showing {faqs.length} of {totalFAQs} FAQs
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className={styles.errorCard}>
            <AlertTriangle className={styles.errorIcon} />
            <div className={styles.errorContent}>
              <h3>Error loading FAQs</h3>
              <p>{error}</p>
              <button onClick={refreshData} className={styles.retryBtn}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* FAQ List */}
        {!error && faqs.length === 0 ? (
          <div className={styles.emptyState}>
            <HelpCircle className={styles.emptyIcon} />
            <h3>No FAQs found</h3>
            <p>
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No FAQs are currently available.'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button onClick={clearFilters} className={styles.clearBtn}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <div key={faq._id} className={styles.faqCard}>
                {/* Question Header */}
                <button
                  onClick={() => toggleFaqExpansion(faq._id)}
                  className={styles.faqHeader}
                >
                  <div className={styles.faqHeaderContent}>
                    <div className={styles.faqHeaderMain}>
                      <h3 className={styles.question}>{faq.question}</h3>
                      <div className={styles.faqMeta}>
                        <span
                          className={styles.categoryBadge}
                          style={{
                            backgroundColor: `${faq.category?.color || '#6B7280'}20`,
                            color: faq.category?.color || '#6B7280'
                          }}
                        >
                          {getCategoryName(faq.category?._id)}
                        </span>
                        
                        <span className={styles.metaItem}>
                          <Eye className={styles.metaIcon} />
                          {faq.viewCount} views
                        </span>
                        
                        <span className={styles.metaItem}>
                          <Calendar className={styles.metaIcon} />
                          {formatDate(faq.updatedAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.expandIcon}>
                      {expandedFaqs.has(faq._id) ? (
                        <ChevronDown />
                      ) : (
                        <ChevronRight />
                      )}
                    </div>
                  </div>
                </button>

                {/* Answer Content */}
                {expandedFaqs.has(faq._id) && (
                  <div className={styles.faqContent}>
                    <div className={styles.answer}>
                      {faq.answer.split('\n').map((paragraph, index) => (
                        <p key={index} className={styles.paragraph}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    
                    {/* Tags */}
                    {faq.tags && faq.tags.length > 0 && (
                      <div className={styles.tagsSection}>
                        <div className={styles.tagsHeader}>
                          <Tag className={styles.tagsIcon} />
                          Tags:
                        </div>
                        <div className={styles.tags}>
                          {faq.tags.map((tag, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTagClick(tag);
                              }}
                              className={styles.tag}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Priority indicator */}
                    {faq.priority <= 2 && (
                      <div className={styles.prioritySection}>
                        <span className={`${styles.priorityBadge} ${
                          faq.priority === 1 ? styles.highPriority : styles.mediumPriority
                        }`}>
                          {faq.priority === 1 ? 'High Priority' : 'Medium Priority'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!error && faqs.length > 0 && renderPagination()}

        {/* Categories Overview */}
        {!error && selectedCategory === 'all' && !searchTerm && categories.length > 0 && (
          <div className={styles.categoriesCard}>
            <h2 className={styles.categoriesTitle}>Browse by Category</h2>
            <div className={styles.categoriesGrid}>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={styles.categoryCard}
                >
                  <div className={styles.categoryContent}>
                    <div
                      className={styles.categoryColor}
                      style={{ backgroundColor: category.color }}
                    />
                    <div className={styles.categoryInfo}>
                      <h3 className={styles.categoryName}>{category.name}</h3>
                      <p className={styles.categoryCount}>
                        {category.faqCount || 0} question{(category.faqCount || 0) !== 1 ? 's' : ''}
                      </p>
                      {category.description && (
                        <p className={styles.categoryDescription}>
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className={styles.helpSection}>
          <div className={styles.helpContent}>
            <h2 className={styles.helpTitle}>Didn't find what you were looking for?</h2>
            <p className={styles.helpText}>
              Our support team is here to help you with any questions or concerns.
            </p>
            <div className={styles.helpButtons}>
              <a href="mailto:support@example.com" className={styles.primaryBtn}>
                <Mail className={styles.btnIcon} />
                Contact Support
              </a>
              <a href="/contact" className={styles.secondaryBtn}>
                <MessageCircle className={styles.btnIcon} />
                Submit a Request
              </a>
              <a href="tel:1-800-123-4567" className={styles.tertiaryBtn}>
                <Phone className={styles.btnIcon} />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2024 Your Company. All rights reserved.</p>
          <p>
            Last updated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </footer>
    </div>
  );
}