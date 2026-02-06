import { useState, useEffect } from 'react';
import { getTopics } from '../data/api';
import { Database } from '../types/database.types';
import { log } from '../utils/logger';

// Topic ka Type extract kar rahe hain taaki TypeScript khush rahe
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
  }, []); // Empty array = Sirf ek baar chalega jab component load hoga

  return { topics, loading, error };
}
