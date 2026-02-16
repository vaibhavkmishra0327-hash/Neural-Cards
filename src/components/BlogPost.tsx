import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { log } from '../utils/logger';
import { SEOHead } from './SEOHead';
import { SocialShare } from './SocialShare';
import { MiniFlashcardDemo } from './MiniFlashcardDemo';
import { BlogCTA } from './BlogCTA';
import { getBlogCoverImage, getStableBlogCoverImage } from '../utils/blog-images';

interface BlogPostProps {
  slug: string;
  onBack: () => void;
}

export function BlogPost({ slug, onBack }: BlogPostProps) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('blogs').select('*').eq('slug', slug).single();

    if (error) {
      log.error('Error fetching post:', error);
    } else {
      setPost(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
        <button onClick={onBack} className="text-purple-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const postUrl = `https://neural-cards.vercel.app/blog/${slug}`;
  const postDescription = post.content
    .replace(/[#*`[\]]/g, '')
    .slice(0, 160)
    .trim();
  const resolvedCover = getBlogCoverImage(post.title, post.cover_image);
  const stableCover = getStableBlogCoverImage(post.title);

  // Use DB-driven topic_slug (set via Supabase dashboard or when creating blogs)
  const relatedTopicSlug: string | undefined = post.topic_slug || undefined;

  return (
    <>
      <SEOHead
        seo={{
          title: `${post.title} | NeuralCards Blog`,
          description: postDescription,
          canonical: postUrl,
          ogImage: `https://neural-cards.vercel.app/api/og?title=${encodeURIComponent(post.title)}&author=${encodeURIComponent(post.author || 'Vaibhav Kumar Mishra')}&type=blog&cover=${encodeURIComponent(stableCover.url)}`,
          schema: {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: postDescription,
            url: postUrl,
            datePublished: post.created_at,
            dateModified: post.updated_at || post.created_at,
            author: {
              '@type': 'Person',
              name: post.author || 'Vaibhav Kumar Mishra',
            },
            publisher: {
              '@type': 'Organization',
              name: 'NeuralCards',
              url: 'https://neural-cards.vercel.app',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': postUrl,
            },
          },
        }}
      />
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
            {/* Hero Cover Image */}
            <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-lg">
              <img
                src={resolvedCover.url}
                alt={resolvedCover.alt}
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== stableCover.url) {
                    target.src = stableCover.url;
                    return;
                  }
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

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
                  <p className="text-sm font-bold text-foreground">
                    {post.author || 'Vaibhav Kumar Mishra'}
                  </p>
                  <p className="text-xs text-muted-foreground">Technical Writer</p>
                </div>
              </div>

              <SocialShare url={postUrl} title={post.title} description={postDescription} />
            </div>
          </header>

          {/* Content Body */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Inline CTA mid-content */}
            <BlogCTA topicSlug={relatedTopicSlug} variant="inline" />

            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="text-3xl font-bold mt-12 mb-6 text-purple-600 dark:text-purple-400"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-2xl font-bold mt-10 mb-4 border-l-4 border-purple-500 pl-4"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => <h3 className="text-xl font-bold mt-8 mb-3" {...props} />,
                p: ({ ...props }) => (
                  <p className="text-lg leading-relaxed mb-6 text-muted-foreground" {...props} />
                ),
                // Note: 'li' warning might still show in some strict linters because it's defined in isolation,
                // but it's 100% valid ReactMarkdown usage. It renders inside ul/ol at runtime.
                ul: ({ ...props }) => (
                  <ul className="list-disc list-inside space-y-2 mb-6 ml-4" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-6 ml-4" {...props} />
                ),
                li: ({ ...props }) => <li className="text-lg text-muted-foreground" {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-r-lg italic text-lg my-8"
                    {...props}
                  />
                ),
                code: ({ ...props }) => {
                  const isBlock = String(props.className).includes('language-');
                  return isBlock ? (
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-6 font-mono text-sm shadow-xl border border-slate-800">
                      <code {...props} />
                    </div>
                  ) : (
                    <code
                      className="bg-secondary px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400 font-mono text-sm font-bold"
                      {...props}
                    />
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>

            {/* Interactive Flashcard Demo */}
            <MiniFlashcardDemo topicSlug={relatedTopicSlug} />

            {/* Bottom CTA Banner */}
            <BlogCTA topicSlug={relatedTopicSlug} variant="banner" />

            {/* Bottom Share Bar */}
            <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">Enjoyed this article? Share it!</p>
              <SocialShare url={postUrl} title={post.title} description={postDescription} />
            </div>
          </div>
        </div>
      </motion.article>
    </>
  );
}
