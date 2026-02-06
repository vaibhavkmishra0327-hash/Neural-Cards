import { useEffect, useState } from 'react';
import { Check, Lock, Play, Star, ArrowLeft, Trophy } from 'lucide-react';
import { getLearningPath } from '../data/learning-path-api';
import { LearningPath } from '../types/learning-path.types';

interface LearningPathViewProps {
  pathSlug: string;
  userId: string;
  onBack: () => void;
  // 👇 UPDATE: nodeId add kiya hai taaki progress track ho sake
  onNodeClick: (nodeSlug: string, nodeTitle: string, nodeId: string) => void;
}

export function LearningPathView({ pathSlug, userId, onBack, onNodeClick }: LearningPathViewProps) {
  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPath();
  }, [pathSlug]);

  const loadPath = async () => {
    setLoading(true);
    const data = await getLearningPath(pathSlug, userId);
    setPath(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="text-center py-20 text-white">
        <h2 className="text-xl font-bold">Path not found 😕</h2>
        <button onClick={onBack} className="text-purple-500 hover:underline mt-4">Go Back</button>
      </div>
    );
  }

  // Progress Percentage
  const progressPercent = path.total_nodes > 0 
    ? Math.round((path.completed_nodes / path.total_nodes) * 100) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      
      {/* 1. Header Section */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Paths
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-16 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy className="h-32 w-32 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{path.title}</h1>
        <p className="text-slate-400 mb-6 max-w-lg">{path.description}</p>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
          {/* eslint-disable-next-line react/forbid-dom-props */}
          <div 
            className="bg-green-500 h-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-right text-green-400 text-sm mt-2 font-bold">{progressPercent}% Completed</p>
      </div>

      {/* 2. The Clean Zig-Zag Roadmap */}
      <div className="relative flex flex-col items-center pb-20">
        
        {/* Center Line (Background) */}
        <div className="absolute top-0 bottom-0 w-1 bg-slate-800 rounded-full z-0" />

        {path.nodes.map((node, index) => {
          // Zig-Zag Logic: Even = Left, Odd = Right
          const isLeft = index % 2 === 0;
          
          const isLocked = node.status === 'locked';
          const isCompleted = node.status === 'completed';
          const isCurrent = node.status === 'unlocked';

          return (
            <div key={node.id} className={`w-full flex ${isLeft ? 'justify-start' : 'justify-end'} mb-16 relative z-10`}>
              
              {/* Half-Width Container (Alignment fix) */}
              <div className={`w-1/2 flex ${isLeft ? 'justify-end pr-10' : 'justify-start pl-10'} items-center relative`}>
                
                {/* Horizontal Connector Line */}
                <div className={`absolute top-1/2 h-1 bg-slate-800 w-10 -z-10 ${isLeft ? 'right-0' : 'left-0'}`} />

                {/* THE NODE BUTTON */}
                <div className="relative group flex flex-col items-center">
                  
                  {/* Floating Title Label */}
                  <div className={`absolute -top-10 w-48 text-center text-sm font-bold transition-all duration-300
                    ${isCurrent ? 'text-purple-400 scale-105' : 'text-slate-500'}
                    ${isLocked ? 'opacity-50' : 'opacity-100'}
                  `}>
                    {node.title}
                  </div>

                  <button
                    onClick={() => {
                      if (!isLocked) {
                        // 👇 FIX: Null check (|| '') aur nodeId pass kar diya
                        onNodeClick(node.topic_slug || '', node.title, node.id);
                      }
                    }}
                    disabled={isLocked}
                    className={`
                      w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl transition-all duration-300 transform
                      ${getNodeStyles(node.status)}
                      ${isCurrent ? 'hover:scale-110 active:scale-95 animate-pulse' : 'hover:scale-105'}
                    `}
                  >
                    {/* Icons */}
                    {isCompleted && <Check className="h-8 w-8 text-white" strokeWidth={4} />}
                    {isCurrent && <Play className="h-8 w-8 text-white fill-current ml-1" />}
                    {isLocked && <Lock className="h-6 w-6 text-slate-500" />}
                    
                    {/* Star Badge */}
                    {isCompleted && (
                      <div className="absolute -right-1 -bottom-1 bg-yellow-400 rounded-full p-1.5 border-2 border-white shadow-sm">
                        <Star className="h-3 w-3 text-white fill-current" />
                      </div>
                    )}
                  </button>

                  {/* Ripple Effect for Current Node */}
                  {isCurrent && (
                    <div className="absolute top-0 left-0 w-20 h-20 bg-purple-500 rounded-full opacity-20 animate-ping -z-10" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper for Styles
function getNodeStyles(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-600 border-green-400 shadow-green-900/50';
    case 'unlocked':
      return 'bg-purple-600 border-purple-400 shadow-purple-900/50';
    default: // locked
      return 'bg-slate-800 border-slate-700 cursor-not-allowed';
  }
}