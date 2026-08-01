import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as api from '../api/mechanics';
import type { Mechanic } from '../types';

export interface VerificationRequestData {
  id: number;
  mechanicId: number;
  shopPhotosLink?: string;
  ownerIdentityLink?: string;
  submittedData: Record<string, string>;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
  createdAt: string;
  Mechanic?: Mechanic;
}

export const useVerificationRequests = () => {
  const [requests, setRequests] = useState<VerificationRequestData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getVerificationRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch verification requests', err);
      toast.error('Failed to fetch verification requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateRequestStatus = async (id: number, status: 'Approved' | 'Rejected', remarks?: string) => {
    if (status === 'Approved') {
      await api.approveVerificationRequest(id);
    } else {
      await api.rejectVerificationRequest(id, remarks);
    }
    await fetchRequests();
  };

  const deleteRequest = async (id: number) => {
    await api.deleteVerificationRequest(id);
    await fetchRequests();
  };

  return {
    requests,
    loading,
    refetch: fetchRequests,
    updateRequestStatus,
    deleteRequest
  };
};
