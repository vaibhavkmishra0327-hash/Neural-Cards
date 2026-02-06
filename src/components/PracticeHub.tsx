import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, Layers, Search, Sparkles } from 'lucide-react';
import { getTopicsWithCardCount } from '../data/api';
import { Database } from '../types/database.types';
import { log } from '../utils/logger';

type Topic = Database['public']['Tables']['topics']['Row'] & { cardCount: number };

interface PracticeHubProps {
  onChapterClick: (slug: string, title: string) => void;
}

// Category icons/colors
const categoryColors: Record<
  string,
  { bg: string; text: string; border: string; gradient: string }
> = {
  Mathematics: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    gradient: 'from-blue-500 to-cyan-500',
  },
  Programming: {
    bg: 'bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-500/20',
    gradient: 'from-green-500 to-emerald-500',
  },
  'Machine Learning': {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
    gradient: 'from-purple-500 to-pink-500',
  },
  'Data Science': {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20',
    gradient: 'from-orange-500 to-amber-500',
  },
  Statistics: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/20',
    gradient: 'from-teal-500 to-cyan-500',
  },
  default: {
    bg: 'bg-gray-500/10',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-500/20',
    gradient: 'from-gray-500 to-slate-500',
  },
};

const getCategoryStyle = (category: string) =>
  categoryColors[category] || categoryColors['default'];

export function PracticeHub({ onChapterClick }: PracticeHubProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchTopics() {
      try {
        const data = await getTopicsWithCardCount();
        setTopics((data as Topic[]) || []);
      } catch (error) {
        log.error('Failed to load topics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopics();
  }, []);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(topics.map((t) => t.category)))];

  // Filter topics
  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedTopics: Record<string, Topic[]> = {};
  filteredTopics.forEach((topic) => {
    if (!groupedTopics[topic.category]) groupedTopics[topic.category] = [];
    groupedTopics[topic.category].push(topic);
  });

  const totalCards = topics.reduce((sum, t) => sum + t.cardCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 dark:from-purple-600/10 dark:to-pink-600/10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Practice Mode
            </motion.div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Chapter
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Select a chapter to start practicing flashcards. Master one topic at a time.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {topics.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Chapters</div>
              </div>
              <div className="w-px h-10 bg-gray-300 dark:bg-gray-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {totalCards}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Flashcards</div>
              </div>
              <div className="w-px h-10 bg-gray-300 dark:bg-gray-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {categories.length - 1}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Categories</div>
              </div>
            </div>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chapters..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 mt-6"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:text-purple-600'
                }`}
              >
                {cat === 'all' ? '📚 All' : cat}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Chapter Cards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No chapters found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">Try a different search or category</p>
          </motion.div>
        ) : (
          Object.entries(groupedTopics).map(([category, categoryTopics], groupIdx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIdx * 0.1 }}
              className="mt-10"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${getCategoryStyle(category).bg}`}>
                  <Layers className={`w-5 h-5 ${getCategoryStyle(category).text}`} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{category}</h2>
                <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                  {categoryTopics.length} chapter{categoryTopics.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Topic Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {categoryTopics.map((topic, index) => {
                    const style = getCategoryStyle(category);
                    return (
                      <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onChapterClick(topic.slug, topic.title)}
                        className={`group relative overflow-hidden rounded-2xl border ${style.border} bg-white dark:bg-gray-800/50 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-400/50`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Hover gradient overlay */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                        />

                        <div className="relative z-10">
                          {/* Category Badge */}
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} mb-4`}
                          >
                            <BookOpen className="w-3 h-3" />
                            {category}
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {topic.title}
                          </h3>

                          {/* Description */}
                          {topic.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                              {topic.description}
                            </p>
                          )}

                          {/* Footer: Card count + Arrow */}
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full bg-gradient-to-r ${style.gradient}`}
                              />
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {topic.cardCount} {topic.cardCount === 1 ? 'card' : 'cards'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              Practice
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default PracticeHub;
