import { useState, useCallback } from 'react';
import api from '../services/api';

export function useNearbyResponders() {
  const [responders, setResponders] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchResponders = useCallback(async (latitude, longitude, radius = 5000) => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await api.getNearbyResponders(latitude, longitude, radius);
      if (response && response.success) {
        setResponders(response.data || []);
      } else {
        throw new Error('Failed to fetch nearby directory.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching responders.');
    } finally {
      setIsFetching(false);
    }
  }, []);

  return { fetchResponders, responders, isFetching, error };
}
