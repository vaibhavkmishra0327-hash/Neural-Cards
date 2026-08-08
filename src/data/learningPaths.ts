import { LearningPath } from '../types';
import { supabase } from '../utils/supabase/client';

// 👇 1. Source data (kept as-is)
export const learningPaths: LearningPath[] = [
  {
    id: 'math-for-ml',
    title: 'Math for Machine Learning',
    description:
      'Master the mathematical foundations: linear algebra, calculus, probability & statistics',
    icon: '📐',
    color: 'from-blue-500 to-cyan-500',
    topics: [
      'vectors-matrices',
      'matrix-operations',
      'eigenvalues-eigenvectors',
      'derivatives-gradients',
      'partial-derivatives',
      'chain-rule',
      'probability-basics',
      'bayes-theorem',
      'distributions',
    ],
    estimatedHours: 40,
  },
  {
    id: 'python-for-ai',
    title: 'Python for AI',
    description: 'Learn Python libraries essential for AI: NumPy, Pandas, Matplotlib, and more',
    icon: '🐍',
    color: 'from-green-500 to-emerald-500',
    topics: [
      'numpy-basics',
      'array-operations',
      'pandas-dataframes',
      'data-manipulation',
      'matplotlib-basics',
      'seaborn-visualization',
      'scikit-learn-intro',
    ],
    estimatedHours: 30,
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning Fundamentals',
    description: 'From linear regression to ensemble methods - complete ML foundations',
    icon: '🤖',
    color: 'from-purple-500 to-pink-500',
    topics: [
      'supervised-learning',
      'linear-regression',
      'logistic-regression',
      'decision-trees',
      'random-forests',
      'svm',
      'kmeans-clustering',
      'pca',
      'gradient-descent',
      'regularization',
      'cross-validation',
      'bias-variance-tradeoff',
    ],
    estimatedHours: 60,
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning',
    description: 'Neural networks, CNNs, RNNs, and Transformers explained from scratch',
    icon: '🧠',
    color: 'from-orange-500 to-red-500',
    topics: [
      'neural-networks',
      'backpropagation',
      'activation-functions',
      'optimization-algorithms',
      'batch-normalization',
      'dropout',
      'convolutional-neural-networks',
      'pooling-layers',
      'transfer-learning',
      'recurrent-neural-networks',
      'lstm',
      'gru',
      'attention-mechanism',
      'transformers',
      'self-attention',
    ],
    estimatedHours: 80,
  },
  {
    id: 'modern-ai',
    title: 'Modern AI',
    description: 'LLMs, GPT, BERT, Diffusion Models, and cutting-edge AI architectures',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
    topics: [
      'word-embeddings',
      'word2vec',
      'bert',
      'gpt-architecture',
      'fine-tuning',
      'prompt-engineering',
      'rag',
      'diffusion-models',
      'stable-diffusion',
      'vision-transformers',
      'multimodal-models',
    ],
    estimatedHours: 50,
  },
  {
    id: 'mlops',
    title: 'MLOps & Deployment',
    description: 'Production ML: Docker, Kubernetes, model serving, monitoring & CI/CD',
    icon: '🚀',
    color: 'from-indigo-500 to-purple-500',
    topics: [
      'model-serialization',
      'docker-basics',
      'containerization',
      'model-serving',
      'rest-apis',
      'model-monitoring',
      'ab-testing',
      'feature-stores',
      'ml-pipelines',
      'kubernetes-ml',
    ],
    estimatedHours: 45,
  },
  {
    id: 'interview-prep',
    title: 'Interview Preparation',
    description: 'Ace ML/AI interviews with curated questions, coding challenges & system design',
    icon: '💼',
    color: 'from-pink-500 to-rose-500',
    topics: [
      'ml-interview-questions',
      'coding-ml-algorithms',
      'statistics-interview',
      'deep-learning-interview',
      'system-design-ml',
      'case-studies',
      'behavioral-questions',
    ],
    estimatedHours: 35,
  },
];

// 👇 2. Missing logic that was required for matching behavior

// Helper: Convert a slug to a title (e.g. 'linear-algebra' -> 'Linear Algebra')
const formatTitle = (slug: string) => {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Main Function — now fetches topics DYNAMICALLY from database
export const getLearningPath = async (slug: string) => {
  // 1. Find the path (metadata still comes from config — title, icon, color, etc.)
  const path = learningPaths.find((p) => p.id === slug);

  if (!path) return null;

  // 2. Fetch topics from DB where learning_path matches this path's id
  const { data: dbTopics, error } = await supabase
    .from('topics')
    .select('slug, title')
    .eq('learning_path', slug)
    .order('created_at', { ascending: true });

  // 3. Use DB topics if available, otherwise fall back to hardcoded list
  const topicList =
    dbTopics && dbTopics.length > 0
      ? dbTopics.map((t: { slug: string; title: string }) => ({
          slug: t.slug,
          title: t.title,
        }))
      : path.topics.map((topicSlug) => ({
          slug: topicSlug,
          title: formatTitle(topicSlug),
        }));

  // 4. Convert the topics array into "nodes"
  const nodes = topicList.map((t: { slug: string; title: string }, index: number) => ({
    id: t.slug,
    topic_slug: t.slug,
    title: t.title,
    description: 'Tap to start learning',
    status: index === 0 ? 'unlocked' : 'locked',
    step_order: index + 1,
    position_x: index % 2 === 0 ? 100 : 300,
    position_y: (index + 1) * 160,
  }));

  if (error) {
    console.warn('Failed to fetch topics from DB, using fallback:', error.message);
  }

  // 5. Return the formatted data
  return {
    ...path,
    slug: path.id,
    nodes: nodes,
    total_nodes: nodes.length,
    completed_nodes: 0,
  };
};

// Mock function for progress updates
export const completeNode = async (nodeId: string, _userId: string) => {
  console.warn('Completed:', nodeId);
  return Promise.resolve();
};
