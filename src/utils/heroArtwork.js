const MIN_HERO_WIDTH = 480;
const MIN_HERO_HEIGHT = 270;
const HERO_IMAGE_TIMEOUT_MS = 6000;

const artworkCache = new Map();

export const getFilmVideoId = (film) => (
  film?.youtubeVideoId || film?.youtubeId || film?.videoId || film?.id || ''
);

export const getHeroArtworkCandidates = (film) => {
  if (!film) return [];

  const videoId = getFilmVideoId(film);
  const candidates = [
    film.heroImage,
    film.backdrop,
    film.thumbnail,
    film.thumbnailUrl,
    videoId && `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    videoId && `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    videoId && `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  ].filter(Boolean);

  return [...new Set(candidates)];
};

const preloadCandidate = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  const timer = window.setTimeout(() => {
    image.src = '';
    reject(new Error('Hero artwork timed out'));
  }, HERO_IMAGE_TIMEOUT_MS);

  image.onload = () => {
    window.clearTimeout(timer);
    const usable = image.naturalWidth >= MIN_HERO_WIDTH
      && image.naturalHeight >= MIN_HERO_HEIGHT;
    if (usable) resolve(src);
    else reject(new Error('Hero artwork is too small'));
  };
  image.onerror = () => {
    window.clearTimeout(timer);
    reject(new Error('Hero artwork failed to load'));
  };
  image.decoding = 'async';
  image.src = src;
});

export const loadBestHeroArtwork = (film) => {
  const filmKey = getFilmVideoId(film) || film?.title;
  if (!filmKey) return Promise.reject(new Error('Film has no stable key'));
  if (artworkCache.has(filmKey)) return artworkCache.get(filmKey);

  const request = (async () => {
    for (const candidate of getHeroArtworkCandidates(film)) {
      try {
        return await preloadCandidate(candidate);
      } catch {
        // Try the next verified candidate. YouTube often returns a tiny
        // placeholder for an unavailable max-resolution thumbnail.
      }
    }
    throw new Error('Film has no usable hero artwork');
  })();

  artworkCache.set(filmKey, request);
  request.catch(() => artworkCache.delete(filmKey));
  return request;
};
