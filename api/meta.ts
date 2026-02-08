/**
 * Bot Meta Tag Server — Serves proper OG meta tags for social media crawlers.
 *
 * Social crawlers (LinkedIn, Twitter, Facebook) don't execute JavaScript,
 * so React Helmet tags in our SPA are invisible to them. This serverless
 * function returns a lightweight HTML page with correct OG tags when a
 * bot visits a blog post URL.
 *
 * Triggered via conditional rewrites in vercel.json that match bot user agents.
 */

import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const SITE_URL = 'https://neural-cards.vercel.app';

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '/';

  // Default meta (homepage / fallback)
  let title = 'NeuralCards — Master AI with Interactive Flashcards';
  let description =
    'Learn AI, Machine Learning, and Deep Learning with interactive flashcards, spaced repetition, and structured learning paths. Free and open source.';
  let ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&type=default`;
  let canonical = SITE_URL;
  let author = 'Vaibhav Kumar Mishra';
  let publishedTime = '';
  let type: 'website' | 'article' = 'website';

  // Blog post route: /blog/:slug
  const blogMatch = path.match(/^\/blog\/(.+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];

    try {
      const projectId = process.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

      if (projectId && anonKey) {
        const supabase = createClient(
          `https://${projectId}.supabase.co`,
          anonKey
        );

        const { data: post } = await supabase
          .from('blogs')
          .select('title, content, author, created_at, updated_at')
          .eq('slug', slug)
          .single();

        if (post) {
          title = `${post.title} | NeuralCards Blog`;
          description = post.content
            .replace(/[#*`[\]]/g, '')
            .slice(0, 160)
            .trim();
          author = post.author || 'Vaibhav Kumar Mishra';
          ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&author=${encodeURIComponent(author)}&type=blog`;
          canonical = `${SITE_URL}/blog/${slug}`;
          publishedTime = post.created_at || '';
          type = 'article';
        }
      }
    } catch {
      // Fallback to defaults on any error
    }
  }

  // Topic route: /topics/:slug
  const topicMatch = path.match(/^\/topics\/(.+)$/);
  if (topicMatch) {
    const slug = topicMatch[1];
    const readableTitle = slug
      .split('-')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    title = `${readableTitle} Flashcards | NeuralCards`;
    description = `Master ${readableTitle} with interactive AI-powered flashcards and spaced repetition on NeuralCards.`;
    ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(readableTitle)}&type=topic`;
    canonical = `${SITE_URL}/topics/${slug}`;
    type = 'website';
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonical}" />

  <!-- Open Graph -->
  <meta property="og:type" content="${type}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:site_name" content="NeuralCards" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  ${type === 'article' ? `<meta property="article:author" content="${escapeHtml(author)}" />` : ''}
  ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}" />` : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ogImage}" />

  <!-- Redirect real users to the SPA (bots won't follow this) -->
  <meta http-equiv="refresh" content="0;url=${canonical}" />
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <a href="${canonical}">Visit NeuralCards</a>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
