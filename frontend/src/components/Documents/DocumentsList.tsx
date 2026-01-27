import React, { useState, useEffect, useCallback } from 'react';
import { getMyDocuments, deleteDocument, formatFileSize, getFileIcon } from '../../api/documents';
import type { Document } from '../../api/documents';
import './DocumentsList.css';

interface DocumentsListProps {
  appointmentId?: string;
  category?: string;
  refreshTrigger?: number;
  onDocumentDeleted?: () => void;
}

const DocumentsList: React.FC<DocumentsListProps> = ({
  appointmentId,
  category,
  refreshTrigger = 0,
  onDocumentDeleted,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (appointmentId) params.appointmentId = appointmentId;
      if (category) params.category = category;

      const result = await getMyDocuments(params);
      setDocuments(result.documents || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [appointmentId, category]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }

    setDeletingId(id);
    setConfirmDelete(null);

    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc._id !== id));
      onDocumentDeleted?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const getStatusBadge = (status: Document['status']) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'status-pending' },
      approved: { label: 'Approved', className: 'status-approved' },
      rejected: { label: 'Rejected', className: 'status-rejected' },
    };
    return badges[status] || badges.pending;
  };

  const getCategoryLabel = (cat: Document['category']) => {
    const labels: Record<string, string> = {
      id_proof: 'ID Proof',
      address_proof: 'Address Proof',
      service_document: 'Service Document',
      other: 'Other',
    };
    return labels[cat] || 'Other';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="documents-list">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documents-list">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchDocuments} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="documents-list">
        <div className="empty-state">
          <span className="empty-icon">📂</span>
          <p>No documents uploaded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-list">
      <div className="documents-header">
        <h3>Your Documents</h3>
        <span className="document-count">{documents.length} file{documents.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="documents-grid">
        {documents.map((doc) => {
          const badge = getStatusBadge(doc.status);
          const isDeleting = deletingId === doc._id;
          const showConfirm = confirmDelete === doc._id;

          return (
            <div key={doc._id} className={`document-card ${isDeleting ? 'deleting' : ''}`}>
              <div className="card-header">
                <span className="doc-icon">{getFileIcon(doc.fileType)}</span>
                <span className={`status-badge ${badge.className}`}>{badge.label}</span>
              </div>

              <div className="card-body">
                <h4 className="doc-name" title={doc.originalName}>{doc.originalName}</h4>
                <div className="doc-meta">
                  <span className="meta-item">{formatFileSize(doc.fileSize)}</span>
                  <span className="meta-divider">•</span>
                  <span className="meta-item">{doc.fileType.toUpperCase()}</span>
                </div>
                <div className="doc-category">{getCategoryLabel(doc.category)}</div>
                <div className="doc-date">Uploaded {formatDate(doc.createdAt)}</div>
              </div>

              <div className="card-actions">
                <a
                  href={doc.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn view-btn"
                >
                  View
                </a>

                {showConfirm ? (
                  <div className="confirm-delete">
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="action-btn confirm-btn"
                      disabled={isDeleting}
                    >
                      {isDeleting ? '...' : 'Confirm'}
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="action-btn cancel-btn"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="action-btn delete-btn"
                    disabled={isDeleting}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsList;
