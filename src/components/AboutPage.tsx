import { motion } from 'framer-motion';
import { Brain, Zap, Target, Github } from 'lucide-react'; // Twitter hata diya

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-foreground">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          About NeuralCards
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          NeuralCards is an intelligent learning platform designed to help you master complex topics through the power of <span className="font-semibold text-foreground">Spaced Repetition</span> and <span className="font-semibold text-foreground">Active Recall</span>.
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        <motion.div 
          whileHover={{ y: -5 }}
          className="p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm"
        >
          <Zap className="w-8 h-8 text-yellow-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Science-Backed</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Based on the forgetting curve, our algorithm schedules reviews exactly when you need them most.
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm"
        >
          <Target className="w-8 h-8 text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Focused Learning</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Distraction-free interface optimized for deep work and long-term retention of concepts.
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm"
        >
          <Brain className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">AI Powered</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Smart content generation and adaptive difficulty that grows with your knowledge.
          </p>
        </motion.div>
      </div>

      {/* Developer Section */}
      <div className="max-w-2xl mx-auto text-center border-t border-gray-200 dark:border-zinc-800 pt-12">
        <h2 className="text-2xl font-bold mb-4">Built for Learners</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          This project is open source and built with modern web technologies like React, Tailwind CSS, and Supabase.
        </p>
        <div className="flex justify-center gap-4">
          {/* 👇 GitHub Link Updated */}
          <a 
            href="https://github.com/vaibhavkmishra0327-hash" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            <Github className="w-5 h-5" />
            GitHub Profile
          </a>
        </div>
      </div>
    </div>
  );
}