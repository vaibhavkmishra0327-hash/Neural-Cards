import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { log } from '../utils/logger';

interface BlogPostProps {
  slug: string;
  onBack: () => void;
}

export function BlogPost({ slug, onBack }: BlogPostProps) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      log.error('Error fetching post:', error);
    } else {
      setPost(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content: string) => {
    const words = content.split(' ').length;
    return Math.ceil(words / 200) + ' min read';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 container mx-auto px-4 max-w-4xl">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-24 bg-gray-200 dark:bg-zinc-800 rounded mb-8"></div>
          <div className="h-12 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded"></div>
          <div className="space-y-4">
             <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full"></div>
             <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-5/6"></div>
             <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <button onClick={onBack} className="text-purple-600 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <motion.article 
      className="min-h-screen bg-background pt-24 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-muted-foreground hover:text-purple-600 transition-colors mb-8 font-medium"
          aria-label="Go back to blog list"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </button>

        {/* Header */}
        <header className="mb-12 border-b border-border pb-12">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6 font-mono">
            <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.created_at)}
            </span>
            <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              {calculateReadTime(post.content)}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                AI
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{post.author || 'AI Admin'}</p>
                <p className="text-xs text-muted-foreground">Technical Writer</p>
              </div>
            </div>
            
            {/* 👇 FIX: Added aria-label and title for Accessibility */}
            <button 
                className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Share this article"
                title="Share this article"
            >
                <Share2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-12 mb-6 text-purple-600 dark:text-purple-400" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-10 mb-4 border-l-4 border-purple-500 pl-4" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-8 mb-3" {...props} />,
              p: ({node, ...props}) => <p className="text-lg leading-relaxed mb-6 text-muted-foreground" {...props} />,
              // Note: 'li' warning might still show in some strict linters because it's defined in isolation, 
              // but it's 100% valid ReactMarkdown usage. It renders inside ul/ol at runtime.
              ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-6 ml-4" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 mb-6 ml-4" {...props} />,
              // eslint-disable-next-line jsx-a11y/no-redundant-roles
              li: ({node, ...props}) => <li className="text-lg text-muted-foreground" {...props} />,
              blockquote: ({node, ...props}) => (
                <blockquote className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-r-lg italic text-lg my-8" {...props} />
              ),
              code: ({node, ...props}) => {
                const isBlock = String(props.className).includes('language-');
                return isBlock ? (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-6 font-mono text-sm shadow-xl border border-slate-800">
                    <code {...props} />
                  </div>
                ) : (
                  <code className="bg-secondary px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400 font-mono text-sm font-bold" {...props} />
                );
              }
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

      </div>
    </motion.article>
  );
}