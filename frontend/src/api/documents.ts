import client from './client';

export interface Document {
  _id: string;
  userId: string;
  appointmentId?: string;
  serviceId?: string;
  taskId?: string;
  fileName: string;
  originalName: string;
  fileType: 'pdf' | 'jpg' | 'jpeg' | 'png';
  mimeType: string;
  fileSize: number;
  storagePath: string;
  publicUrl: string;
  category: 'id_proof' | 'address_proof' | 'service_document' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface UploadDocumentParams {
  file: File;
  appointmentId?: string;
  serviceId?: string;
  taskId?: string;
  category?: Document['category'];
}

// Upload a document
export const uploadDocument = async (params: UploadDocumentParams) => {
  const formData = new FormData();
  formData.append('file', params.file);
  if (params.appointmentId) formData.append('appointmentId', params.appointmentId);
  if (params.serviceId) formData.append('serviceId', params.serviceId);
  if (params.taskId) formData.append('taskId', params.taskId);
  if (params.category) formData.append('category', params.category);

  const response = await client.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get current user's documents
export const getMyDocuments = async (params?: {
  appointmentId?: string;
  serviceId?: string;
  taskId?: string;
  category?: string;
  status?: string;
}) => {
  const response = await client.get('/documents', { params });
  return response.data;
};

// Get single document by ID
export const getDocument = async (id: string) => {
  const response = await client.get(`/documents/${id}`);
  return response.data;
};

// Delete a document
export const deleteDocument = async (id: string) => {
  const response = await client.delete(`/documents/${id}`);
  return response.data;
};

// Admin: Get all documents
export const getAllDocuments = async (params?: {
  userId?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await client.get('/documents/admin/all', { params });
  return response.data;
};

// Admin: Update document status
export const updateDocumentStatus = async (id: string, status: Document['status']) => {
  const response = await client.patch(`/documents/${id}/status`, { status });
  return response.data;
};

// Helper to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Helper to get file icon based on type
export const getFileIcon = (fileType: string): string => {
  switch (fileType) {
    case 'pdf':
      return '📄';
    case 'jpg':
    case 'jpeg':
    case 'png':
      return '🖼️';
    default:
      return '📎';
  }
};
