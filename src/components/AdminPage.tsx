import { useState, useEffect } from 'react';
import { generateContentWithGroq } from '../utils/ai-generator';
import { supabase } from '../utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Save, Trash2, Plus, AlertCircle, FileText, Layers, MapPin } from 'lucide-react';
import { log } from '../utils/logger';
import { learningPaths } from '../data/learningPaths';

// Types
type PendingTopic = {
  title: string;
  slug: string;
  pathName: string;
};

type ContentType = 'flashcard' | 'blog';

const PATH_OPTIONS = [
  { value: '', label: 'None (Practice Hub only)' },
  ...learningPaths.map((p) => ({ value: p.id, label: `${p.icon} ${p.title}` })),
];

export function AdminPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('flashcard');
  const [selectedPath, setSelectedPath] = useState('');

  // Data States
  const [generatedCards, setGeneratedCards] = useState<any[]>([]);
  const [generatedBlog, setGeneratedBlog] = useState<string>('');

  const [status, setStatus] = useState('');
  const [pendingTopics, setPendingTopics] = useState<PendingTopic[]>([]);

  const supabaseClient = supabase;

  const checkMissingTopics = async () => {
    try {
      const { data: nodes } = await supabaseClient
        .from('path_nodes')
        .select('title, topic_slug, path_id, learning_paths(title)');

      const { data: existingTopics } = await supabaseClient.from('topics').select('slug');

      if (nodes && existingTopics) {
        const existingSlugs = existingTopics.map((t: any) => t.slug);

        const missing = nodes
          .filter((node: any) => !existingSlugs.includes(node.topic_slug))
          .map((node: any) => ({
            title: node.title,
            slug: node.topic_slug,
            pathName: node.learning_paths?.title || 'Roadmap',
          }));

        const uniqueMissing = missing.filter(
          (v: any, i: any, a: any) => a.findIndex((t: any) => t.slug === v.slug) === i
        );
        setPendingTopics(uniqueMissing);
      }
    } catch (error) {
      log.error('Error checking topics:', error);
    }
  };

  useEffect(() => {
    checkMissingTopics();
  }, []);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setStatus('🧠 AI is thinking... (Groq is fast!)');

    const { data: result, error } = await generateContentWithGroq(topic, contentType);

    if (error) {
      setStatus(`❌ ${error}`);
      console.error('Generation failed:', error);
    } else if (result) {
      if (contentType === 'flashcard') {
        setGeneratedCards(result as any[]);
        setStatus(`✅ Generated ${(result as any[]).length} cards!`);
      } else {
        setGeneratedBlog(result as string);
        setStatus(`✅ Generated Blog Post! Review below.`);
      }
    } else {
      setStatus('❌ No content generated. Try again.');
    }
    setLoading(false);
  };

  // --- FLASHCARD ACTIONS ---
  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...generatedCards];
    newCards[index][field] = value;
    setGeneratedCards(newCards);
  };

  const deleteCard = (index: number) => {
    const newCards = generatedCards.filter((_, i) => i !== index);
    setGeneratedCards(newCards);
  };

  const addCard = () => {
    setGeneratedCards([...generatedCards, { front: '', back: '', type: 'concept', code: null }]);
  };

  // --- GENERAL ACTIONS ---
  const autoFillTopic = (pendingTopic: PendingTopic) => {
    setTopic(pendingTopic.title);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveToDB = async () => {
    if (contentType === 'flashcard' && generatedCards.length === 0) {
      setStatus('⚠️ No cards to save!');
      return;
    }
    if (contentType === 'blog' && !generatedBlog) {
      setStatus('⚠️ No blog content to save!');
      return;
    }

    setStatus('💾 Saving to Database...');

    const matchedPending = pendingTopics.find((t) => t.title.toLowerCase() === topic.toLowerCase());
    const topicSlug = matchedPending
      ? matchedPending.slug
      : topic
          .toLowerCase()
          .trim()
          .replace(/ /g, '-')
          .replace(/[^a-z0-9-]/g, '');

    // 1. Save Topic Metadata
    const topicInsert = {
      title: topic,
      slug: topicSlug,
      category: 'AI/ML' as const,
      description: contentType === 'blog' ? 'Detailed Blog Post' : `Flashcards for ${topic}`,
      ...(selectedPath && contentType === 'flashcard' ? { learning_path: selectedPath } : {}),
    };

    const { data: topicData, error: topicError } = await supabaseClient
      .from('topics')
      .insert([topicInsert])
      .select()
      .single();

    const topicId = topicData?.id;

    if (topicError && topicError.code !== '23505') {
      setStatus(`❌ Error creating topic: ${topicError.message}`);
      return;
    }

    if (contentType === 'flashcard') {
      // --- SAVE FLASHCARDS ---
      let finalTopicId = topicId;
      if (!finalTopicId) {
        const { data: existing } = await supabaseClient
          .from('topics')
          .select('id')
          .eq('slug', topicSlug)
          .single();
        finalTopicId = existing?.id;
      }

      const cardsToInsert = generatedCards.map((card: any) => ({
        topic_id: finalTopicId ?? '',
        front_content: card.front || card.front_content || '',
        back_content: card.back || card.back_content || '',
        card_type: card.type || 'concept',
        code_snippet: card.code || null,
      }));

      const { error } = await supabaseClient.from('flashcards').insert(cardsToInsert);
      if (error) setStatus(`❌ Error: ${error.message}`);
      else {
        setStatus('🎉 Flashcards Published!');
        setGeneratedCards([]);
      }
    } else {
      // --- SAVE BLOG ---
      const { error } = await supabaseClient.from('blogs').insert({
        title: topic,
        slug: topicSlug,
        content: generatedBlog,
        is_published: true,
        author: 'Vaibhav Kumar Mishra',
      });

      if (error) setStatus(`❌ Error saving blog: ${error.message}`);
      else {
        setStatus('🎉 Blog Published Successfully!');
        setGeneratedBlog('');
      }
    }

    setTopic('');
    setSelectedPath('');
    checkMissingTopics();
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center gap-2">
        <Wand2 className="text-purple-600 dark:text-purple-400" />
        Admin Content Generator
      </h1>

      {/* Mode Switcher */}
      <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 bg-gray-100 dark:bg-zinc-800 p-1.5 sm:p-2 rounded-lg w-fit">
        <button
          onClick={() => setContentType('flashcard')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-all ${contentType === 'flashcard' ? 'bg-white dark:bg-zinc-700 shadow-sm text-purple-600' : 'text-gray-500'}`}
        >
          <Layers className="w-4 h-4" /> Flashcards
        </button>
        <button
          onClick={() => setContentType('blog')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-all ${contentType === 'blog' ? 'bg-white dark:bg-zinc-700 shadow-sm text-purple-600' : 'text-gray-500'}`}
        >
          <FileText className="w-4 h-4" /> Blog Post
        </button>
      </div>

      {/* Pending Topics */}
      {pendingTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-3 text-orange-700 dark:text-orange-400 font-bold text-sm uppercase tracking-wide">
            <AlertCircle className="w-4 h-4" />
            <span>Missing Content ({pendingTopics.length})</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {pendingTopics.map((pt) => (
              <button
                key={pt.slug}
                onClick={() => autoFillTopic(pt)}
                className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-orange-200 dark:border-orange-500/30 rounded-lg text-sm hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-2 shadow-sm"
              >
                {pt.title}
                <Plus className="w-3 h-3 text-gray-400" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Section */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6 sm:mb-8">
        <label
          htmlFor="topic-input"
          className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
        >
          {contentType === 'flashcard' ? 'Topic for Flashcards' : 'Blog Title'}
        </label>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            id="topic-input" // 👈 Added ID for Accessibility
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={
              contentType === 'flashcard'
                ? 'e.g. Transformers'
                : 'e.g. A Deep Dive into Transformers'
            }
            title="Topic Input" // 👈 Added Title
            className="flex-1 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
          />

          {/* Learning Path Selector (only for flashcards) */}
          {contentType === 'flashcard' && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
              <select
                id="path-select"
                value={selectedPath}
                onChange={(e) => setSelectedPath(e.target.value)}
                title="Assign to Learning Path"
                className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-purple-500 text-foreground text-sm"
              >
                {PATH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors w-full sm:w-auto"
          >
            {loading ? (
              'Generating...'
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Generate
              </>
            )}
          </button>
        </div>
        {status && (
          <p className="mt-4 text-sm font-medium text-purple-600 dark:text-purple-400 animate-pulse">
            {status}
          </p>
        )}
      </div>

      {/* RESULT SECTION */}

      {/* 1. Flashcard Editor */}
      {contentType === 'flashcard' && generatedCards.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Review Cards ({generatedCards.length})</h2>
            <button
              onClick={addCard}
              className="text-sm bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-lg hover:bg-gray-200 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Card
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <AnimatePresence>
              {generatedCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-3 sm:p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm relative group"
                >
                  <button
                    onClick={() => deleteCard(idx)}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    aria-label="Delete card" // 👈 Added Aria Label
                    title="Delete Card"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mr-0 sm:mr-8">
                    <div>
                      <label
                        htmlFor={`question-${idx}`}
                        className="text-xs font-bold text-purple-600 uppercase mb-1 block"
                      >
                        Question
                      </label>
                      <textarea
                        id={`question-${idx}`} // 👈 Added ID
                        value={card.front || card.front_content}
                        onChange={(e) => updateCard(idx, 'front', e.target.value)}
                        title="Question content" // 👈 Added Title
                        className="w-full p-2 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm focus:ring-1 focus:ring-purple-500 outline-none resize-none h-20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`answer-${idx}`}
                        className="text-xs font-bold text-green-600 uppercase mb-1 block"
                      >
                        Answer
                      </label>
                      <textarea
                        id={`answer-${idx}`} // 👈 Added ID
                        value={card.back || card.back_content}
                        onChange={(e) => updateCard(idx, 'back', e.target.value)}
                        title="Answer content" // 👈 Added Title
                        className="w-full p-2 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm focus:ring-1 focus:ring-purple-500 outline-none resize-none h-20"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* 2. Blog Editor */}
      {contentType === 'blog' && generatedBlog && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h2 className="text-xl font-bold mb-4">Review Blog Content (Markdown)</h2>
          <label htmlFor="blog-content" className="sr-only">
            Blog Content
          </label>{' '}
          {/* 👈 Hidden Label */}
          <textarea
            id="blog-content" // 👈 Added ID
            value={generatedBlog}
            onChange={(e) => setGeneratedBlog(e.target.value)}
            className="w-full h-96 p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-purple-500"
          />
        </motion.div>
      )}

      {/* Publish Button */}
      {(generatedCards.length > 0 || generatedBlog) && (
        <button
          onClick={handleSaveToDB}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all sticky bottom-4 sm:bottom-8"
        >
          <Save className="w-5 h-5" />
          {contentType === 'flashcard' ? 'Publish Cards' : 'Publish Blog Post'}
        </button>
      )}
    </div>
  );
}
