import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, ListChecks, PenLine, Layers, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFlashcardsByTopic } from '../data/api';
import { Database } from '../types/database.types';
import { MCQQuiz } from './MCQQuiz';
import { FillBlankQuiz } from './FillBlankQuiz';
import { FlashcardPractice } from './FlashcardPractice';
import type { QuizMode } from '../utils/quiz-generator';

type Flashcard = Database['public']['Tables']['flashcards']['Row'];

export function QuizHub() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<QuizMode | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topicTitle, setTopicTitle] = useState('');

  useEffect(() => {
    if (!slug) return;
    const title = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    setTopicTitle(title); // eslint-disable-line react-hooks/set-state-in-effect

    setIsLoading(true);
    getFlashcardsByTopic(slug).then((cards) => {
      setFlashcards(cards as Flashcard[]);
      setIsLoading(false);
    });
  }, [slug]);

  const handleExit = useCallback(() => {
    if (selectedMode) {
      setSelectedMode(null);
    } else {
      navigate('/practice');
    }
  }, [selectedMode, navigate]);

  const modes = [
    {
      id: 'flashcard' as QuizMode,
      title: 'Flashcards',
      description: 'Classic flip cards with spaced repetition',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'mcq' as QuizMode,
      title: 'Multiple Choice',
      description: 'Test your knowledge with 4 options per question',
      icon: ListChecks,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'fill-blank' as QuizMode,
      title: 'Fill in the Blank',
      description: 'Type the missing word to test recall',
      icon: PenLine,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  // Render selected quiz mode
  if (selectedMode === 'mcq') {
    return (
      <MCQQuiz
        topicTitle={topicTitle}
        topicSlug={slug}
        flashcards={flashcards}
        onExit={handleExit}
        onComplete={() => {}}
      />
    );
  }

  if (selectedMode === 'fill-blank') {
    return (
      <FillBlankQuiz
        topicTitle={topicTitle}
        topicSlug={slug}
        flashcards={flashcards}
        onExit={handleExit}
        onComplete={() => {}}
      />
    );
  }

  if (selectedMode === 'flashcard') {
    return (
      <FlashcardPractice
        topicTitle={topicTitle}
        topicSlug={slug}
        flashcards={flashcards}
        onExit={handleExit}
        onComplete={() => {}}
      />
    );
  }

  // Mode selector
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/practice')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Practice Hub</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm font-semibold text-purple-700 dark:text-purple-300 mb-4">
              <Layers className="h-4 w-4" />
              Choose Study Mode
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {topicTitle}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {flashcards.length} flashcards available • Pick your preferred study mode
            </p>
          </motion.div>

          {/* Mode Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {modes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`relative group text-left p-6 md:p-8 rounded-2xl border-2 ${mode.borderColor} ${mode.bgColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {mode.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {mode.description}
                  </p>
                  <div
                    className={`inline-flex items-center gap-1 text-sm font-medium ${mode.iconColor}`}
                  >
                    Start <Sparkles className="h-4 w-4" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-gray-500 dark:text-gray-600"
          >
            <p>
              💡 Tip: Use <strong>Flashcards</strong> for initial learning, <strong>MCQ</strong> to
              test understanding, and <strong>Fill-in-the-Blank</strong> for deep recall.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
