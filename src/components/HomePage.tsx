import { Brain, Zap, Target, TrendingUp, BookOpen, Code, Award, Play, Clock, ArrowRight } from 'lucide-react';
import { learningPaths } from '../data/learningPaths';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { getUserProgress } from '../data/api';
import { supabase } from '../utils/supabase/client';
import { SEOHead } from './SEOHead';

interface HomePageProps {
  onNavigate?: (page: string, data?: any) => void;
  isAuthenticated?: boolean;
}

export function HomePage({ onNavigate, isAuthenticated = false }: HomePageProps) {
  // 👇 State for Real User Session Data
  const [lastSession, setLastSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(false);

  // 👇 Fetch Real Data on Mount
  useEffect(() => {
    if (isAuthenticated) {
      const fetchProgress = async () => {
        setLoadingSession(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const progress = await getUserProgress(user.id);
          setLastSession(progress);
        }
        setLoadingSession(false);
      };
      fetchProgress();
    }
  }, [isAuthenticated]);

  const handlePathClick = (pathId: string) => {
    if (onNavigate) {
      onNavigate('paths', { selectedPath: pathId });
    }
  };

  const handleGetStarted = () => {
    if (onNavigate) {
      onNavigate('auth');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead seo={{
        title: 'NeuralCards - Master AI with Interactive Flashcards',
        description: 'Learn AI, Machine Learning, and Deep Learning with interactive flashcards, spaced repetition, and structured learning paths.',
        canonical: 'https://neuralcards.com',
      }} />
      
      {/* CONDITIONAL HERO SECTION */}
      {isAuthenticated ? (
        <UserHero 
          onNavigate={onNavigate} 
          sessionData={lastSession} 
          isLoading={loadingSession} 
        />
      ) : (
        <GuestHero onGetStarted={handleGetStarted} onNavigate={onNavigate} />
      )}

      {/* Features Section with 3D Cards (Only show for guests) */}
      {!isAuthenticated && (
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose NeuralCards?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Learn smarter with science-backed methods designed for complex technical concepts
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={<Brain className="h-12 w-12 text-blue-600" />}
                title="Spaced Repetition"
                description="Review concepts at scientifically optimized intervals for 3x better long-term retention"
                delay={0}
              />
              <FeatureCard
                icon={<Zap className="h-12 w-12 text-purple-600" />}
                title="Interactive Flashcards"
                description="Swipe-based learning with code snippets, visualizations, and real-world examples"
                delay={0.1}
              />
              <FeatureCard
                icon={<Target className="h-12 w-12 text-green-600" />}
                title="Structured Paths"
                description="Follow curated learning paths from fundamentals to advanced AI topics"
                delay={0.2}
              />
              <FeatureCard
                icon={<TrendingUp className="h-12 w-12 text-orange-600" />}
                title="Progress Tracking"
                description="Monitor your learning journey with detailed analytics and achievement badges"
                delay={0.3}
              />
              <FeatureCard
                icon={<BookOpen className="h-12 w-12 text-red-600" />}
                title="Comprehensive Content"
                description="Cover Math for ML, Python, Machine Learning, Deep Learning, and Modern AI"
                delay={0.4}
              />
              <FeatureCard
                icon={<Code className="h-12 w-12 text-indigo-600" />}
                title="Interview Ready"
                description="Practice questions and concepts asked at top tech companies"
                delay={0.5}
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Learning Paths Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isAuthenticated ? "Your Learning Library" : "Featured Learning Paths"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isAuthenticated ? "Continue where you left off or explore new domains" : "Structured curricula designed to take you from beginner to expert"}
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {learningPaths.slice(0, 6).map((path, index) => (
              <LearningPathCard
                key={path.id}
                path={path}
                onClick={() => handlePathClick(path.id)}
                delay={index * 0.1}
              />
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.button
              onClick={() => onNavigate && onNavigate('paths')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              View All Learning Paths
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white overflow-hidden relative">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="grid md:grid-cols-4 gap-8 text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <StatCard number="1000+" label="Flashcards" delay={0} />
            <StatCard number="100+" label="Topics Covered" delay={0.1} />
            <StatCard number="7" label="Learning Paths" delay={0.2} />
            <StatCard number="3x" label="Better Retention" delay={0.3} />
          </motion.div>
        </div>
      </section>

      {/* CTA Section (Only for guests) */}
      {!isAuthenticated && (
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl p-12 text-center relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Award className="h-16 w-16 text-blue-600 mx-auto mb-6" />
              </motion.div>
              
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Start Your AI Learning Journey Today
              </motion.h2>
              
              <motion.p 
                className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Join thousands of students mastering Machine Learning and AI through effective, 
                science-backed learning methods.
              </motion.p>
              
              <motion.button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.button>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}

// =================================================================
// 1. GUEST HERO (EXACTLY AS PROVIDED - NO CHANGES)
// =================================================================
function GuestHero({ onGetStarted, onNavigate }: { onGetStarted: () => void, onNavigate?: (page: string) => void }) {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"
            animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
            animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <motion.div 
            className="max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 mb-6 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="h-5 w-5" />
              </motion.div>
              <span className="text-sm font-medium">Science-Backed Learning</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Master AI/ML with Spaced Repetition
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              NeuralCards helps you learn and retain complex Machine Learning and AI concepts through 
              interactive flashcards and proven spaced repetition algorithms.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg shadow-xl"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Get Started Free
              </motion.button>
              <motion.button 
                onClick={() => onNavigate && onNavigate('paths')}
                className="px-8 py-4 bg-blue-500/20 border-2 border-white text-white rounded-lg hover:bg-blue-500/30 transition-colors font-semibold text-lg backdrop-blur-sm"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Explore Learning Paths
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
    </section>
  );
}

// =================================================================
// 2. USER HERO (INDUSTRY STANDARD DASHBOARD HEADER) - NOW DYNAMIC!
// =================================================================
function UserHero({ onNavigate, sessionData, isLoading }: { onNavigate?: (page: string, data?: any) => void, sessionData?: any, isLoading?: boolean }) {
  
  // Logic to handle "Resume" click
  const handleResume = () => {
    if (onNavigate && sessionData) {
      if (sessionData.hasProgress) {
        // Go to specific topic to continue
        onNavigate('practice', { slug: sessionData.topicSlug, title: sessionData.topicTitle });
      } else {
        // Start from beginning
        onNavigate('paths', { selectedPath: sessionData.pathId });
      }
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-900 to-indigo-900 text-white overflow-hidden py-24 md:py-28">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Left Column: Welcome & Status */}
          <div className="md:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Ready to Learn
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Welcome back, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-300">
                  Future AI Expert!
                </span>
              </h1>
              
              <p className="text-lg text-slate-300 mb-8 max-w-lg leading-relaxed">
                {isLoading ? "Syncing your progress..." : 
                 sessionData?.hasProgress 
                 ? "Your brain is ready for another session. Continue where you left off." 
                 : "Your journey to mastering AI starts today. Let's begin with the fundamentals."}
              </p>

              <div className="flex gap-4">
                <motion.button 
                  onClick={() => onNavigate && onNavigate('dashboard')}
                  className="px-6 py-3 bg-white text-indigo-900 rounded-lg hover:bg-indigo-50 transition-colors font-bold text-lg shadow-xl flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TrendingUp className="w-5 h-5" />
                  Go to Dashboard
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Intelligent "Resume" Card */}
          <motion.div 
            className="md:w-[450px] w-full"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-colors duration-500" />
              
              {isLoading ? (
                  // Simple Loading State (No layout shift)
                  <div className="h-40 flex items-center justify-center text-slate-400">Loading progress...</div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {sessionData?.hasProgress ? "Last Session" : "Recommended Start"}
                    </h3>
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-200 text-xs rounded font-mono">
                      {sessionData?.hasProgress ? "In Progress" : "New"}
                    </span>
                  </div>

                  {/* Suggested Content Card (Dynamic Data Injected Here) */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shrink-0">
                      {sessionData?.icon || '🚀'}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">
                        {sessionData?.pathTitle || "Loading..."}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {sessionData?.nextChapter || "Start your journey"}
                      </p>
                      
                      {/* Mini Progress Bar */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]" 
                            initial={{ width: 0 }}
                            animate={{ width: `${sessionData?.progress || 0}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                        <span className="text-xs text-blue-300 font-medium">
                          {sessionData?.progress || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <motion.button 
                    onClick={handleResume}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg group-hover:shadow-blue-500/25 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {sessionData?.hasProgress ? "Resume Learning" : "Start First Lesson"}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// --- SUB COMPONENTS (UNCHANGED) ---

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="bg-card border rounded-xl p-6 cursor-pointer"
      style={{ perspective: '1000px' }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        y: -10,
        transition: { duration: 0.3 }
      }}
    >
      <motion.div
        animate={{
          rotateX: isHovered ? 10 : 0,
          rotateY: isHovered ? 5 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div 
          className="mb-4"
          animate={{
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </motion.div>
    </motion.div>
  );
}

interface LearningPathCardProps {
  path: any;
  onClick: () => void;
  delay?: number;
}

function LearningPathCard({ path, onClick, delay = 0 }: LearningPathCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      className="bg-card border rounded-xl p-6 text-left relative overflow-hidden h-full"
      style={{ perspective: '1000px' }}
      initial={{ opacity: 0, rotateY: -20 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        y: -15,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Gradient Overlay on Hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          rotateX: isHovered ? 5 : 0,
          rotateY: isHovered ? 3 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex flex-col h-full"
      >
        <div className="flex items-center gap-3 mb-4 relative">
          <motion.div 
            className="text-4xl"
            animate={{
              scale: isHovered ? 1.2 : 1,
              rotate: isHovered ? 10 : 0,
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {path.icon}
          </motion.div>
          <div className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {path.topics.length} Topics
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-2">
          {path.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {path.description}
        </p>
        
        <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-border/50">
          <span className="text-muted-foreground flex items-center gap-1">
             <Clock className="w-3 h-3" /> ~{path.estimatedHours}h
          </span>
          <motion.span 
            className="text-primary font-medium inline-flex items-center gap-1"
            animate={{
              x: isHovered ? 5 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            Start <ArrowRight className="w-3 h-3" />
          </motion.span>
        </div>
      </motion.div>
    </motion.button>
  );
}

interface StatCardProps {
  number: string;
  label: string;
  delay?: number;
}

function StatCard({ number, label, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{
        scale: 1.1,
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.5 }
      }}
    >
      <motion.div 
        className="text-5xl font-bold mb-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      >
        {number}
      </motion.div>
      <div className="text-blue-100 text-lg">{label}</div>
    </motion.div>
  );
}