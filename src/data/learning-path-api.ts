import { supabase } from '../utils/supabase/client';
import { LearningPath, PathNode } from '../types/learning-path.types';
import { log } from '../utils/logger';
import { learningPaths } from './learningPaths';

// Helper: Slug ko Title me convert karo (e.g. 'linear-algebra' -> 'Linear Algebra')
const formatTitle = (slug: string) => {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Local fallback: Build path from learningPaths.ts data
const getLocalLearningPath = async (
  pathSlug: string,
  userId: string
): Promise<LearningPath | null> => {
  const path = learningPaths.find((p) => p.id === pathSlug);
  if (!path) return null;

  // Try to get user progress from Supabase
  const completedSlugs: Set<string> = new Set();
  try {
    const { data: progressData } = await supabase
      .from('user_path_progress')
      .select('node_id, status')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (progressData) {
      progressData.forEach((p) => completedSlugs.add(p.node_id));
    }
  } catch {
    // No progress data available — all locked except first
  }

  // Build nodes from local topics array
  const nodes: PathNode[] = path.topics.map((topicSlug, index) => {
    const isCompleted = completedSlugs.has(topicSlug);
    // Unlock first node, and any node whose predecessor is completed
    const prevCompleted = index === 0 || completedSlugs.has(path.topics[index - 1]);
    let status: 'locked' | 'unlocked' | 'completed' = 'locked';

    if (isCompleted) {
      status = 'completed';
    } else if (prevCompleted) {
      status = 'unlocked';
    }

    return {
      id: topicSlug, // Use slug as ID for local data
      path_id: path.id,
      title: formatTitle(topicSlug),
      description: 'Tap to start learning',
      topic_slug: topicSlug,
      step_order: index + 1,
      position_x: index % 2 === 0 ? 100 : 300,
      position_y: (index + 1) * 160,
      status,
    };
  });

  const completedCount = nodes.filter((n) => n.status === 'completed').length;

  return {
    id: path.id,
    title: path.title,
    description: path.description,
    slug: path.id,
    nodes,
    total_nodes: nodes.length,
    completed_nodes: completedCount,
  };
};

export const getLearningPath = async (
  pathSlug: string,
  userId: string
): Promise<LearningPath | null> => {
  try {
    // 1️⃣ Try Supabase first
    const { data: pathData, error: pathError } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('slug', pathSlug)
      .single();

    if (pathError || !pathData) {
      log.warn('Path not in Supabase, using local data:', pathSlug);
      return getLocalLearningPath(pathSlug, userId);
    }

    // 2️⃣ Get Supabase nodes
    const { data: nodesData, error: nodesError } = await supabase
      .from('path_nodes')
      .select('*')
      .eq('path_id', pathData.id)
      .order('step_order', { ascending: true });

    // Check if local data has more nodes than Supabase
    const localPath = learningPaths.find((p) => p.id === pathSlug);
    const localNodeCount = localPath?.topics.length ?? 0;
    const supabaseNodeCount = nodesData?.length ?? 0;

    // Fall back to local if Supabase has fewer nodes or errored
    if (nodesError || !nodesData || supabaseNodeCount === 0 || supabaseNodeCount < localNodeCount) {
      log.warn(
        `Supabase has ${supabaseNodeCount} nodes, local has ${localNodeCount} — using local:`,
        pathSlug
      );
      return getLocalLearningPath(pathSlug, userId);
    }

    // 3️⃣ User ki Progress Lao
    const { data: progressData } = await supabase
      .from('user_path_progress')
      .select('node_id, status')
      .eq('user_id', userId);

    const safeProgress = progressData || [];

    // 4️⃣ Nodes + Progress Merge Karo
    const mergedNodes: PathNode[] = nodesData.map((node) => {
      const userProgress = safeProgress.find((p) => p.node_id === node.id);

      let status: 'locked' | 'unlocked' | 'completed' = 'locked';

      if (userProgress) {
        status = userProgress.status as 'locked' | 'unlocked' | 'completed';
      } else {
        if (node.step_order === 1) {
          status = 'unlocked';
        }
      }

      return {
        id: node.id,
        path_id: node.path_id,
        title: node.title,
        description: node.description,
        topic_slug: node.topic_slug,
        step_order: node.step_order,
        position_x: node.position_x,
        position_y: node.position_y,
        status: status,
      };
    });

    // 5️⃣ Chaining Logic
    let completedCount = 0;

    for (let i = 0; i < mergedNodes.length; i++) {
      if (mergedNodes[i].status === 'completed') {
        completedCount++;
        if (i + 1 < mergedNodes.length && mergedNodes[i + 1].status === 'locked') {
          mergedNodes[i + 1].status = 'unlocked';
        }
      }
    }

    return {
      id: pathData.id,
      title: pathData.title,
      description: pathData.description,
      slug: pathData.slug,
      nodes: mergedNodes,
      total_nodes: mergedNodes.length,
      completed_nodes: completedCount,
    };
  } catch (error) {
    log.error('Unexpected error in getLearningPath, falling back to local:', error);
    return getLocalLearningPath(pathSlug, userId);
  }
};

export const completeNode = async (nodeId: string, userId: string) => {
  try {
    const { error } = await supabase.from('user_path_progress').upsert(
      {
        user_id: userId,
        node_id: nodeId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, node_id' }
    );

    if (error) throw error;
  } catch (error) {
    log.error('Error marking node complete:', error);
  }
};
