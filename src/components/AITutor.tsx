import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles, RotateCcw, Bot, User } from 'lucide-react';
import { sendTutorMessage, type TutorMessage } from '../utils/ai-service';

interface AITutorProps {
  topicTitle: string;
  cardFront?: string;
  cardBack?: string;
}

export function AITutor({ topicTitle, cardFront, cardBack }: AITutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevCardRef = useRef(cardFront);

  // Reset conversation when the user navigates to a different card
  useEffect(() => {
    if (prevCardRef.current !== cardFront) {
      prevCardRef.current = cardFront;
      setMessages([]);
      setError(null);
      setInput('');
      setIsLoading(false);
      // Don't close the panel — just refresh context
    }
  }, [cardFront]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (messages.length === 0) {
      // Add initial context-aware greeting
      setMessages([
        {
          role: 'assistant',
          content: cardFront
            ? `Hi! I'm your AI tutor 🧠\n\nI see you're studying "${topicTitle}" and looking at:\n\n**Q:** ${cardFront}\n\nAsk me anything about this concept — I'll explain it simply, give examples, or help you understand why it matters!`
            : `Hi! I'm your AI tutor for "${topicTitle}" 🧠\n\nAsk me anything about this topic — I can explain concepts, give real-world examples, and help you understand tricky parts!`,
        },
      ]);
    }
  }, [messages.length, topicTitle, cardFront]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setError(null);
      const userMessage: TutorMessage = { role: 'user', content: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      const result = await sendTutorMessage(trimmed, [...messages, userMessage], {
        topicTitle,
        cardFront: cardFront ?? undefined,
        cardBack: cardBack ?? undefined,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setMessages((prev) => [...prev, { role: 'assistant', content: result.data! }]);
      }

      setIsLoading(false);
    },
    [isLoading, messages, topicTitle, cardFront, cardBack]
  );

  const handleSend = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setError(null);
    setIsOpen(false);
    setTimeout(() => handleOpen(), 100);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-400 rounded-xl hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50 transition-colors text-sm font-medium border border-purple-200 dark:border-purple-800"
        aria-label="Open AI Tutor"
      >
        <MessageCircle className="h-4 w-4" />
        AI Tutor
      </button>

      {/* Chat Modal */}
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

            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:max-w-lg md:w-full"
            >
              <div className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] md:max-h-[600px]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">AI Tutor</h3>
                      <p className="text-xs text-gray-500">{topicTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleReset}
                      title="New conversation"
                      aria-label="Reset conversation"
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <RotateCcw className="h-4 w-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      title="Close"
                      aria-label="Close tutor"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                    >
                      <X className="h-5 w-5 text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white rounded-br-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start justify-between gap-2">
                      <span>{error}</span>
                      <button
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-300 flex-shrink-0"
                        aria-label="Dismiss error"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested questions (shown when no user messages yet) */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {[
                      'Explain this simply',
                      'Give me a real-world example',
                      'Why is this important?',
                      'Common mistakes to avoid?',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="px-3 py-1.5 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors border border-purple-200 dark:border-purple-800"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t dark:border-gray-700 flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask anything about this topic..."
                      disabled={isLoading}
                      className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <button
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full mt-2 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-center"
                  >
                    Close &amp; continue studying
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
