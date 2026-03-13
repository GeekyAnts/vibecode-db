import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

// Read the built HTML template
const template = fs.readFileSync(path.resolve(distDir, 'index.html'), 'utf-8');

// Import the server bundle
const { render, getStories } = await import(path.resolve(distDir, 'server/entry-server.js'));

const stories = getStories();
const defaultTitle = '@vibecode-db/client - Playground & Docs';
const defaultDesc = 'Universal database SDK with Supabase-compatible API and swappable adapters. Interactive playground and documentation.';

// Base URL for the deployed site (set via env or fallback)
const SITE_URL = process.env.SITE_URL || 'https://vibecode-db.vercel.app';

function generatePage(url, title, description) {
  const appHtml = render(url);
  return template
    .replace('<!--app-html-->', appHtml)
    .replace('<!--page-title-->', title)
    .replace('<!--page-description-->', description);
}

// Generate index page (redirect to first story)
const indexHtml = generatePage('/', defaultTitle, defaultDesc);
fs.writeFileSync(path.resolve(distDir, 'index.html'), indexHtml);

// Generate a page for each story
for (const story of stories) {
  const url = `/${story.id}`;
  const title = `${story.title} - @vibecode-db/client`;
  const description = story.description;

  const html = generatePage(url, title, description);

  const dir = path.resolve(distDir, story.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.resolve(dir, 'index.html'), html);
}

// Generate sitemap.xml
const today = new Date().toISOString().split('T')[0];
const sitemapEntries = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  ...stories.map((s) => ({
    url: `/${s.id}`,
    priority: s.id.startsWith('doc-') ? '0.8' : '0.6',
    changefreq: 'monthly',
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    (e) => `  <url>
    <loc>${SITE_URL}${e.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), sitemap);

// Generate robots.txt
const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
fs.writeFileSync(path.resolve(distDir, 'robots.txt'), robots);

console.log(`Pre-rendered ${stories.length + 1} pages, sitemap.xml, and robots.txt.`);
