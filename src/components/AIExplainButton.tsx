import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { log } from '../utils/logger';

interface AIExplainProps {
  question: string;
  answer: string;
  topicTitle?: string;
}

export function AIExplainButton({ question, answer, topicTitle }: AIExplainProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setExplanation('');

    try {
      // Get auth token
      const { data: refreshed } = await supabase.auth.refreshSession();
      let token = refreshed?.session?.access_token;

      if (!token) {
        const { data: current } = await supabase.auth.getSession();
        token = current?.session?.access_token;
      }

      if (!token) {
        setError('Please log in to use AI explanations.');
        setIsLoading(false);
        return;
      }

      const systemPrompt =
        'You are a friendly, patient tutor. Explain concepts simply and clearly. Use analogies and examples. Keep responses concise (under 250 words).';
      const userPrompt = `A student is studying "${topicTitle || 'this topic'}" and needs help understanding this flashcard.

Question: ${question}
Answer: ${answer}

Please explain this concept in a simple, easy-to-understand way. Include:
1. A brief explanation in simple terms
2. A real-world analogy or example
3. Why this concept matters

Keep it concise and beginner-friendly.`;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f02c4c3b/generate-ai`,
        {
          method: 'POST',
          headers: {
            apikey: publicAnonKey,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemPrompt,
            userPrompt,
            type: 'blog', // Use blog type to get raw text back
          }),
        }
      );

      if (!response.ok) {
        let errText = '';
        try {
          const errJson = await response.json();
          errText = errJson.error || JSON.stringify(errJson);
        } catch {
          errText = await response.text();
        }
        throw new Error(`API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const text = data?.content || '';
      setExplanation(text);
      log.info('AI explanation generated successfully');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get explanation';
      setError(msg);
      log.error('AI Explain error:', msg);
    } finally {
      setIsLoading(false);
    }
  }, [question, answer, topicTitle]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (!explanation && !isLoading) {
      fetchExplanation();
    }
  }, [explanation, isLoading, fetchExplanation]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors text-sm font-medium"
        aria-label="Get AI explanation"
      >
        <Sparkles className="h-4 w-4" />
        Explain This
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:max-w-lg md:w-full"
            >
              <div className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">AI Explanation</h3>
                      <p className="text-xs text-gray-500">Powered by AI</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Close explanation"
                    aria-label="Close explanation"
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto flex-1">
                  {/* Original Q&A */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Question
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white">{question}</p>
                  </div>

                  {/* AI Content */}
                  {isLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Generating explanation...</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-600 dark:text-red-400 mb-4">
                      <p className="mb-2">{error}</p>
                      <button
                        onClick={fetchExplanation}
                        className="inline-flex items-center gap-1 text-red-700 dark:text-red-300 font-medium hover:underline"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </button>
                    </div>
                  )}

                  {explanation && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="prose prose-sm dark:prose-invert max-w-none"
                    >
                      <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                        {explanation}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t dark:border-gray-700 flex items-center justify-between">
                  <button
                    onClick={fetchExplanation}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition text-sm font-medium disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
