const INDIA_TIME_ZONE = 'Asia/Kolkata';
const HERO_FILMS_PER_DAY = 5;
const ROTATION_START_DATE = '2026-09-04';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const getIndiaDateKey = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: INDIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]));
  return `${value.year}-${value.month}-${value.day}`;
};

const dateKeyToDayNumber = (dateKey) => {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_IN_MS);
};

export const getDailyHeroFilms = (allFilms, dateKey = getIndiaDateKey()) => {
  if (!Array.isArray(allFilms) || allFilms.length === 0) return [];

  const seen = new Set();
  const validFilms = allFilms.filter((film) => {
    const videoId = film?.youtubeVideoId || film?.youtubeId || film?.id;
    if (!videoId || !film?.title || film?.availability === 'unavailable' || seen.has(videoId)) return false;
    seen.add(videoId);
    return true;
  });
  if (validFilms.length <= HERO_FILMS_PER_DAY) return validFilms;

  // New curator additions are appended to films.json, so reversing gives them first priority.
  const newestFirst = [...validFilms].reverse();
  const elapsedDays = dateKeyToDayNumber(dateKey) - dateKeyToDayNumber(ROTATION_START_DATE);
  const start = ((elapsedDays * HERO_FILMS_PER_DAY) % newestFirst.length + newestFirst.length) % newestFirst.length;

  return Array.from({ length: HERO_FILMS_PER_DAY }, (_, offset) => (
    newestFirst[(start + offset) % newestFirst.length]
  ));
};

