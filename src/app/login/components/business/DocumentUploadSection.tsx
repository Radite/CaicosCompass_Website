import React, { useState } from "react";
import styles from "@/app/login/login.module.css";
import { DOCUMENT_TYPES } from "../constants/authConstants";
import { convertToBase64, formatFileSize } from "../../utils/fileUtils";

export default function DocumentUploadSection({ documents, setDocuments, showMessage }) {
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");

  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/jpg'];
    
    if (!selectedDocumentType) {
      showMessage(
        'Document Type Required',
        'Please select a document type before uploading.',
        'warning'
      );
      return;
    }
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        showMessage(
          'File Too Large',
          `File ${file.name} is too large. Maximum size is 10MB.`,
          'error'
        );
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        showMessage(
          'Invalid File Format',
          `File ${file.name} has invalid format. Only JPG, PNG, and PDF files are allowed.`,
          'error'
        );
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingDocs(true);
    
    try {
      const uploadedDocs = [];
      
      for (const file of validFiles) {
        // Convert file to base64 for now (in production, use cloud storage)
        const base64 = await convertToBase64(file);
        
        const docData = {
          fileName: file.name,
          fileType: selectedDocumentType,
          fileSize: file.size,
          fileData: base64, // In production, this would be a URL
          uploadedAt: new Date().toISOString(),
          documentLabel: DOCUMENT_TYPES.find(type => type.value === selectedDocumentType)?.label || selectedDocumentType
        };
        
        uploadedDocs.push(docData);
      }
      
      setDocuments(prev => [...prev, ...uploadedDocs]);
      setSelectedDocumentType("");
      e.target.value = "";
    } catch (error) {
      showMessage(
        'Upload Error',
        'Error uploading documents. Please try again.',
        'error'
      );
      console.error('Upload error:', error);
    } finally {
      setUploadingDocs(false);
    }
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className={styles.sectionTitle}>Supporting Documents</div>
      
      <div className={styles.documentUploadSection}>
        <div className={styles.uploadInstructions}>
          <p>Upload supporting documents for your business application (optional but recommended):</p>
          <ul>
            <li>Business License</li>
            <li>Government-issued ID or Passport</li>
            <li>Insurance Certificate</li>
            <li>Professional Certifications</li>
            <li>Tax Registration Documents</li>
            <li>Any other relevant documents</li>
          </ul>
          <p className={styles.uploadLimits}>
            <strong>Accepted formats:</strong> JPG, PNG, PDF | <strong>Max size:</strong> 10MB per file
          </p>
        </div>

        <div className={styles.documentTypeSelector}>
          <label htmlFor="documentType">Document Type *</label>
          <select
            id="documentType"
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}
            className={styles.documentTypeSelect}
          >
            <option value="">Select document type...</option>
            {DOCUMENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fileUploadArea}>
          <input
            type="file"
            id="documentUpload"
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleDocumentUpload}
            className={styles.fileInput}
            disabled={!selectedDocumentType}
          />
          <label 
            htmlFor="documentUpload" 
            className={`${styles.fileUploadLabel} ${!selectedDocumentType ? styles.disabled : ''}`}
          >
            <div className={styles.uploadIcon}>📎</div>
            <div>
              <div className={styles.uploadText}>
                {uploadingDocs ? 'Uploading...' : 
                 !selectedDocumentType ? 'Select document type first' :
                 'Choose Files or Drag & Drop'}
              </div>
              <div className={styles.uploadSubtext}>
                JPG, PNG, PDF up to 10MB each
              </div>
            </div>
          </label>
        </div>

        {documents.length > 0 && (
          <div className={styles.uploadedDocuments}>
            <h4>Uploaded Documents ({documents.length})</h4>
            {documents.map((doc, index) => (
              <div key={index} className={styles.documentItem}>
                <div className={styles.documentInfo}>
                  <div className={styles.documentIcon}>
                    {doc.fileName.toLowerCase().endsWith('.pdf') ? '📄' : '🖼️'}
                  </div>
                  <div className={styles.documentDetails}>
                    <div className={styles.documentName}>{doc.fileName}</div>
                    <div className={styles.documentMeta}>
                      <span className={styles.documentType}>
                        {doc.documentLabel}
                      </span>
                      <span className={styles.documentSize}>
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className={styles.removeDocButton}
                  title="Remove document"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}