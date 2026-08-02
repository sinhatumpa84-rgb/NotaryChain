import { useState, useCallback } from 'react';
import { documentApi } from '../api/documentApi';
import toast from 'react-hot-toast';

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchDocuments = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await documentApi.getDocuments(params);
      setDocuments(data.documents || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0 });
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = async (formData) => {
    setLoading(true);
    try {
      const { data } = await documentApi.uploadDocument(formData);
      setDocuments(prev => [data.document, ...prev]);
      toast.success('Document uploaded successfully');
      return data.document;
    } catch (err) {
      toast.error('Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id) => {
    try {
      await documentApi.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('Document deleted');
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await documentApi.updateDocumentStatus(id, status);
      setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, status: data.status } : doc));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  return { documents, loading, error, fetchDocuments, uploadDocument, deleteDocument, updateStatus, pagination };
};
