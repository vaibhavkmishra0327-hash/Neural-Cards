import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BlogCTAProps {
  /** Slug for the practice topic related to this blog */
  topicSlug?: string;
  /** Variant style */
  variant?: 'inline' | 'banner';
}

export function BlogCTA({ topicSlug, variant = 'banner' }: BlogCTAProps) {
  const navigate = useNavigate();

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="my-8 p-5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl flex flex-col sm:flex-row items-center gap-4"
      >
        <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full shrink-0">
          <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="font-bold text-foreground text-sm">Want to test your understanding?</p>
          <p className="text-xs text-muted-foreground">
            Practice this topic with AI-powered flashcards and spaced repetition
          </p>
        </div>
        <button
          onClick={() => navigate(topicSlug ? `/practice/${topicSlug}` : '/practice')}
          className="shrink-0 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5"
        >
          Practice Now <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-16 relative overflow-hidden rounded-2xl"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-90" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTR2LTJoNHptMC0yNHYyaC00di0yaDR6bS00IDhoMnY0aC0ydi00em0yMCAxMnYyaC00di0yaDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

      <div className="relative z-10 p-8 md:p-12 text-center text-white">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Powered by AI</span>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold mb-3">Turn This Knowledge Into Memory</h3>
        <p className="text-white/80 max-w-lg mx-auto mb-6 text-sm md:text-base">
          Don't just read — retain. Practice what you learned with AI-generated flashcards using
          scientifically-proven spaced repetition.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(topicSlug ? `/practice/${topicSlug}` : '/practice')}
            className="px-6 py-3 bg-white text-purple-700 font-bold rounded-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Start Practicing Free
          </button>
          <button
            onClick={() => navigate('/paths')}
            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            View Learning Paths
          </button>
        </div>

        <p className="text-white/50 text-xs mt-4">
          No credit card required • 100+ topics available
        </p>
      </div>
    </motion.div>
  );
}
