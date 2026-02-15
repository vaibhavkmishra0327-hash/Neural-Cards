import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  ChevronRight,
  Lightbulb,
  Send,
} from 'lucide-react';
import { Database } from '../types/database.types';
import { generateFillBlankQuestions, calculateScore } from '../utils/quiz-generator';
import { incrementProgress } from '../data/stats-api';
import { supabase } from '../utils/supabase/client';

type Flashcard = Database['public']['Tables']['flashcards']['Row'];

interface FillBlankQuizProps {
  topicTitle: string;
  topicSlug?: string;
  flashcards: Flashcard[];
  onExit: () => void;
  onComplete?: () => void;
}

export function FillBlankQuiz({
  topicTitle,
  topicSlug,
  flashcards,
  onExit,
  onComplete,
}: FillBlankQuizProps) {
  const questions = useMemo(() => generateFillBlankQuestions(flashcards, 10), [flashcards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState<
    { questionId: string; correct: boolean; userAnswer: string }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Focus input on mount and question change
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [currentIndex]);

  const checkAnswer = useCallback(
    (input: string) => {
      if (!currentQuestion) return false;
      const userNormalized = input
        .trim()
        .toLowerCase()
        .replace(/[.,;:!?()]/g, '');
      const correctNormalized = currentQuestion.blankedWord
        .toLowerCase()
        .replace(/[.,;:!?()]/g, '');

      // Exact match or close enough (contains)
      return (
        userNormalized === correctNormalized ||
        correctNormalized.includes(userNormalized) ||
        userNormalized.includes(correctNormalized)
      );
    },
    [currentQuestion]
  );

  const handleSubmit = useCallback(() => {
    if (isAnswered || !currentQuestion || userInput.trim() === '') return;

    const correct = checkAnswer(userInput);
    setIsAnswered(true);
    setIsCorrect(correct);
    setShowHint(false);

    if (correct) {
      setCorrectCount((c) => c + 1);
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) incrementProgress(user.id, 1, topicSlug);
      });
    } else {
      setWrongCount((c) => c + 1);
    }

    setAnswers((prev) => [
      ...prev,
      { questionId: currentQuestion.id, correct, userAnswer: userInput },
    ]);
  }, [isAnswered, currentQuestion, userInput, checkAnswer, topicSlug]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setUserInput('');
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      setShowResults(true);
      if (onComplete) onComplete();
    }
  }, [currentIndex, questions.length, onComplete]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setUserInput('');
    setIsAnswered(false);
    setIsCorrect(false);
    setCorrectCount(0);
    setWrongCount(0);
    setShowResults(false);
    setShowHint(false);
    setAnswers([]);
  }, []);

  // Keyboard: Enter to submit or continue
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isAnswered) {
          handleNext();
        } else {
          handleSubmit();
        }
      }
    },
    [isAnswered, handleNext, handleSubmit]
  );

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✏️</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Not Enough Cards
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Need flashcards to generate fill-in-the-blank questions.
          </p>
          <button onClick={onExit} className="px-6 py-3 bg-purple-600 text-white rounded-xl">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const { score, grade } = calculateScore(correctCount, questions.length);
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/20">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mb-6"
              >
                <Trophy className="h-20 w-20 mx-auto text-yellow-500" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Fill-in-the-Blank Complete!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">{topicTitle}</p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">{correctCount}</div>
                  <div className="text-sm text-green-700 dark:text-green-400">Correct</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-red-600">{wrongCount}</div>
                  <div className="text-sm text-red-700 dark:text-red-400">Wrong</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600">{score}%</div>
                  <div className="text-sm text-purple-700 dark:text-purple-400">Grade: {grade}</div>
                </div>
              </div>

              <div className="mb-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {score >= 90
                    ? '🌟 Excellent recall! You really know your stuff!'
                    : score >= 70
                      ? '👏 Good memory! Keep reinforcing these concepts.'
                      : score >= 50
                        ? '📚 Getting there! Practice makes perfect.'
                        : '💪 Review the material and try again!'}
                </p>
              </div>

              {/* Answer Review */}
              <div className="mb-8 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Answers</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {answers.map((a, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                        a.correct
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {a.correct ? (
                        <CheckCircle className="h-4 w-4 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate">
                        Q{i + 1}: &quot;{a.userAnswer}&quot; → {questions[i]?.blankedWord}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleRestart}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  Try Again
                </button>
                <button
                  onClick={onExit}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Exit
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onExit}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Exit Quiz</span>
            </button>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {currentIndex + 1} / {questions.length}
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-2">
            <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold mb-4">
              FILL IN THE BLANK • {topicTitle}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-6 border-2 border-emerald-200 dark:border-emerald-800">
                <span className="text-xs font-semibold text-emerald-500 mb-4 block">
                  {currentQuestion.cardType.toUpperCase()}
                </span>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
                  {currentQuestion.sentence.split('_____').map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="inline-block border-b-4 border-emerald-400 dark:border-emerald-500 min-w-[100px] mx-1 text-emerald-600">
                          {isAnswered ? (
                            <span
                              className={
                                isCorrect
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400 line-through'
                              }
                            >
                              {userInput || '?'}
                            </span>
                          ) : (
                            <span className="text-emerald-300 dark:text-emerald-700">???</span>
                          )}
                        </span>
                      )}
                    </span>
                  ))}
                </p>
              </div>

              {/* Input Area */}
              {!isAnswered && (
                <div className="mb-6">
                  <div className="flex gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your answer..."
                      className="flex-1 px-5 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400"
                      autoComplete="off"
                      autoCapitalize="off"
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={userInput.trim() === ''}
                      title="Submit answer"
                      aria-label="Submit answer"
                      className="px-6 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Hint */}
                  <button
                    onClick={() => setShowHint(true)}
                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 mt-3 text-sm hover:underline"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Need a hint?
                  </button>
                  {showHint && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-amber-600 dark:text-amber-400 mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                    >
                      💡 {currentQuestion.hint}
                    </motion.p>
                  )}
                </div>
              )}

              {/* Result */}
              {isAnswered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div
                    className={`p-4 rounded-xl mb-4 text-center font-semibold ${
                      isCorrect
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {isCorrect ? (
                      '✅ Correct!'
                    ) : (
                      <span>
                        ❌ The answer was:{' '}
                        <strong className="underline">{currentQuestion.blankedWord}</strong>
                      </span>
                    )}
                  </div>

                  {/* Full answer */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 mb-6">
                    <strong>Full answer:</strong> {currentQuestion.fullAnswer}
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>
                        Next Question <ChevronRight className="h-5 w-5" />
                      </>
                    ) : (
                      <>
                        See Results <Trophy className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-600">
            Type your answer and press Enter to submit
          </div>
        </div>
      </div>
    </div>
  );
}
