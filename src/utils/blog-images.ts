/**
 * Maps blog titles to relevant cover images from Unsplash CDN.
 * Uses keyword matching against curated, high-quality tech/AI images.
 * No API key required — uses permanent Unsplash CDN URLs.
 */

interface ImageEntry {
  keywords: string[];
  url: string;
  alt: string;
}

// Curated Unsplash images — permanent CDN URLs, free to use with attribution
const IMAGE_CATALOG: ImageEntry[] = [
  {
    keywords: ['neural network', 'deep learning', 'deep dive', 'perceptron', 'backpropagation'],
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&crop=center',
    alt: 'Neural network visualization',
  },
  {
    keywords: ['rnn', 'recurrent', 'lstm', 'sequence', 'time series'],
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
    alt: 'Data sequence visualization',
  },
  {
    keywords: ['cnn', 'convolutional', 'computer vision', 'image recognition', 'object detection'],
    url: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=800&h=400&fit=crop&crop=center',
    alt: 'Computer vision and image processing',
  },
  {
    keywords: [
      'linear algebra',
      'matrix',
      'vector',
      'eigenvalue',
      'eigenvector',
      'pca',
      'dimensionality',
    ],
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop&crop=center',
    alt: 'Mathematics and linear algebra',
  },
  {
    keywords: ['nlp', 'natural language', 'text', 'language model', 'sentiment', 'tokeniz'],
    url: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&h=400&fit=crop&crop=center',
    alt: 'Natural language processing',
  },
  {
    keywords: ['transformer', 'attention', 'bert', 'gpt', 'llm', 'large language'],
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop&crop=center',
    alt: 'AI transformer architecture',
  },
  {
    keywords: ['python', 'programming', 'code', 'software', 'algorithm'],
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop&crop=center',
    alt: 'Programming and code',
  },
  {
    keywords: ['reinforcement', 'reward', 'agent', 'policy', 'q-learning'],
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop&crop=center',
    alt: 'Reinforcement learning and robotics',
  },
  {
    keywords: ['data science', 'analytics', 'visualization', 'statistics', 'dataset', 'pandas'],
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
    alt: 'Data science analytics',
  },
  {
    keywords: [
      'machine learning',
      'ml',
      'model',
      'training',
      'supervised',
      'unsupervised',
      'classification',
      'regression',
    ],
    url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop&crop=center',
    alt: 'Machine learning technology',
  },
  {
    keywords: ['gan', 'generative', 'diffusion', 'image generation', 'stable diffusion'],
    url: 'https://images.unsplash.com/photo-1547954575-855750c57bd3?w=800&h=400&fit=crop&crop=center',
    alt: 'Generative AI art',
  },
  {
    keywords: ['cloud', 'deploy', 'infrastructure', 'aws', 'azure', 'docker', 'kubernetes'],
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop&crop=center',
    alt: 'Cloud infrastructure',
  },
  {
    keywords: [
      'probability',
      'bayes',
      'distribution',
      'gaussian',
      'calculus',
      'gradient descent',
      'optimization',
    ],
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=400&fit=crop&crop=center',
    alt: 'Mathematics and probability',
  },
];

// Fallback images for when no keyword matches — cycles through these
const FALLBACK_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&crop=center',
    alt: 'AI and technology',
  },
  {
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop&crop=center',
    alt: 'Artificial intelligence',
  },
  {
    url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop&crop=center',
    alt: 'Technology and innovation',
  },
  {
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop&crop=center',
    alt: 'Digital technology',
  },
];

/**
 * Get a relevant cover image URL for a blog post based on its title.
 * Falls back to a deterministic fallback based on title hash if no keyword matches.
 *
 * @param title - The blog post title
 * @param coverImageUrl - Optional explicit cover image URL (from database)
 * @returns { url: string, alt: string }
 */
export function getBlogCoverImage(
  title: string,
  coverImageUrl?: string | null
): { url: string; alt: string } {
  // Use explicit cover image only when it's a stable public URL
  if (isStablePublicImageUrl(coverImageUrl)) {
    return { url: coverImageUrl, alt: title };
  }

  const lowerTitle = title.toLowerCase();

  // Try to match keywords
  for (const entry of IMAGE_CATALOG) {
    for (const keyword of entry.keywords) {
      if (lowerTitle.includes(keyword)) {
        return { url: entry.url, alt: entry.alt };
      }
    }
  }

  // Deterministic fallback — same title always gets same image
  const hash = simpleHash(title);
  const fallback = FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
  return fallback;
}

/**
 * Get a deterministic cover image based only on title keywords/hash.
 * Useful for SEO/OG so social crawlers don't depend on expiring URLs.
 */
export function getStableBlogCoverImage(title: string): { url: string; alt: string } {
  return getBlogCoverImage(title, null);
}

function isStablePublicImageUrl(value?: string | null): value is string {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    if (!isHttp) return false;

    const expiringKeys = [
      'token',
      'expires',
      'exp',
      'signature',
      'x-amz-signature',
      'x-amz-expires',
    ];
    for (const key of expiringKeys) {
      if (parsed.searchParams.has(key)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/** Simple string hash for deterministic fallback selection */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
