import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { ArrowLeft, X, Check, RotateCcw, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '../types/database.types';
import { incrementProgress } from '../data/stats-api';
import { log } from '../utils/logger';
import { supabase } from '../utils/supabase/client';

type Flashcard = Database['public']['Tables']['flashcards']['Row'] & {
  realWorldExample?: string;
  pitfalls?: string[];
};

interface FlashcardPracticeProps {
  topicTitle: string;
  flashcards: Flashcard[];
  onExit?: () => void;
  onComplete?: () => void; 
  onCardReview?: (cardId: string, difficulty: 'easy' | 'medium' | 'hard') => void;
}

export const FlashcardPractice = memo(function FlashcardPractice({ 
  topicTitle, 
  flashcards, 
  onExit,
  onComplete,
  onCardReview 
}: FlashcardPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const currentCard = flashcards[currentIndex];
  const progress = useMemo(() => flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0, [currentIndex, flashcards.length]);
  const isLastCard = currentIndex === flashcards.length - 1;
  const isCardReviewed = reviewedCards.has(currentIndex);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    // 1. Background DB Update
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        incrementProgress(user.id, 1).catch(err => log.error(err));
      }
    });

    if (onCardReview && currentCard) {
      onCardReview(currentCard.id, difficulty);
    }

    setReviewedCards(prev => new Set(prev).add(currentIndex));

    // Logic: Agar last card hai to flip back karo, nahi to agla card dikhao
    if (!isLastCard) {
      setDirection('right');
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        setDirection(null);
      }, 300);
    } else {
      setIsFlipped(false); // Last card par bas wapas palat do
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection('left');
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsFlipped(false);
        setDirection(null);
      }, 300);
    }
  };

  // 👇 MAIN FIX YAHAN HAI: Next Button Logic Updated
  const handleNext = () => {
    if (isLastCard) {
      // Agar aakhri card hai, to COMPLETE logic chalao
      if (onComplete) onComplete();
      if (onExit) onExit();
    } else {
      // Normal behavior
      setDirection('right');
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        setDirection(null);
      }, 300);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleFlip();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (isFlipped) {
      if (e.key === '1') handleDifficulty('hard');
      else if (e.key === '2') handleDifficulty('medium');
      else if (e.key === '3') handleDifficulty('easy');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, isFlipped, flashcards.length]); 

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No Flashcards Available</h2>
          <button onClick={onExit} className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-xl">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onExit} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Exit Practice</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {currentIndex + 1} / {flashcards.length}
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            {/* eslint-disable-next-line react/forbid-dom-props */}
            <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{topicTitle}</h1>
            <p className="text-gray-600 dark:text-gray-400">Click card to flip • Use arrow keys to navigate</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div onClick={handleFlip} className="relative cursor-pointer perspective-1000 min-h-card">
                <motion.div
                  className="relative w-full h-full preserve-3d"
                  initial={false}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 w-full backface-hidden">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-purple-200 dark:border-purple-800 min-h-[400px] flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">{currentCard.card_type}</span>
                        <div className="text-purple-600 dark:text-purple-400 text-sm font-medium">QUESTION</div>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center">{currentCard.front_content}</h2>
                      </div>
                      <div className="mt-6 text-center text-sm text-gray-500">Click to reveal answer</div>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 w-full card-flip-back">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl shadow-2xl p-8 md:p-12 min-h-[400px] flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-white/80 text-sm font-medium">ANSWER</div>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="text-lg md:text-xl leading-relaxed mb-6 whitespace-pre-line">{currentCard.back_content}</div>
                        {currentCard.realWorldExample && (
                          <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                            <div className="text-sm font-semibold mb-1 text-white/90">💡 Real-World Example</div>
                            <div className="text-sm text-white/80">{currentCard.realWorldExample}</div>
                          </div>
                        )}
                      </div>
                      <div className="mt-6 text-center text-sm text-white/70">Rate your understanding below</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Difficulty Buttons */}
          {isFlipped && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-4 mb-8">
              <button onClick={() => handleDifficulty('hard')} className="p-4 bg-red-500 text-white rounded-xl hover:scale-105 transition-all flex flex-col items-center gap-2 shadow-lg"><X className="h-6 w-6" /><span>Hard</span></button>
              <button onClick={() => handleDifficulty('medium')} className="p-4 bg-yellow-500 text-white rounded-xl hover:scale-105 transition-all flex flex-col items-center gap-2 shadow-lg"><RotateCcw className="h-6 w-6" /><span>Medium</span></button>
              <button onClick={() => handleDifficulty('easy')} className="p-4 bg-green-500 text-white rounded-xl hover:scale-105 transition-all flex flex-col items-center gap-2 shadow-lg"><Check className="h-6 w-6" /><span>Easy</span></button>
            </motion.div>
          )}

          {/* Controls - Updated Logic */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border dark:border-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>

            <button
              onClick={handleNext}
              // 👇 Logic Fix: Last card par disable nahi hoga agar review ho chuka hai, ya fir agar hum chahein to hamesha enable rakh sakte hain
              disabled={isLastCard && !isCardReviewed} 
              className={`px-6 py-3 rounded-xl transition-colors font-semibold flex items-center gap-2 shadow-lg ${
                isLastCard 
                  ? 'bg-green-600 hover:bg-green-700 text-white' // Finish Button Style
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 border dark:border-gray-700'
              } ${isLastCard && !isCardReviewed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLastCard ? (
                <>Finish <CheckCircle className="h-5 w-5" /></>
              ) : (
                <>Next <ChevronRight className="h-5 w-5" /></>
              )}
            </button>
          </div>

          {/* Completion Message */}
          {isLastCard && isCardReviewed && !isFlipped && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-xl text-center border border-green-200 dark:border-green-800">
              <h3 className="font-bold text-lg mb-1">Topic Completed! 🎉</h3>
              <p className="text-sm mb-4">You have reviewed all cards.</p>
              <button onClick={handleNext} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                Go to Next Chapter
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
});