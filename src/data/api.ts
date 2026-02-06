import { supabase } from '../utils/supabase/client';
import { Database } from '../types/database.types';
import { learningPaths } from './learningPaths';
import { log } from '../utils/logger';

type Topic = Database['public']['Tables']['topics']['Row'];

// 1. Topics fetch karna
export const getTopics = async () => {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    log.error('Error fetching topics:', error);
    return [];
  }
  return data;
};

// 2. Flashcards fetch karna
export const getFlashcardsByTopic = async (slug: string) => {
  log.info('Fetching topic for slug:', slug);

  // Step A: Topic ID nikalo
  const { data: topicData, error: topicError } = await supabase
    .from('topics')
    .select('*')
    .eq('slug', slug)
    .single();

  const topic = topicData as Topic | null;

  if (topicError || !topic) {
    log.warn('Topic not found in DB:', slug);
    return [];
  }

  // Step B: Flashcards mangwao
  const { data: cards, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('topic_id', topic.id);

  if (error) {
    log.error('Error fetching cards:', error);
    return [];
  }

  return cards;
};

// 3. ALL Flashcards fetch karna (for Practice Session)
export const getAllFlashcards = async () => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    log.error('Error fetching all flashcards:', error);
    return [];
  }
  return data;
};

// 3b. Topics WITH flashcard count (for Practice Hub)
export const getTopicsWithCardCount = async () => {
  const { data: topics, error: topicError } = await supabase
    .from('topics')
    .select('*')
    .order('created_at', { ascending: true });

  if (topicError || !topics) {
    log.error('Error fetching topics:', topicError);
    return [];
  }

  // Get flashcard counts per topic
  const { data: countData, error: countError } = await supabase
    .from('flashcards')
    .select('topic_id');

  if (countError) {
    log.error('Error fetching card counts:', countError);
    return topics.map((t) => ({ ...t, cardCount: 0 }));
  }

  const countMap: Record<string, number> = {};
  (countData || []).forEach((row: { topic_id: string }) => {
    countMap[row.topic_id] = (countMap[row.topic_id] || 0) + 1;
  });

  return topics.map((t) => ({ ...t, cardCount: countMap[t.id] || 0 }));
};

// 4. Suggested Topics fetch karna
export const getSuggestedTopics = async () => {
  const { data, error } = await supabase.from('topics').select('*').limit(3);

  if (error) {
    log.error('Error fetching suggested topics:', error);
    return [];
  }
  return data;
};

// 👇 4. NEW: USER KI REAL PROGRESS NIKALNA (Fixed)
export const getUserProgress = async (userId: string) => {
  try {
    // A. User ka last completed topic nikalo
    const { data } = await supabase
      .from('user_path_progress')
      .select('node_id, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1);

    const progressData = data ?? [];

    // B. Agar user bilkul naya hai (No progress)
    if (!progressData || progressData.length === 0) {
      const firstPath = learningPaths[0]; // Math for ML
      const firstTopic = firstPath.topics[0]; // Vectors Matrices

      return {
        hasProgress: false,
        pathTitle: firstPath.title,
        pathId: firstPath.id,
        topicTitle: 'Start Your Journey',
        topicSlug: firstTopic,
        nextChapter: 'Chapter 1: ' + formatTitle(firstTopic),
        progress: 0,
        icon: firstPath.icon,
      };
    }

    // C. Agar purana khiladi hai -> Next Topic calculate karo
    // 👇 Ab yahan error nahi aayega
    const lastTopicSlug = progressData[0].node_id;

    // 1. Pata lagao ye slug kis Path mein hai
    let foundPath = null;
    let foundIndex = -1;

    for (const path of learningPaths) {
      if (path.topics) {
        const idx = path.topics.findIndex((t: string) => t === lastTopicSlug);
        if (idx !== -1) {
          foundPath = path;
          foundIndex = idx;
          break;
        }
      }
    }

    if (!foundPath) return null;

    // 2. Next Topic Logic
    const nextIndex = foundIndex + 1;
    const isPathFinished = nextIndex >= foundPath.topics.length;

    const currentSlug = isPathFinished ? lastTopicSlug : foundPath.topics[nextIndex];
    const displayTitle = isPathFinished ? 'Path Completed! 🎉' : formatTitle(currentSlug);
    const chapterText = isPathFinished
      ? 'All chapters done'
      : `Chapter ${nextIndex + 1}: ${formatTitle(currentSlug)}`;
    const percent = Math.round(((foundIndex + 1) / foundPath.topics.length) * 100);

    return {
      hasProgress: true,
      pathTitle: foundPath.title,
      pathId: foundPath.id,
      topicTitle: displayTitle,
      topicSlug: currentSlug,
      nextChapter: chapterText,
      progress: isPathFinished ? 100 : percent,
      icon: foundPath.icon,
    };
  } catch (error) {
    log.error('Progress Error:', error);
    return null;
  }
};

// Helper
const formatTitle = (slug: string) => {
  if (!slug) return '';
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};
