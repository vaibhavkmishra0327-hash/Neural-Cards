import { supabase } from '../utils/supabase/client';
import { Database } from '../types/database.types';
import { learningPaths } from './learningPaths';
import { log } from '../utils/logger';
import { cache, CacheTTL } from '../utils/cache';

type Topic = Database['public']['Tables']['topics']['Row'];
type Flashcard = Database['public']['Tables']['flashcards']['Row'];

// Cache keys for API layer
const API_CACHE_KEYS = {
  TOPICS: 'api_topics',
  TOPICS_WITH_COUNT: 'api_topics_with_count',
  ALL_FLASHCARDS: 'api_all_flashcards',
  SUGGESTED_TOPICS: 'api_suggested_topics',
  FLASHCARDS_BY_TOPIC: (slug: string) => `api_flashcards_${slug}`,
} as const;

// 1. Topics fetch karna
export const getTopics = async () => {
  // Check cache first
  const cached = cache.get<Topic[]>(API_CACHE_KEYS.TOPICS);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    log.error('Error fetching topics:', error);
    return [];
  }

  cache.set(API_CACHE_KEYS.TOPICS, data, CacheTTL.FLASHCARDS);
  return data;
};

// 2. Flashcards fetch karna (with local fallback)
export const getFlashcardsByTopic = async (slug: string) => {
  log.info('Fetching topic for slug:', slug);

  try {
    // Step A: Topic ID nikalo from Supabase
    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('slug', slug)
      .single();

    const topic = topicData as Topic | null;

    if (!topicError && topic) {
      // Step B: Flashcards from Supabase
      const { data: cards, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('topic_id', topic.id);

      if (!error && cards && cards.length > 0) {
        return cards;
      }
    }
  } catch (err) {
    log.warn('Supabase fetch failed, using local data:', err);
  }

  // Step C: Fallback to local flashcard DB (dynamic import to avoid bundling 103KB eagerly)
  try {
    const { localFlashcardDB } = await import('./flashcardContent');
    const localCards = localFlashcardDB[slug];
    if (localCards && localCards.length > 0) {
      log.info('Using local flashcards for:', slug, `(${localCards.length} cards)`);
      return localCards;
    }
  } catch (importErr) {
    log.warn('Failed to load local flashcard DB:', importErr);
  }

  log.warn('No flashcards found for slug:', slug);
  return [];
};

// 3. ALL Flashcards fetch karna (for Practice Session)
export const getAllFlashcards = async () => {
  const cached = cache.get<Flashcard[]>(API_CACHE_KEYS.ALL_FLASHCARDS);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    log.error('Error fetching all flashcards:', error);
    return [];
  }

  cache.set(API_CACHE_KEYS.ALL_FLASHCARDS, data, CacheTTL.FLASHCARDS);
  return data;
};

// 3b. Topics WITH flashcard count (for Practice Hub)
export const getTopicsWithCardCount = async () => {
  // Check cache first (stale-while-revalidate)
  const cached = cache.getStale<(Topic & { cardCount: number })[]>(
    API_CACHE_KEYS.TOPICS_WITH_COUNT
  );
  if (cached && !cached.isStale) return cached.data;

  // Parallelize independent queries
  const [topicsResult, countResult, blogsResult] = await Promise.all([
    supabase.from('topics').select('*').order('created_at', { ascending: true }),
    supabase.from('flashcards').select('topic_id'),
    supabase.from('blogs').select('slug, topic_slug'),
  ]);

  const { data: topics, error: topicError } = topicsResult;
  if (topicError || !topics) {
    log.error('Error fetching topics:', topicError);
    // Return stale data if available
    if (cached) return cached.data;
    return [];
  }

  const { data: countData, error: countError } = countResult;
  if (countError) {
    log.error('Error fetching card counts:', countError);
    return topics
      .filter((topic) => topic.description !== 'Detailed Blog Post')
      .map((t) => ({ ...t, cardCount: 0 }));
  }

  const { data: blogs, error: blogError } = blogsResult;

  if (blogError) {
    log.error('Error fetching blogs for topic filter:', blogError);
  }

  const blogSlugs = new Set<string>();
  (blogs || []).forEach((blog: { slug: string; topic_slug: string | null }) => {
    if (blog.slug) blogSlugs.add(blog.slug);
    if (blog.topic_slug) blogSlugs.add(blog.topic_slug);
  });

  const practiceTopics = topics.filter((topic) => {
    if (topic.description === 'Detailed Blog Post') return false;
    if (blogSlugs.has(topic.slug)) return false;
    return true;
  });

  const countMap: Record<string, number> = {};
  (countData || []).forEach((row: { topic_id: string }) => {
    countMap[row.topic_id] = (countMap[row.topic_id] || 0) + 1;
  });

  const result = practiceTopics
    .map((t) => ({ ...t, cardCount: countMap[t.id] || 0 }))
    .filter((t) => t.cardCount > 0);

  cache.set(API_CACHE_KEYS.TOPICS_WITH_COUNT, result, CacheTTL.FLASHCARDS);
  return result;
};

// 4. Suggested Topics fetch karna
export const getSuggestedTopics = async () => {
  const cached = cache.get<Topic[]>(API_CACHE_KEYS.SUGGESTED_TOPICS);
  if (cached) return cached;

  const { data, error } = await supabase.from('topics').select('*').limit(3);

  if (error) {
    log.error('Error fetching suggested topics:', error);
    return [];
  }

  cache.set(API_CACHE_KEYS.SUGGESTED_TOPICS, data, CacheTTL.FLASHCARDS);
  return data;
};

// 👇 4. NEW: USER KI REAL PROGRESS NIKALNA (Fixed)
export const getUserProgress = async (userId: string) => {
  try {
    // A. User ka last completed topic nikalo (learning path progress)
    const { data } = await supabase
      .from('user_path_progress')
      .select('node_id, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1);

    const progressData = data ?? [];

    // B. Also check user_stats for last studied topic (from Practice Hub)
    const { data: statsData } = await supabase
      .from('user_stats')
      .select('last_topic_slug')
      .eq('user_id', userId)
      .single();

    const lastPracticedSlug = statsData?.last_topic_slug;

    // C. If no path progress but user has practiced a topic from Practice Hub
    if ((!progressData || progressData.length === 0) && lastPracticedSlug) {
      // Find which path this topic belongs to
      let practicePath = null;
      for (const path of learningPaths) {
        if (path.topics?.includes(lastPracticedSlug)) {
          practicePath = path;
          break;
        }
      }

      return {
        hasProgress: true,
        pathTitle: practicePath?.title || 'Continue Practicing',
        pathId: practicePath?.id || learningPaths[0].id,
        topicTitle: formatTitle(lastPracticedSlug),
        topicSlug: lastPracticedSlug,
        nextChapter: 'Last studied: ' + formatTitle(lastPracticedSlug),
        progress: 10,
        icon: practicePath?.icon || '🧠',
      };
    }

    // D. Brand new user (no progress at all)
    if (!progressData || progressData.length === 0) {
      const firstPath = learningPaths[0];
      const firstTopic = firstPath.topics[0];

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

    // E. Returning user with path progress -> Next Topic calculate karo
    const lastTopicSlug = progressData[0].node_id;

    // 1. Find which Path this slug belongs to
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
