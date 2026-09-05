// Turns a film title into a short, URL-safe, keyword-friendly slug.
// Falls back to 'film' if nothing usable remains (e.g. an all-Hindi title),
// since the slug is only for readability - the actual lookup always uses
// the film's id/youtubeVideoId from the URL, not this slug.
export function slugify(text) {
  const base = String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return base || 'film';
}

// Builds the canonical path for a film: /film/<id>/<slug>
export function filmPath(film) {
  const id = film?.id || film?.youtubeVideoId || '';
  const slug = slugify(film?.title || film?.titleHi);
  return `/film/${encodeURIComponent(id)}/${slug}`;
}
