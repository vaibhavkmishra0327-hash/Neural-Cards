import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search, FileText, Layers } from 'lucide-react';
import { cheatSheets, getCheatSheetCategories } from '../data/cheatSheets';
import { SEOHead } from './SEOHead';

interface CheatSheetListProps {
  onSelect: (slug: string) => void;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Programming: {
    bg: 'bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-500/20',
  },
  Mathematics: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
  },
  'Machine Learning': {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
  },
  'Deep Learning': {
    bg: 'bg-pink-500/10',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500/20',
  },
  'Data Science': {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20',
  },
  default: {
    bg: 'bg-gray-500/10',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-500/20',
  },
};

const getCatStyle = (cat: string) => categoryColors[cat] || categoryColors['default'];

export function CheatSheetList({ onSelect }: CheatSheetListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = getCheatSheetCategories();

  const filtered = cheatSheets.filter((cs) => {
    const matchesSearch =
      cs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cs.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || cs.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
      <SEOHead
        seo={{
          title: 'Cheat Sheets — NeuralCards',
          description:
            'Quick-reference cheat sheets for Python, NumPy, Pandas, Linear Algebra, Machine Learning, Deep Learning, and more.',
          canonical: 'https://neuralcards.com/cheatsheets',
        }}
      />

      {/* Hero */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <FileText className="w-4 h-4" />
          Quick Reference
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
          Cheat Sheets
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Concise, printable reference guides for every AI & ML topic. Pin them, bookmark them, love
          them.
        </p>
      </motion.div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search cheat sheets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-secondary text-muted-foreground hover:bg-purple-100 dark:hover:bg-purple-900/30'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-purple-100 dark:hover:bg-purple-900/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span>{filtered.length} cheat sheets</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cs, i) => {
          const style = getCatStyle(cs.category);
          const totalItems = cs.sections.reduce((sum, s) => sum + s.items.length, 0);
          return (
            <motion.div
              key={cs.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => onSelect(cs.slug)}
              className={`group cursor-pointer rounded-2xl border ${style.border} ${style.bg} p-6 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Icon + Category */}
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{cs.icon}</span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}
                >
                  {cs.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {cs.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{cs.description}</p>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {cs.sections.length} sections · {totalItems} items
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-purple-500" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No cheat sheets found</p>
          <p className="text-sm mt-1">Try a different search or category.</p>
        </div>
      )}
    </div>
  );
}
