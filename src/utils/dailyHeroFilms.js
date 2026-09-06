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

export const dateKeyToDayNumber = (dateKey) => {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_IN_MS);
};

const elapsedDaysSinceRotationStart = (dateKey) => (
  dateKeyToDayNumber(dateKey) - dateKeyToDayNumber(ROTATION_START_DATE)
);

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
  const elapsedDays = elapsedDaysSinceRotationStart(dateKey);
  const start = ((elapsedDays * HERO_FILMS_PER_DAY) % newestFirst.length + newestFirst.length) % newestFirst.length;

  return Array.from({ length: HERO_FILMS_PER_DAY }, (_, offset) => (
    newestFirst[(start + offset) % newestFirst.length]
  ));
};

// The "How much time do you have?" picker used to always feature the same
// single longest film under each cutoff - a fixed pick that never changed
// across days or catalogue growth. This rotates the featured film for a
// given minutes-bucket daily, the same way the hero does, cycling through
// every film that actually fits that bucket rather than freezing on one.
export const getDailyFilmForDuration = (allFilms, minutes, dateKey = getIndiaDateKey()) => {
  if (!Array.isArray(allFilms) || allFilms.length === 0) return null;

  const runtimeMinutes = (film) => {
    const raw = (typeof film?.duration === 'string' && film.duration) ||
      (typeof film?.runtime === 'string' && film.runtime) || '';
    const match = raw.match(/(\d{1,3})/);
    return match ? Number(match[1]) : null;
  };

  const seen = new Set();
  const matches = allFilms.filter((film) => {
    const videoId = film?.youtubeVideoId || film?.youtubeId || film?.id;
    const runtime = runtimeMinutes(film);
    if (!videoId || !film?.title || film?.availability === 'unavailable' || seen.has(videoId)) return false;
    if (runtime === null || runtime > minutes) return false;
    seen.add(videoId);
    return true;
  }).sort((a, b) => (runtimeMinutes(b) || 0) - (runtimeMinutes(a) || 0));

  if (matches.length === 0) return null;

  const elapsedDays = elapsedDaysSinceRotationStart(dateKey);
  // Offsetting by `minutes` keeps the five duration buttons from all landing
  // on the same relative film on any given day.
  const index = ((elapsedDays + minutes) % matches.length + matches.length) % matches.length;
  return matches[index];
};

