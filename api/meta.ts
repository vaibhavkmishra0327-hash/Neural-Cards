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

export const config = {
  runtime: 'edge',
};

const SITE_URL = 'https://neural-cards.vercel.app';

/** Keyword-to-Unsplash cover image mapping for OG images */
const OG_COVER_MAP: { keywords: string[]; url: string }[] = [
  { keywords: ['neural network', 'deep learning', 'deep dive', 'perceptron', 'backpropagation'], url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop&crop=center' },
  { keywords: ['rnn', 'recurrent', 'lstm', 'sequence', 'time series'], url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop&crop=center' },
  { keywords: ['cnn', 'convolutional', 'computer vision', 'image recognition'], url: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=1200&h=630&fit=crop&crop=center' },
  { keywords: ['linear algebra', 'matrix', 'vector', 'eigenvalue', 'eigenvector', 'pca'], url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=630&fit=crop&crop=center' },
  { keywords: ['nlp', 'natural language', 'text', 'language model', 'sentiment'], url: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&h=630&fit=crop&crop=center' },
  { keywords: ['transformer', 'attention', 'bert', 'gpt', 'llm', 'large language'], url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=630&fit=crop&crop=center' },
  { keywords: ['python', 'programming', 'code', 'software', 'algorithm'], url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=630&fit=crop&crop=center' },
  { keywords: ['reinforcement', 'reward', 'agent', 'policy', 'q-learning'], url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=630&fit=crop&crop=center' },
  { keywords: ['data science', 'analytics', 'visualization', 'statistics', 'dataset'], url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop&crop=center' },
  { keywords: ['machine learning', 'ml', 'model', 'training', 'supervised', 'classification', 'regression'], url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=630&fit=crop&crop=center' },
  { keywords: ['gan', 'generative', 'diffusion', 'image generation'], url: 'https://images.unsplash.com/photo-1547954575-855750c57bd3?w=1200&h=630&fit=crop&crop=center' },
  { keywords: ['cloud', 'deploy', 'infrastructure', 'aws', 'docker', 'kubernetes'], url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop&crop=center' },
  { keywords: ['probability', 'bayes', 'distribution', 'calculus', 'gradient descent'], url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&h=630&fit=crop&crop=center' },
];

const DEFAULT_OG_COVER = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop&crop=center';

function getCoverForTitle(title: string): string {
  const lower = title.toLowerCase();
  for (const entry of OG_COVER_MAP) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) return entry.url;
    }
  }
  return DEFAULT_OG_COVER;
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = normalizePath(url.searchParams.get('path') || '/');

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
    const readableTitle = slug
      .split('-')
      .filter(Boolean)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    title = `${readableTitle} | NeuralCards Blog`;
    description = `Read ${readableTitle} on NeuralCards Blog. Learn AI concepts with concise, practical explanations.`;
    canonical = `${SITE_URL}/blog/${slug}`;
    type = 'article';
    ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(readableTitle)}&author=${encodeURIComponent(author)}&type=blog&cover=${encodeURIComponent(getCoverForTitle(readableTitle))}`;

    try {
      const { projectId, anonKey } = resolveSupabaseConfig();

      if (projectId && anonKey) {
        const response = await fetch(
          `https://${projectId}.supabase.co/rest/v1/blogs?select=title,content,author,created_at,updated_at,topic_slug&slug=eq.${encodeURIComponent(slug)}&limit=1`,
          {
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${anonKey}`,
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Supabase REST failed with status ${response.status}`);
        }

        const data = (await response.json()) as Array<{
          title: string;
          content: string;
          author?: string;
          created_at?: string;
          updated_at?: string;
          topic_slug?: string;
        }>;
        const post = data?.[0];

        if (post) {
          title = `${post.title} | NeuralCards Blog`;
          description = post.content
            .replace(/[#*`[\]]/g, '')
            .slice(0, 160)
            .trim();
          author = post.author || 'Vaibhav Kumar Mishra';
          const cover = encodeURIComponent(getCoverForTitle(post.title));
          ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&author=${encodeURIComponent(author)}&type=blog&cover=${cover}`;
          publishedTime = post.created_at || '';
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
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  ${type === 'article' ? `<meta property="article:author" content="${escapeHtml(author)}" />` : ''}
  ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}" />` : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />

  <meta name="robots" content="noindex, follow" />
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

function normalizePath(rawPath: string): string {
  if (!rawPath) return '/';

  const [pathname] = rawPath.split('?');
  if (!pathname) return '/';

  const withoutTrailing = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return withoutTrailing || '/';
}

function resolveSupabaseConfig(): { projectId: string | null; anonKey: string | null } {
  let projectId =
    process.env.VITE_SUPABASE_PROJECT_ID ||
    process.env.SUPABASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID ||
    null;

  const anonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    null;

  if (!projectId && anonKey) {
    projectId = extractProjectIdFromAnonKey(anonKey);
  }

  return { projectId, anonKey };
}

function extractProjectIdFromAnonKey(anonKey: string): string | null {
  try {
    const payload = anonKey.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = JSON.parse(atob(padded)) as { ref?: string };
    return json.ref || null;
  } catch {
    return null;
  }
}
