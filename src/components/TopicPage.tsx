import { ArrowLeft, Clock, BookOpen, Code, Lightbulb, Target, ArrowRight, Bookmark, Play } from 'lucide-react';
import { Topic, Flashcard, FAQ } from '../types';
import { SEOHead } from './SEOHead';
import { useState } from 'react';

interface TopicPageProps {
  topic: Topic;
  flashcards: Flashcard[];
  faqs: FAQ[];
  onNavigate?: (page: string, data?: any) => void;
  onStartPractice?: (topicId: string) => void;
}

export function TopicPage({ topic, flashcards, faqs, onNavigate, onStartPractice }: TopicPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'flashcards' | 'faqs'>('overview');

  const seoContent = {
    title: topic.metaTitle,
    description: topic.metaDescription,
    canonical: `https://neuralcards.com/learn/${topic.slug}`,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: topic.title,
      description: topic.description,
      provider: {
        '@type': 'Organization',
        name: 'NeuralCards',
        sameAs: 'https://neuralcards.com'
      },
      educationalLevel: topic.difficulty,
      timeRequired: `PT${topic.estimatedMinutes}M`,
      keywords: topic.keywords.join(', ')
    }
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead seo={seoContent} />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[topic.difficulty]}`}>
                  {topic.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {topic.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {topic.title}
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {topic.description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{topic.estimatedMinutes} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{flashcards.length} flashcards</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => onStartPractice?.(topic.id)}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
              >
                <Play className="h-5 w-5" />
                Start Practice
              </button>
              <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-semibold flex items-center justify-center gap-2">
                <Bookmark className="h-5 w-5" />
                Save Topic
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-16 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'flashcards'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Flashcards ({flashcards.length})
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'faqs'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              FAQs
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'overview' && (
            <OverviewTab topic={topic} flashcards={flashcards} />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsTab flashcards={flashcards} />
          )}

          {activeTab === 'faqs' && (
            <FAQsTab faqs={faqs} />
          )}
        </div>
      </div>

      {/* Related Topics */}
      {topic.relatedTopics && topic.relatedTopics.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t dark:border-gray-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Related Topics
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {topic.relatedTopics.map((relatedSlug) => (
                <button
                  key={relatedSlug}
                  onClick={() => onNavigate?.('topic', { slug: relatedSlug })}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all text-left group"
                >
                  <div className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {relatedSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    Learn more
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewTab({ topic, flashcards }: { topic: Topic; flashcards: Flashcard[] }) {
  const conceptCards = flashcards.filter(c => c.type === 'concept');
  const formulaCards = flashcards.filter(c => c.type === 'formula');
  const codeCards = flashcards.filter(c => c.type === 'code');
  const interviewCards = flashcards.filter(c => c.type === 'interview');

  return (
    <div className="space-y-8">
      {/* Prerequisites */}
      {topic.prerequisites && topic.prerequisites.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Prerequisites
              </h3>
              <p className="text-blue-800 dark:text-blue-300 text-sm mb-3">
                To get the most out of this topic, you should be familiar with:
              </p>
              <div className="flex flex-wrap gap-2">
                {topic.prerequisites.map((prereq) => (
                  <span key={prereq} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                    {prereq.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What You'll Learn */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          What You'll Learn
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {conceptCards.length > 0 && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Core Concepts</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {conceptCards.length} key concepts to master
              </p>
            </div>
          )}

          {formulaCards.length > 0 && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Formulas & Math</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formulaCards.length} mathematical foundations
              </p>
            </div>
          )}

          {codeCards.length > 0 && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Code Examples</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {codeCards.length} Python implementations
              </p>
            </div>
          )}

          {interviewCards.length > 0 && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Interview Prep</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {interviewCards.length} common interview questions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Preview Flashcards
        </h2>
        <div className="space-y-4">
          {flashcards.slice(0, 3).map((card) => (
            <div key={card.id} className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-semibold">
                  {card.type}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  card.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {card.difficulty}
                </span>
              </div>
              <div className="font-semibold text-gray-900 dark:text-white mb-2">
                {card.front}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                {card.back.substring(0, 150)}...
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlashcardsTab({ flashcards }: { flashcards: Flashcard[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          All Flashcards
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {flashcards.length} cards
        </div>
      </div>

      {flashcards.map((card, index) => (
        <div key={card.id} className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-semibold">
                {card.type}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                card.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {card.difficulty}
              </span>
            </div>
          </div>

          <div className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
            {card.front}
          </div>

          <div className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
            {card.back}
          </div>

          {card.codeExample && (
            <div className="mt-4 p-4 bg-gray-900 rounded-lg overflow-x-auto">
              <pre className="text-sm text-gray-100">
                <code>{card.codeExample}</code>
              </pre>
            </div>
          )}

          {card.realWorldExample && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                Real-World Example
              </div>
              <div className="text-sm text-blue-900 dark:text-blue-200">
                {card.realWorldExample}
              </div>
            </div>
          )}

          {card.pitfalls && card.pitfalls.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                Common Pitfalls
              </div>
              <ul className="space-y-1">
                {card.pitfalls.map((pitfall, i) => (
                  <li key={i} className="text-sm text-yellow-900 dark:text-yellow-200 flex items-start gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400">•</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FAQsTab({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Frequently Asked Questions
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {faq.question}
              </h3>
              <span className={`text-purple-600 dark:text-purple-400 transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}>
                ▼
              </span>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-6 text-gray-700 dark:text-gray-300">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
