import React, { useState, useCallback, useRef } from 'react';
import { uploadDocument, formatFileSize } from '../../api/documents';
import type { UploadDocumentParams, Document } from '../../api/documents';
import './DocumentUpload.css';

interface DocumentUploadProps {
  appointmentId?: string;
  serviceId?: string;
  onUploadSuccess?: (document: Document) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  appointmentId,
  serviceId,
  onUploadSuccess,
  onUploadError,
  maxFiles = 5,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, 'pending' | 'uploading' | 'success' | 'error'>>({});
  const [category, setCategory] = useState<Document['category']>('other');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type: ${file.name}. Only PDF, JPG, JPEG, and PNG are allowed.`;
    }
    if (file.size > MAX_SIZE) {
      return `File too large: ${file.name}. Maximum size is 5 MB.`;
    }
    return null;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [files, maxFiles]);

  const addFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of newFiles) {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
      } else if (files.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed.`);
        break;
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      setError(errors[0]);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      // Initialize progress state for new files
      const newProgress: Record<string, 'pending'> = {};
      validFiles.forEach(f => { newProgress[f.name] = 'pending'; });
      setUploadProgress(prev => ({ ...prev, ...newProgress }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    for (const file of files) {
      setUploadProgress(prev => ({ ...prev, [file.name]: 'uploading' }));

      try {
        const params: UploadDocumentParams = {
          file,
          category,
        };
        if (appointmentId) params.appointmentId = appointmentId;
        if (serviceId) params.serviceId = serviceId;

        const result = await uploadDocument(params);
        setUploadProgress(prev => ({ ...prev, [file.name]: 'success' }));
        onUploadSuccess?.(result.document);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Upload failed';
        setUploadProgress(prev => ({ ...prev, [file.name]: 'error' }));
        onUploadError?.(errorMsg);
        setError(errorMsg);
      }
    }

    setUploading(false);

    // Clear successful uploads
    setTimeout(() => {
      setFiles(prev => prev.filter(f => uploadProgress[f.name] !== 'success'));
      setUploadProgress(prev => {
        const updated: Record<string, 'pending' | 'uploading' | 'success' | 'error'> = {};
        Object.entries(prev).forEach(([name, status]) => {
          if (status !== 'success') updated[name] = status;
        });
        return updated;
      });
    }, 2000);
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return '📄';
    if (file.type.startsWith('image/')) return '🖼️';
    return '📎';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '';
    }
  };

  return (
    <div className="document-upload">
      <div className="upload-header">
        <h3>Upload Documents</h3>
        <p className="upload-subtitle">PDF, JPG, JPEG, PNG • Max 5 MB per file</p>
      </div>

      {/* Category Selector */}
      <div className="category-selector">
        <label>Document Category:</label>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value as Document['category'])}
          disabled={uploading}
        >
          <option value="other">Other</option>
          <option value="id_proof">ID Proof</option>
          <option value="address_proof">Address Proof</option>
          <option value="service_document">Service Document</option>
        </select>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${files.length > 0 ? 'has-files' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={handleFileSelect}
          className="file-input"
        />
        <div className="drop-content">
          <span className="drop-icon">📁</span>
          <p>Drag & drop files here or click to browse</p>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="upload-error">{error}</div>}

      {/* File List */}
      {files.length > 0 && (
        <div className="file-list">
          {files.map((file) => (
            <div key={file.name} className={`file-item ${uploadProgress[file.name]}`}>
              <span className="file-icon">{getFileIcon(file)}</span>
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
              <span className="status-icon">{getStatusIcon(uploadProgress[file.name])}</span>
              {uploadProgress[file.name] === 'pending' && !uploading && (
                <button 
                  className="remove-btn" 
                  onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          className="upload-btn"
          onClick={uploadFiles}
          disabled={uploading || files.every(f => uploadProgress[f.name] === 'success')}
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
};

export default DocumentUpload;
