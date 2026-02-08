import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Trash2, Download, Loader2, Info
} from 'lucide-react';
import * as documentsApi from '../../api/documents';

interface Document {
  _id: string;
  originalName: string;
  category: string;
  publicUrl: string;
  createdAt: string;
}

interface MatterDocumentsProps {
  taskId: string;
  isAdmin: boolean;
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const MatterDocuments: React.FC<MatterDocumentsProps> = ({ taskId, isAdmin }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [taskId]);

  const fetchDocuments = async () => {
    try {
      setFetching(true);
      const res = await documentsApi.getMyDocuments({ taskId });
      if (res.success) setDocuments(res.documents);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Security Restrictions
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Invalid file type. Only PDF and Images (JPG, PNG) are permitted.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setUploadError('File exceeds the 5MB limit. Please optimize the file size before re-uploading.');
      return;
    }

    try {
      setUploading(true);
      const res = await documentsApi.uploadDocument({
        file,
        taskId,
        category: 'service_document'
      });
      if (res.success) {
        fetchDocuments();
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'System error during document transmission.');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Are you certain you wish to purge this document from the official registry?')) return;
    try {
      const res = await documentsApi.deleteDocument(docId);
      if (res.data.success) fetchDocuments();
    } catch (err) {
      console.error('Purge failure:', err);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-mnkhan-gray-border p-8 min-h-[600px] animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-mnkhan-gray-border pb-8">
        <div>
          <h3 className="text-2xl font-serif italic text-mnkhan-charcoal mb-2">Matter Document Registry</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-mnkhan-text-muted">Official Acquisition & Verification Repository</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <label className={`flex items-center gap-3 px-6 py-3 bg-mnkhan-charcoal text-white text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all shadow-lg cursor-pointer hover:bg-mnkhan-orange ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} className="text-mnkhan-orange" />}
            {uploading ? 'Transmitting...' : 'Upload Official Record'}
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
          <div className="flex items-center gap-2 px-2 py-1 bg-mnkhan-gray-light border border-mnkhan-gray-border rounded-sm">
            <Info size={10} className="text-mnkhan-charcoal opacity-40" />
            <span className="text-[8px] font-bold uppercase text-mnkhan-text-muted opacity-60">PDF, JPG, PNG • Max 5MB</span>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 rounded-sm animate-in slide-in-from-top-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {uploadError}
        </div>
      )}

      {fetching ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <Loader2 size={40} className="animate-spin text-mnkhan-orange mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] italic">Indexing Registry...</p>
        </div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {documents.map((doc, idx) => (
            <div 
              key={doc._id} 
              className="group bg-white border border-mnkhan-gray-border rounded-sm p-6 hover:border-mnkhan-orange hover:shadow-xl transition-all duration-500 relative flex flex-col animate-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="bg-mnkhan-gray-light/30 p-3 rounded-sm group-hover:bg-mnkhan-orange/10 transition-colors">
                  <FileText size={24} className="text-mnkhan-charcoal group-hover:text-mnkhan-orange transition-colors" />
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-bold text-mnkhan-text-muted uppercase tracking-widest block mb-1">Indexed on</span>
                  <span className="text-[10px] font-serif italic text-mnkhan-charcoal">{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <h4 className="text-sm font-serif italic text-mnkhan-charcoal mb-2 group-hover:text-mnkhan-orange transition-colors line-clamp-1">{doc.originalName}</h4>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-mnkhan-text-muted mb-8">{doc.category.replace('_', ' ')}</p>

              <div className="mt-auto flex justify-between items-center pt-5 border-t border-mnkhan-gray-border border-dotted">
                <a 
                  href={doc.publicUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-mnkhan-charcoal hover:text-mnkhan-orange transition-colors"
                >
                  <Download size={14} />
                  Retrieve File
                </a>
                
                {isAdmin && (
                  <button 
                    onClick={() => handleDeleteDocument(doc._id)}
                    className="p-2 text-mnkhan-text-muted hover:text-red-500 hover:bg-red-50 rounded-sm transition-all opacity-0 group-hover:opacity-100"
                    title="Purge Record"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              
              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 w-8 h-8 bg-mnkhan-orange/5 group-hover:bg-mnkhan-orange/10 rounded-bl-3xl transition-all" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-mnkhan-gray-light/10 border-2 border-dashed border-mnkhan-gray-border rounded-sm py-40 flex flex-col items-center justify-center group">
          <FileText size={48} className="text-mnkhan-charcoal opacity-10 mb-4 group-hover:opacity-20 transition-opacity" />
          <p className="text-mnkhan-text-muted font-serif italic text-lg mb-2">No official documents registered.</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Awaiting procedural intake</p>
        </div>
      )}
    </div>
  );
};

export default MatterDocuments;
