import { useState, useEffect, useCallback } from 'react';
import type { Feedback } from '../types';
import * as api from '../api/feedback';

export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getFeedback();
      setFeedback(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  return {
    feedback,
    loading,
    error,
    refetch: fetchFeedback
  };
}
