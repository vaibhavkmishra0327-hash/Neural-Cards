export interface PathNode {
  id: string;
  path_id: string;
  title: string;
  description: string | null; // ✅ Null allow kiya
  topic_slug: string | null; // ✅ Null allow kiya
  step_order: number;
  position_x: number;
  position_y: number;
  status: 'locked' | 'unlocked' | 'completed';
}

export interface LearningPath {
  id: string;
  title: string;
  description: string | null; // ✅ Null allow kiya
  slug: string;
  nodes: PathNode[];
  total_nodes: number;
  completed_nodes: number;
}
