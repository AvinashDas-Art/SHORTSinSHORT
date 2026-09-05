import { next } from '@vercel/edge';
import films from './src/data/films.json' with { type: 'json' };

// Runs only for /film/* URLs (see `config.matcher` below), and only takes
// effect for the specific "link-preview" bots that WhatsApp/Telegram/
// Twitter/Slack/Discord/etc. send to fetch a share-card - they do NOT run
// JavaScript, so they only ever see whatever this returns. Everyone else
// (real visitors AND Google/Bing's own crawlers, which do render the page's
// JS) is passed straight through to the normal single-page app via next().
// Deliberately NOT touching Googlebot/Bingbot/etc. here: Google already
// renders the client-side app fine, and giving search crawlers a different
// response than real visitors get is the kind of thing that reads as
// cloaking - this only ever serves preview-fetching bots that have no other
// way to see the page at all.
const PREVIEW_BOT_UA = /(facebookexternalhit|Facebot|WhatsApp|Twitterbot|TelegramBot|Discordbot|LinkedInBot|Slackbot|SkypeUriPreview|Pinterest|redditbot|vkShare|Viber|Line\/|Applebot)/i;

const SITE_URL = 'https://www.shortsinshort.com';
const DEFAULT_DESCRIPTION = 'Discover handpicked short films from India and around the world, presented through authorised creator and YouTube embeds., thrillers, human dramas, and groundbreaking AI cinema.';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
));

const buildHtml = (film, canonicalUrl) => {
  const title = `${film.title} | SHORTSinSHORT`;
  const description = film.descriptionHi || film.description || DEFAULT_DESCRIPTION;
  const image = film.thumbnail || `${SITE_URL}/og-image.png`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
<meta property="og:type" content="video.other" />
<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
<meta property="og:site_name" content="SHORTSinSHORT" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:secure_url" content="${escapeHtml(image)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
<meta http-equiv="refresh" content="0; url=${escapeHtml(canonicalUrl)}" />
</head>
<body></body>
</html>`;
};

export const config = { matcher: ['/film/:filmId', '/film/:filmId/:slug'] };

export default async function middleware(request) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    if (!PREVIEW_BOT_UA.test(userAgent)) return next();

    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean); // ['film', ':filmId', ':slug?']
    const filmId = decodeURIComponent(segments[1] || '');
    const film = films.find((f) => (f.id || f.youtubeVideoId) === filmId);
    if (!film) return next();

    const html = buildHtml(film, SITE_URL + url.pathname);
    return new Response(html, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' }
    });
  } catch (err) {
    // Any unexpected failure here should never break the real site - just
    // fall through to the normal single-page app.
    return next();
  }
}
