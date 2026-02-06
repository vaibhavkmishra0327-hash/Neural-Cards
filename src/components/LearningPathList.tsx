import { motion } from 'framer-motion';
import {
  Calculator,
  FileCode,
  Bot,
  Brain,
  Zap,
  Rocket,
  ArrowRight,
  Clock,
  BookOpen,
} from 'lucide-react';

// 👇 Note: Prop ka naam 'onPathSelect' rakha hai (App.tsx me bhi yahi use karna)
interface LearningPathListProps {
  onPathSelect: (slug: string) => void;
}

export function LearningPathList({ onPathSelect }: LearningPathListProps) {
  // 👇 Data wohi hai, bas ID match kar lena 'src/data/learning-paths.ts' se
  const paths = [
    {
      id: 'math-for-ml', // Slug match hona chahiye
      title: 'Math for Machine Learning',
      description:
        'Master the mathematical foundations: linear algebra, calculus, probability & statistics.',
      topicsCount: '9 Topics',
      duration: '~40 hours',
      icon: <Calculator className="w-8 h-8 text-blue-500" />,
      color: 'border-blue-500/20 bg-blue-500/5',
    },
    {
      id: 'python-for-ai',
      title: 'Python for AI',
      description: 'Learn Python libraries essential for AI: NumPy, Pandas, Matplotlib, and more.',
      topicsCount: '7 Topics',
      duration: '~30 hours',
      icon: <FileCode className="w-8 h-8 text-green-500" />,
      color: 'border-green-500/20 bg-green-500/5',
    },
    {
      id: 'ml-fundamentals', // Slug match
      title: 'Machine Learning Fundamentals',
      description: 'From linear regression to ensemble methods - complete ML foundations.',
      topicsCount: '12 Topics',
      duration: '~60 hours',
      icon: <Bot className="w-8 h-8 text-pink-500" />,
      color: 'border-pink-500/20 bg-pink-500/5',
    },
    {
      id: 'deep-learning',
      title: 'Deep Learning',
      description: 'Neural networks, CNNs, RNNs, and Transformers explained from scratch.',
      topicsCount: '15 Topics',
      duration: '~80 hours',
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      color: 'border-purple-500/20 bg-purple-500/5',
    },
    {
      id: 'modern-ai',
      title: 'Modern AI',
      description: 'LLMs, GPT, BERT, Diffusion Models, and cutting-edge AI architectures.',
      topicsCount: '11 Topics',
      duration: '~50 hours',
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      color: 'border-yellow-500/20 bg-yellow-500/5',
    },
    {
      id: 'mlops',
      title: 'MLOps & Deployment',
      description: 'Production ML: Docker, Kubernetes, model serving, monitoring & CI/CD.',
      topicsCount: '10 Topics',
      duration: '~45 hours',
      icon: <Rocket className="w-8 h-8 text-orange-500" />,
      color: 'border-orange-500/20 bg-orange-500/5',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-gray-400"
          >
            AI Learning Roadmap
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            A structured path to go from zero to AI Engineer. Select a module to start learning
            concepts, practicing flashcards, and tracking progress.
          </motion.p>
        </div>

        {/* Grid Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path, idx) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-2xl border ${path.color} bg-white dark:bg-[#0a0a0a] hover:bg-slate-50 dark:hover:bg-[#111] transition-colors cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-xl`}
              onClick={() => onPathSelect(path.id)} // Corrected prop usage
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-100 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 group-hover:scale-110 transition-transform duration-300">
                  {path.icon}
                </div>
                <div className="text-xs font-mono text-slate-500 dark:text-gray-500 flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                  <BookOpen className="w-3 h-3" />
                  {path.topicsCount}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors">
                {path.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-6 leading-relaxed line-clamp-2">
                {path.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{path.duration}</span>
                </div>

                <div className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-purple-500 opacity-100 md:opacity-0 md:-translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all duration-300">
                  <span>Start</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Subtle Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
