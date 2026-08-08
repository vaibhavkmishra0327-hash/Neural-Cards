import { useState, useEffect } from 'react';
import { getTopics } from '../data/api';
import { Database } from '../types/database.types';
import { log } from '../utils/logger';

// Extract Topic type so TypeScript gets correct inference
type Topic = Database['public']['Tables']['topics']['Row'];

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopics() {
      try {
        setLoading(true);
        const data = await getTopics();
        setTopics(data);
      } catch (err) {
        setError('Failed to load topics');
        log.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopics();
  }, []); // Empty array = runs only once when the component loads

  return { topics, loading, error };
}
