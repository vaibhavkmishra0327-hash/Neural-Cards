export interface PathNode {
  id: string;
  path_id: string;
  title: string;
  description: string | null; // ✅ null allowed
  topic_slug: string | null; // ✅ null allowed
  step_order: number;
  position_x: number;
  position_y: number;
  status: 'locked' | 'unlocked' | 'completed';
}

export interface LearningPath {
  id: string;
  title: string;
  description: string | null; // ✅ null allowed
  slug: string;
  nodes: PathNode[];
  total_nodes: number;
  completed_nodes: number;
}
