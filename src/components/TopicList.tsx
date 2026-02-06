import { useEffect, useState } from 'react';
import { getTopics } from '../data/api';
import { Database } from '../types/database.types';
import { log } from '../utils/logger';

type Topic = Database['public']['Tables']['topics']['Row'];

interface TopicListProps {
  onTopicClick?: (slug: string, title: string) => void;
}

export default function TopicList({ onTopicClick }: TopicListProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTopics();
        setTopics(data || []);
      } catch (error) {
        log.error('Failed to load topics', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-muted/20 animate-pulse"></div>
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((topic) => (
        <div
          key={topic.id}
          onClick={() => onTopicClick?.(topic.slug, topic.title)}
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer"
        >
          {/* Hover Gradient Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
              {topic.category}
            </div>

            <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {topic.title}
            </h3>

            <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{topic.description}</p>

            <div className="flex items-center text-sm font-medium text-primary">
              Start Learning
              <svg
                className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
