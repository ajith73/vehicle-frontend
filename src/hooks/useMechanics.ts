import { useState, useEffect, useCallback } from 'react';
import type { Mechanic } from '../types';
import * as api from '../api/mechanics';

export function useMechanics() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMechanics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getMechanics();
      setMechanics(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mechanics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMechanics();
  }, [fetchMechanics]);

  return {
    mechanics,
    loading,
    error,
    refetch: fetchMechanics
  };
}
