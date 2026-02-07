/**
 * Pre-build script that fetches published blog slugs from Supabase
 * and generates a sitemap.xml with all routes including individual blog posts.
 *
 * Usage: node scripts/generate-sitemap.mjs
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env file manually (no dotenv dependency needed)
function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env file not found — rely on env vars
  }
}

loadEnv();

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://umifkcactdapufybaecy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const BASE_URL = 'https://neuralcards-app.netlify.app';
const today = new Date().toISOString().split('T')[0];

// Static routes
const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/auth', changefreq: 'monthly', priority: '0.6' },
  { path: '/dashboard', changefreq: 'daily', priority: '0.8' },
  { path: '/practice', changefreq: 'weekly', priority: '0.9' },
  { path: '/paths', changefreq: 'weekly', priority: '0.9' },
  { path: '/paths/math-for-ml', changefreq: 'monthly', priority: '0.8' },
  { path: '/paths/python-for-ai', changefreq: 'monthly', priority: '0.8' },
  { path: '/paths/machine-learning', changefreq: 'monthly', priority: '0.8' },
  { path: '/paths/deep-learning', changefreq: 'monthly', priority: '0.8' },
  { path: '/paths/modern-ai', changefreq: 'monthly', priority: '0.8' },
  { path: '/paths/mlops', changefreq: 'monthly', priority: '0.8' },
  { path: '/paths/interview-prep', changefreq: 'monthly', priority: '0.8' },
  { path: '/blog', changefreq: 'daily', priority: '0.9' },
];

async function fetchBlogSlugs() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/blogs?select=slug,created_at&is_published=eq.true&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.warn(
        `⚠️ Could not fetch blogs (${response.status}). Generating sitemap without blog posts.`
      );
      return [];
    }

    const blogs = await response.json();
    console.log(`✅ Fetched ${blogs.length} published blog posts for sitemap`);
    return blogs;
  } catch (err) {
    console.warn('⚠️ Failed to fetch blog posts:', err.message);
    return [];
  }
}

function generateSitemap(blogs) {
  const urls = STATIC_ROUTES.map(
    (route) => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  );

  for (const blog of blogs) {
    const lastmod = blog.created_at
      ? new Date(blog.created_at).toISOString().split('T')[0]
      : today;
    urls.push(`  <url>
    <loc>${BASE_URL}/blog/${blog.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

async function main() {
  console.log('🗺️  Generating sitemap...');
  const blogs = await fetchBlogSlugs();
  const sitemap = generateSitemap(blogs);

  const { writeFileSync } = await import('fs');
  const outPath = join(process.cwd(), 'public', 'sitemap.xml');
  writeFileSync(outPath, sitemap, 'utf-8');
  console.log(`✅ Sitemap written to ${outPath} (${STATIC_ROUTES.length + blogs.length} URLs)`);
}

main().catch((err) => {
  console.error('❌ Sitemap generation failed:', err);
  process.exit(0); // Don't fail the build
});
