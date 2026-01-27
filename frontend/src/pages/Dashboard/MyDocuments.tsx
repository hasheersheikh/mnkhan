import React, { useState } from 'react';
import { DocumentUpload, DocumentsList } from '../../components/Documents';

const MyDocuments: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <h2 className="text-3xl font-serif italic mb-8 text-mnkhan-charcoal">My Documents</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div>
          <DocumentUpload 
            onUploadSuccess={handleUploadSuccess}
            onUploadError={(err) => console.error('Upload error:', err)}
          />
        </div>

        {/* Documents List */}
        <div>
          <DocumentsList 
            refreshTrigger={refreshTrigger}
            onDocumentDeleted={() => setRefreshTrigger(prev => prev + 1)}
          />
        </div>
      </div>
    </div>
  );
};

export default MyDocuments;
