import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

// Read the built HTML template
const template = fs.readFileSync(path.resolve(distDir, 'index.html'), 'utf-8');

// Import the server bundle
const { render, getStories, getSeo } = await import(path.resolve(distDir, 'server/entry-server.js'));

const stories = getStories();

// Base URL for the deployed site (set via env or fallback)
const SITE_URL = process.env.SITE_URL || 'https://vibecode-db.geekyants.com';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function jsonLdScript(jsonLd) {
  if (!jsonLd || !jsonLd.length) return '';
  const payload = jsonLd.length === 1 ? jsonLd[0] : jsonLd;
  // Escape "<" to avoid breaking out of the <script> context.
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

function generatePage(url) {
  const seo = getSeo(url, SITE_URL);
  const appHtml = render(url);
  return template
    .replace('<!--app-html-->', appHtml)
    .replaceAll('<!--page-title-->', escapeAttr(seo.title))
    .replaceAll('<!--page-description-->', escapeAttr(seo.description))
    .replaceAll('<!--page-url-->', escapeAttr(seo.url))
    .replaceAll('<!--og-image-->', escapeAttr(OG_IMAGE))
    .replace('<!--json-ld-->', jsonLdScript(seo.jsonLd));
}

// Generate the landing page (marketing home at the root)
const indexHtml = generatePage('/');
fs.writeFileSync(path.resolve(distDir, 'index.html'), indexHtml);

// Generate a page for each story
for (const story of stories) {
  const url = `/${story.id}`;
  const html = generatePage(url);

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
