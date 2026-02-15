import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  ChevronRight,
  Timer,
  Lightbulb,
} from 'lucide-react';
import { Database } from '../types/database.types';
import { generateMCQQuestions, calculateScore } from '../utils/quiz-generator';
import { incrementProgress } from '../data/stats-api';
import { supabase } from '../utils/supabase/client';

type Flashcard = Database['public']['Tables']['flashcards']['Row'];

interface MCQQuizProps {
  topicTitle: string;
  topicSlug?: string;
  flashcards: Flashcard[];
  onExit: () => void;
  onComplete?: () => void;
}

export function MCQQuiz({ topicTitle, topicSlug, flashcards, onExit, onComplete }: MCQQuizProps) {
  const questions = useMemo(() => generateMCQQuestions(flashcards, 10), [flashcards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const [answers, setAnswers] = useState<{ questionId: string; correct: boolean }[]>([]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleTimeUp = useCallback(() => {
    setIsAnswered(true);
    setTimerActive(false);
    setWrongCount((c) => c + 1);
    setAnswers((prev) => [...prev, { questionId: currentQuestion?.id || '', correct: false }]);
  }, [currentQuestion]);

  // Timer
  useEffect(() => {
    if (!timerActive || isAnswered || showResults) return;
    if (timeLeft <= 0) {
      handleTimeUp(); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, timerActive, isAnswered, showResults, handleTimeUp]);

  // Reset timer on new question
  useEffect(() => {
    setTimeLeft(30); // eslint-disable-line react-hooks/set-state-in-effect
    setTimerActive(true);
  }, [currentIndex]);

  const handleSelectAnswer = useCallback(
    (optionId: string) => {
      if (isAnswered || !currentQuestion) return;

      setSelectedAnswer(optionId);
      setIsAnswered(true);
      setTimerActive(false);

      const isCorrect = optionId === currentQuestion.correctAnswer;

      if (isCorrect) {
        setCorrectCount((c) => c + 1);
        // Track progress
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) incrementProgress(user.id, 1, topicSlug);
        });
      } else {
        setWrongCount((c) => c + 1);
      }

      setAnswers((prev) => [...prev, { questionId: currentQuestion.id, correct: isCorrect }]);
    },
    [isAnswered, currentQuestion, topicSlug]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      setShowResults(true);
      if (onComplete) onComplete();
    }
  }, [currentIndex, questions.length, onComplete]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setWrongCount(0);
    setShowResults(false);
    setShowExplanation(false);
    setAnswers([]);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showResults) return;
      if (!isAnswered) {
        if (e.key === '1' || e.key === 'a') handleSelectAnswer('A');
        else if (e.key === '2' || e.key === 'b') handleSelectAnswer('B');
        else if (e.key === '3' || e.key === 'c') handleSelectAnswer('C');
        else if (e.key === '4' || e.key === 'd') handleSelectAnswer('D');
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
        if (e.key === 'e') setShowExplanation((s) => !s);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isAnswered, showResults, handleSelectAnswer, handleNext]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Not Enough Cards for Quiz
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Need at least 2 flashcards to generate a quiz.
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20">
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
                Quiz Complete!
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

              {/* Score message */}
              <div className="mb-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {score >= 90
                    ? '🌟 Outstanding! You really know this topic!'
                    : score >= 70
                      ? '👏 Great job! Keep up the good work!'
                      : score >= 50
                        ? '📚 Not bad! Review the tough ones and try again.'
                        : "💪 Keep practicing! You'll get there."}
                </p>
              </div>

              {/* Answer Review */}
              <div className="mb-8 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Answer Review</h3>
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
                        Q{i + 1}: {questions[i]?.question}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleRestart}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onExit}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Exit Quiz</span>
            </button>
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  timeLeft <= 10
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                <Timer className="h-4 w-4" />
                {timeLeft}s
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {currentIndex + 1} / {questions.length}
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-2">
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold mb-4">
              MULTIPLE CHOICE • {topicTitle}
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
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-6 border-2 border-blue-200 dark:border-blue-800">
                <span className="text-xs font-semibold text-blue-500 mb-2 block">
                  {currentQuestion.cardType.toUpperCase()}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option) => {
                  let optionClasses =
                    'w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 flex items-start gap-3';

                  if (!isAnswered) {
                    optionClasses +=
                      selectedAnswer === option.id
                        ? ' border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : ' border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 bg-white dark:bg-gray-800';
                  } else if (option.isCorrect) {
                    optionClasses +=
                      ' border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300';
                  } else if (selectedAnswer === option.id && !option.isCorrect) {
                    optionClasses +=
                      ' border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300';
                  } else {
                    optionClasses +=
                      ' border-gray-200 dark:border-gray-700 opacity-60 bg-white dark:bg-gray-800';
                  }

                  return (
                    <motion.button
                      key={option.id}
                      whileHover={!isAnswered ? { scale: 1.01 } : {}}
                      whileTap={!isAnswered ? { scale: 0.99 } : {}}
                      onClick={() => handleSelectAnswer(option.id)}
                      disabled={isAnswered}
                      className={optionClasses}
                    >
                      <span
                        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          isAnswered && option.isCorrect
                            ? 'bg-green-500 text-white'
                            : isAnswered && selectedAnswer === option.id && !option.isCorrect
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {option.id}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium pt-1">
                        {option.text}
                      </span>
                      {isAnswered && option.isCorrect && (
                        <CheckCircle className="h-5 w-5 ml-auto shrink-0 text-green-500 mt-1" />
                      )}
                      {isAnswered && selectedAnswer === option.id && !option.isCorrect && (
                        <XCircle className="h-5 w-5 ml-auto shrink-0 text-red-500 mt-1" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* After answering */}
              {isAnswered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Result Badge */}
                  <div
                    className={`p-4 rounded-xl mb-4 text-center font-semibold ${
                      selectedAnswer === currentQuestion.correctAnswer
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {selectedAnswer === currentQuestion.correctAnswer
                      ? '✅ Correct!'
                      : selectedAnswer === null
                        ? "⏰ Time's up!"
                        : '❌ Incorrect'}
                  </div>

                  {/* Explanation Toggle */}
                  <button
                    onClick={() => setShowExplanation((s) => !s)}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-4 hover:underline text-sm font-medium"
                  >
                    <Lightbulb className="h-4 w-4" />
                    {showExplanation ? 'Hide Explanation' : 'Show Explanation (E)'}
                  </button>

                  <AnimatePresence>
                    {showExplanation && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line border border-blue-200 dark:border-blue-800">
                          {currentQuestion.explanation}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Next Button */}
                  <button
                    onClick={handleNext}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold flex items-center justify-center gap-2 shadow-lg"
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

          {/* Keyboard hint */}
          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-600">
            Press 1-4 or A-D to answer • Enter to continue • E for explanation
          </div>
        </div>
      </div>
    </div>
  );
}
