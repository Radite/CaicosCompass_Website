"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImages, faUpload, faSearch, faFilter, faTrash, faEdit,
  faDownload, faEye, faPlus, faTimes, faCheck, faSort,
  faFolder, faFolderOpen, faImage, faVideo, faFile,
  faTh, faList, faCalendarAlt, faTag, faTags
} from '@fortawesome/free-solid-svg-icons';
import styles from '../dashboard.module.css';

interface MediaManagerProps {
  vendorData: any;
}

interface MediaFile {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  mimeType: string;
  uploadedAt: string;
  usedIn: Array<{
    listingId: string;
    listingName: string;
    category: string;
  }>;
  tags: string[];
  alt: string;
  description: string;
}

interface MediaFolder {
  _id: string;
  name: string;
  description: string;
  files: MediaFile[];
  createdAt: string;
}

export default function MediaManager({ vendorData }: MediaManagerProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');

  const fileTypes = [
    { value: 'all', label: 'All Files' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'document', label: 'Documents' }
  ];

  const sortOptions = [
    { value: 'uploadedAt', label: 'Upload Date' },
    { value: 'filename', label: 'Name' },
    { value: 'size', label: 'File Size' },
    { value: 'type', label: 'File Type' }
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchMediaFiles();
    fetchFolders();
  }, []);

  useEffect(() => {
    filterAndSortFiles();
  }, [mediaFiles, searchTerm, filterType, sortBy, sortOrder, selectedFolder]);

  const fetchMediaFiles = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/media`,
        { headers: getAuthHeaders() }
      );
      setMediaFiles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching media files:', error);
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/media/folders`,
        { headers: getAuthHeaders() }
      );
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const filterAndSortFiles = () => {
    let filtered = [...mediaFiles];

    // Apply folder filter
    if (selectedFolder) {
      const folder = folders.find(f => f._id === selectedFolder);
      if (folder) {
        filtered = folder.files;
      }
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.alt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(file => file.type === filterType);
    }

    // Apply sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof MediaFile];
      let bValue = b[sortBy as keyof MediaFile];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredFiles(filtered);
  };

  const handleFileUpload = async (files: FileList) => {
    try {
      setUploading(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        if (selectedFolder) {
          formData.append('folderId', selectedFolder);
        }

        return axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/media/upload`,
          formData,
          {
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      });

      await Promise.all(uploadPromises);
      await fetchMediaFiles();
      await fetchFolders();
      setShowUploadModal(false);
      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFiles = async (fileIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${fileIds.length} file(s)?`)) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/media/bulk-delete`,
        {
          headers: getAuthHeaders(),
          data: { fileIds }
        }
      );

      await fetchMediaFiles();
      await fetchFolders();
      setSelectedFiles([]);
      alert('Files deleted successfully!');
    } catch (error) {
      console.error('Error deleting files:', error);
      alert('Error deleting files. Please try again.');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/media/folders`,
        {
          name: newFolderName,
          description: newFolderDescription
        },
        { headers: getAuthHeaders() }
      );

      await fetchFolders();
      setShowCreateFolderModal(false);
      setNewFolderName('');
      setNewFolderDescription('');
      alert('Folder created successfully!');
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Error creating folder. Please try again.');
    }
  };

  const handleEditFile = async () => {
    if (!editingFile) return;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/media/${editingFile._id}`,
        {
          alt: editingFile.alt,
          description: editingFile.description,
          tags: editingFile.tags
        },
        { headers: getAuthHeaders() }
      );

      await fetchMediaFiles();
      setShowEditModal(false);
      setEditingFile(null);
      alert('File updated successfully!');
    } catch (error) {
      console.error('Error updating file:', error);
      alert('Error updating file. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, mimeType: string) => {
    if (type === 'image') return faImage;
    if (type === 'video') return faVideo;
    return faFile;
  };

  const downloadFile = (file: MediaFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName;
    link.click();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading media files...</p>
      </div>
    );
  }

  return (
    <div className={styles.mediaManager}>
      {/* Header */}
      <div className={styles.mediaHeader}>
        <div className={styles.headerInfo}>
          <h2>Media Manager</h2>
          <p>Organize and manage all your media files</p>
        </div>

        <div className={styles.headerActions}>
          <button 
            onClick={() => setShowCreateFolderModal(true)}
            className={styles.createFolderBtn}
          >
            <FontAwesomeIcon icon={faFolder} />
            New Folder
          </button>

          <button 
            onClick={() => setShowUploadModal(true)}
            className={styles.uploadBtn}
          >
            <FontAwesomeIcon icon={faUpload} />
            Upload Files
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.mediaControls}>
        <div className={styles.leftControls}>
          <div className={styles.searchBar}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={styles.filterSelect}
          >
            {fileTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={styles.sortOrderBtn}
          >
            <FontAwesomeIcon icon={faSort} />
            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>

        <div className={styles.rightControls}>
          <div className={styles.viewModeToggle}>
            <button
              className={`${styles.viewModeBtn} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FontAwesomeIcon icon={faTh} />
            </button>
            <button
              className={`${styles.viewModeBtn} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>

          {selectedFiles.length > 0 && (
            <div className={styles.bulkActions}>
              <span>{selectedFiles.length} selected</span>
              <button
                onClick={() => handleDeleteFiles(selectedFiles)}
                className={styles.deleteBtn}
              >
                <FontAwesomeIcon icon={faTrash} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar and Content */}
      <div className={styles.mediaContent}>
        {/* Folders Sidebar */}
        <div className={styles.foldersSidebar}>
          <h4>Folders</h4>
          <div className={styles.foldersList}>
            <button
              className={`${styles.folderItem} ${!selectedFolder ? styles.active : ''}`}
              onClick={() => setSelectedFolder(null)}
            >
              <FontAwesomeIcon icon={faImages} />
              <span>All Files ({mediaFiles.length})</span>
            </button>

            {folders.map(folder => (
              <button
                key={folder._id}
                className={`${styles.folderItem} ${selectedFolder === folder._id ? styles.active : ''}`}
                onClick={() => setSelectedFolder(folder._id)}
              >
                <FontAwesomeIcon icon={selectedFolder === folder._id ? faFolderOpen : faFolder} />
                <span>{folder.name} ({folder.files.length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Files Display */}
        <div className={styles.filesContainer}>
          {viewMode === 'grid' ? (
            <div className={styles.filesGrid}>
              {filteredFiles.map(file => (
                <div
                  key={file._id}
                  className={`${styles.fileCard} ${selectedFiles.includes(file._id) ? styles.selected : ''}`}
                >
                  <div className={styles.filePreview}>
                    {file.type === 'image' ? (
                      <img 
                        src={file.url} 
                        alt={file.alt}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/150x150/0D4C92/FFFFFF?text=IMG';
                        }}
                      />
                    ) : (
                      <div className={styles.fileIcon}>
                        <FontAwesomeIcon icon={getFileIcon(file.type, file.mimeType)} />
                      </div>
                    )}

                    <div className={styles.fileOverlay}>
                      <button
                        onClick={() => {
                          setEditingFile(file);
                          setShowEditModal(true);
                        }}
                        className={styles.overlayBtn}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => downloadFile(file)}
                        className={styles.overlayBtn}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className={styles.overlayBtn}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </div>

                    <div className={styles.fileSelect}>
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles([...selectedFiles, file._id]);
                          } else {
                            setSelectedFiles(selectedFiles.filter(id => id !== file._id));
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.fileInfo}>
                    <h4>{file.filename}</h4>
                    <p>{formatFileSize(file.size)}</p>
                    <div className={styles.fileUsage}>
                      Used in {file.usedIn.length} listing(s)
                    </div>
                    {file.tags.length > 0 && (
                      <div className={styles.fileTags}>
                        {file.tags.slice(0, 2).map(tag => (
                          <span key={tag} className={styles.fileTag}>
                            <FontAwesomeIcon icon={faTag} />
                            {tag}
                          </span>
                        ))}
                        {file.tags.length > 2 && (
                          <span className={styles.moreTagsIndicator}>
                            +{file.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.filesList}>
              <div className={styles.listHeader}>
                <div className={styles.listHeaderCell}>
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === filteredFiles.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(filteredFiles.map(f => f._id));
                      } else {
                        setSelectedFiles([]);
                      }
                    }}
                  />
                </div>
                <div className={styles.listHeaderCell}>Name</div>
                <div className={styles.listHeaderCell}>Type</div>
                <div className={styles.listHeaderCell}>Size</div>
                <div className={styles.listHeaderCell}>Upload Date</div>
                <div className={styles.listHeaderCell}>Used In</div>
                <div className={styles.listHeaderCell}>Actions</div>
              </div>

              {filteredFiles.map(file => (
                <div key={file._id} className={styles.listRow}>
                  <div className={styles.listCell}>
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles([...selectedFiles, file._id]);
                        } else {
                          setSelectedFiles(selectedFiles.filter(id => id !== file._id));
                        }
                      }}
                    />
                  </div>

                  <div className={styles.listCell}>
                    <div className={styles.fileNameCell}>
                      {file.type === 'image' ? (
                        <img 
                          src={file.url} 
                          alt={file.alt} 
                          className={styles.listThumbnail}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/40x40/0D4C92/FFFFFF?text=IMG';
                          }}
                        />
                      ) : (
                        <FontAwesomeIcon icon={getFileIcon(file.type, file.mimeType)} className={styles.listIcon} />
                      )}
                      <div>
                        <h5>{file.filename}</h5>
                        <p>{file.originalName}</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.listCell}>
                    <span className={styles.typeTag}>{file.type}</span>
                  </div>

                  <div className={styles.listCell}>
                    {formatFileSize(file.size)}
                  </div>

                  <div className={styles.listCell}>
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </div>

                  <div className={styles.listCell}>
                    {file.usedIn.length} listing(s)
                  </div>

                  <div className={styles.listCell}>
                    <div className={styles.listActions}>
                      <button
                        onClick={() => {
                          setEditingFile(file);
                          setShowEditModal(true);
                        }}
                        className={styles.listActionBtn}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => downloadFile(file)}
                        className={styles.listActionBtn}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                      <button
                        onClick={() => handleDeleteFiles([file._id])}
                        className={`${styles.listActionBtn} ${styles.danger}`}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredFiles.length === 0 && (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faImages} className={styles.emptyIcon} />
              <h3>No files found</h3>
              <p>Upload your first media files to get started!</p>
              <button 
                onClick={() => setShowUploadModal(true)}
                className={styles.uploadBtn}
              >
                <FontAwesomeIcon icon={faUpload} />
                Upload Files
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Upload Files</h3>
              <button onClick={() => setShowUploadModal(false)} className={styles.closeBtn}>×</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className={styles.fileInput}
                  id="file-upload"
                />
                
                <label htmlFor="file-upload" className={styles.uploadLabel}>
                  <FontAwesomeIcon icon={faUpload} />
                  <span>Click to select files or drag and drop</span>
                  <small>Supports images, videos, and documents (Max 10MB each)</small>
                </label>
              </div>

              {selectedFolder && (
                <div className={styles.uploadDestination}>
                  <p>Files will be uploaded to: <strong>{folders.find(f => f._id === selectedFolder)?.name}</strong></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Create New Folder</h3>
              <button onClick={() => setShowCreateFolderModal(false)} className={styles.closeBtn}>×</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Folder Name *</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter folder name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  className={styles.formTextarea}
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={() => setShowCreateFolderModal(false)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleCreateFolder} className={styles.saveBtn}>
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit File Modal */}
      {showEditModal && editingFile && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit File Details</h3>
              <button onClick={() => setShowEditModal(false)} className={styles.closeBtn}>×</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.filePreviewSection}>
                {editingFile.type === 'image' ? (
                  <img 
                    src={editingFile.url} 
                    alt={editingFile.alt} 
                    className={styles.editPreview}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/200x200/0D4C92/FFFFFF?text=IMG';
                    }}
                  />
                ) : (
                  <div className={styles.editFileIcon}>
                    <FontAwesomeIcon icon={getFileIcon(editingFile.type, editingFile.mimeType)} />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Alt Text</label>
                <input
                  type="text"
                  value={editingFile.alt}
                  onChange={(e) => setEditingFile(prev => prev ? { ...prev, alt: e.target.value } : null)}
                  className={styles.formInput}
                  placeholder="Describe this image for accessibility"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={editingFile.description}
                  onChange={(e) => setEditingFile(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className={styles.formTextarea}
                  rows={3}
                  placeholder="Additional description or notes"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tags</label>
                <input
                  type="text"
                  value={editingFile.tags.join(', ')}
                  onChange={(e) => setEditingFile(prev => prev ? { 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  } : null)}
                  className={styles.formInput}
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className={styles.fileMetadata}>
                <h5>File Information</h5>
                <div className={styles.metadataGrid}>
                  <div className={styles.metadataItem}>
                    <label>Filename:</label>
                    <span>{editingFile.filename}</span>
                  </div>
                  <div className={styles.metadataItem}>
                    <label>Size:</label>
                    <span>{formatFileSize(editingFile.size)}</span>
                  </div>
                  <div className={styles.metadataItem}>
                    <label>Type:</label>
                    <span>{editingFile.mimeType}</span>
                  </div>
                  <div className={styles.metadataItem}>
                    <label>Uploaded:</label>
                    <span>{new Date(editingFile.uploadedAt).toLocaleString()}</span>
                  </div>
                </div>

                {editingFile.usedIn.length > 0 && (
                  <div className={styles.usageInfo}>
                    <h6>Used in listings:</h6>
                    <ul>
                      {editingFile.usedIn.map(usage => (
                        <li key={usage.listingId}>
                          {usage.listingName} ({usage.category})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={() => setShowEditModal(false)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleEditFile} className={styles.saveBtn}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}