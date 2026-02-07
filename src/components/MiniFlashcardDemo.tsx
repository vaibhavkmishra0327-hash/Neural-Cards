import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DemoCard {
  front: string;
  back: string;
}

interface MiniFlashcardDemoProps {
  /** Topic slug to link to for full practice — e.g. "neural-networks" */
  topicSlug?: string;
  /** Custom cards to show. If not provided, shows default demo cards */
  cards?: DemoCard[];
  /** Title shown above the demo */
  title?: string;
}

const DEFAULT_CARDS: DemoCard[] = [
  {
    front: 'What is Spaced Repetition?',
    back: 'A learning technique that spaces out review sessions at increasing intervals to move information into long-term memory.',
  },
  {
    front: 'What is Active Recall?',
    back: 'A study method where you actively try to remember information rather than passively re-reading it. Flashcards are a classic active recall tool.',
  },
  {
    front: 'Why do flashcards work?',
    back: 'They combine active recall + spaced repetition — the two most scientifically proven study techniques for long-term retention.',
  },
];

export function MiniFlashcardDemo({
  topicSlug,
  cards = DEFAULT_CARDS,
  title = 'Try it yourself',
}: MiniFlashcardDemoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  const currentCard = cards[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  }, [cards.length]);

  return (
    <div className="my-12 p-6 md:p-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-900/20 dark:via-zinc-900 dark:to-blue-900/20 rounded-2xl border border-purple-200 dark:border-purple-800/50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Click the card to flip • {cards.length} cards
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="relative max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${isFlipped}`}
            initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleFlip}
            className="cursor-pointer select-none"
          >
            <div
              className={`min-h-[200px] rounded-xl p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-lg transition-all ${
                isFlipped
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                  : 'bg-white dark:bg-zinc-800 border-2 border-purple-200 dark:border-purple-700 text-foreground'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-60">
                {isFlipped ? 'Answer' : 'Question'}
              </div>
              <p className="text-lg md:text-xl font-semibold leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              <div className="mt-4 text-xs opacity-50">
                {isFlipped ? 'Click to see question' : 'Click to reveal answer'}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={handlePrev}
            className="p-2 bg-white dark:bg-zinc-800 border border-border rounded-full hover:bg-secondary transition-colors shadow-sm"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-mono text-muted-foreground">
            {currentIndex + 1} / {cards.length}
          </span>

          <button
            onClick={handleNext}
            className="p-2 bg-white dark:bg-zinc-800 border border-border rounded-full hover:bg-secondary transition-colors shadow-sm"
            aria-label="Next card"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsFlipped(false);
              setCurrentIndex(0);
            }}
            className="p-2 bg-white dark:bg-zinc-800 border border-border rounded-full hover:bg-secondary transition-colors shadow-sm"
            aria-label="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate(topicSlug ? `/practice/${topicSlug}` : '/practice')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4" />
          Practice with Full Deck
        </button>
        <p className="text-xs text-muted-foreground mt-2">
          100+ AI-generated flashcards with spaced repetition
        </p>
      </div>
    </div>
  );
}
