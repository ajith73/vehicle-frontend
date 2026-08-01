import { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import type { Mechanic } from '../types';

export const useMechanicSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Mechanic[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const params = new URLSearchParams({ search: query.trim() });
        const results = await apiClient<Mechanic[]>(`/public/mechanics?${params.toString()}`);
        setSuggestions(results.slice(0, 6));
      } catch (loadError) {
        console.error('Failed to load mechanic suggestions', loadError);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  return {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    loadingSuggestions
  };
};
