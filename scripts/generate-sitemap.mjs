import fs from 'node:fs';
import path from 'node:path';

// हर build से पहले चलता है, films.json में मौजूद हर फ़िल्म की अपनी URL
// sitemap.xml में जोड़ देता है, ताकि Google हर फ़िल्म को अलग पेज की तरह
// खोज और index कर सके (सिर्फ़ होमपेज नहीं)।

const root = process.cwd();
const SITE_URL = 'https://www.shortsinshort.com';

const filmsPath = path.join(root, 'src/data/films.json');
const outPath = path.join(root, 'public/sitemap.xml');

const films = JSON.parse(fs.readFileSync(filmsPath, 'utf8'));

const slugify = (text) => {
  const base = String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return base || 'film';
};

const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
  ...films
    .filter((f) => f.availability !== 'unavailable' && (f.id || f.youtubeVideoId))
    .map((f) => {
      const id = f.id || f.youtubeVideoId;
      const slug = slugify(f.title || f.titleHi);
      return {
        loc: `${SITE_URL}/film/${encodeURIComponent(id)}/${slug}`,
        changefreq: 'monthly',
        priority: '0.7'
      };
    })
];

const body = urls
  .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

fs.writeFileSync(outPath, xml);
console.log('sitemap.xml लिखा गया: ' + urls.length + ' URLs (' + films.length + ' फ़िल्मों में से)।');
