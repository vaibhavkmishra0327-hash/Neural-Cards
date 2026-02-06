import { supabase } from '../utils/supabase/client';
import { LearningPath, PathNode } from '../types/learning-path.types';
import { log } from '../utils/logger';

export const getLearningPath = async (pathSlug: string, userId: string): Promise<LearningPath | null> => {
  try {
    // 1️⃣ Path Details Lao
    const { data: pathData, error: pathError } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('slug', pathSlug)
      .single();

    if (pathError || !pathData) {
      log.error('Path Error:', pathError);
      return null;
    }

    // 2️⃣ Saare Nodes Lao
    const { data: nodesData, error: nodesError } = await supabase
      .from('path_nodes')
      .select('*')
      .eq('path_id', pathData.id)
      .order('step_order', { ascending: true });

    if (nodesError || !nodesData) {
      log.error('Nodes Error:', nodesError);
      return null;
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
        status: status 
      };
    });

    // 5️⃣ Chaining Logic
    let completedCount = 0;
    
    for (let i = 0; i < mergedNodes.length; i++) {
      if (mergedNodes[i].status === 'completed') {
        completedCount++;
        if (i + 1 < mergedNodes.length && mergedNodes[i+1].status === 'locked') {
          mergedNodes[i+1].status = 'unlocked';
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
      completed_nodes: completedCount
    };

  } catch (error) {
    log.error('Unexpected error in getLearningPath:', error);
    return null;
  }
};

export const completeNode = async (nodeId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('user_path_progress')
      .upsert({
        user_id: userId,
        node_id: nodeId,
        status: 'completed',
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id, node_id' });

    if (error) throw error;
  } catch (error) {
    log.error('Error marking node complete:', error);
  }
};