import React, { useState, useEffect, useCallback } from 'react';
import { getAllDocuments, updateDocumentStatus, deleteDocument, formatFileSize, getFileIcon } from '../../api/documents';
import type { Document } from '../../api/documents';

const ManageDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const result = await getAllDocuments(params);
      setDocuments(result.documents || []);
      setPagination(result.pagination || { total: 0, pages: 1 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleStatusChange = async (doc: Document, newStatus: Document['status']) => {
    try {
      await updateDocumentStatus(doc._id, newStatus);
      setDocuments(prev => 
        prev.map(d => d._id === doc._id ? { ...d, status: newStatus } : d)
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(d => d._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const getCategoryLabel = (cat: string) => {
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif italic text-mnkhan-charcoal">Manage Documents</h2>
        <span className="text-sm text-mnkhan-text-muted">{pagination.total} total documents</span>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-sm border border-mnkhan-gray-border flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-mnkhan-text-muted">Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-mnkhan-text-muted">Category:</label>
          <select 
            value={categoryFilter} 
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="id_proof">ID Proof</option>
            <option value="address_proof">Address Proof</option>
            <option value="service_document">Service Document</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button 
          onClick={() => { setStatusFilter(''); setCategoryFilter(''); setPage(1); }}
          className="text-sm text-mnkhan-orange hover:underline"
        >
          Clear Filters
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
          <button onClick={fetchDocuments} className="ml-4 underline">Retry</button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-mnkhan-orange border-t-transparent rounded-full animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-sm border border-mnkhan-gray-border">
          <p className="text-mnkhan-text-muted italic">No documents found.</p>
        </div>
      ) : (
        <>
          {/* Documents Table */}
          <div className="bg-white rounded-sm border border-mnkhan-gray-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-mnkhan-gray-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-mnkhan-charcoal">Document</th>
                  <th className="text-left px-4 py-3 font-medium text-mnkhan-charcoal">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-mnkhan-charcoal">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-mnkhan-charcoal">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-mnkhan-charcoal">Uploaded</th>
                  <th className="text-right px-4 py-3 font-medium text-mnkhan-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getFileIcon(doc.fileType)}</span>
                        <div>
                          <p className="font-medium text-mnkhan-charcoal truncate max-w-[200px]" title={doc.originalName}>
                            {doc.originalName}
                          </p>
                          <p className="text-xs text-mnkhan-text-muted">
                            {doc.fileType.toUpperCase()} • {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-mnkhan-charcoal">{(doc as any).userId?.name || 'Unknown'}</p>
                      <p className="text-xs text-mnkhan-text-muted">{(doc as any).userId?.email || ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded">
                        {getCategoryLabel(doc.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={doc.status}
                        onChange={(e) => handleStatusChange(doc, e.target.value as Document['status'])}
                        className={`px-2 py-1 text-xs font-medium border rounded cursor-pointer ${getStatusColor(doc.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-mnkhan-text-muted text-xs">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={doc.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-mnkhan-text-muted">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageDocuments;
