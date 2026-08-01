import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as api from '../api/mechanics';
import type { UpdateRequest } from '../types';

export const useUpdateRequests = () => {
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getUpdateRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch update requests', err);
      toast.error('Failed to fetch update requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const approveRequest = async (id: number) => {
    await api.approveUpdateRequest(id);
    await fetchRequests();
  };

  const rejectRequest = async (id: number, remarks?: string) => {
    await api.rejectUpdateRequest(id, remarks);
    await fetchRequests();
  };

  const bulkApprove = async (ids: number[]) => {
    await Promise.all(ids.map(id => api.approveUpdateRequest(id)));
    await fetchRequests();
  };

  const bulkReject = async (ids: number[], remarks?: string) => {
    await Promise.all(ids.map(id => api.rejectUpdateRequest(id, remarks)));
    await fetchRequests();
  };

  const deleteRequest = async (id: number) => {
    await api.deleteUpdateRequest(id);
    await fetchRequests();
  };

  return {
    requests,
    loading,
    refetch: fetchRequests,
    approveRequest,
    rejectRequest,
    bulkApprove,
    bulkReject,
    deleteRequest
  };
};
