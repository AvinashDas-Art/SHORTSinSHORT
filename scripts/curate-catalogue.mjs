import fs from 'node:fs';
import path from 'node:path';
import { cleanEditorialText, cleanFilmTitle } from '../src/utils/editorialText.js';

const root = process.cwd();
const filmsPath = path.join(root, 'src/data/films.json');
const approvedPath = path.join(root, 'src/data/discovery-approved.json');
const unavailablePath = path.join(root, 'src/data/unavailable-films.json');
const exclusionsPath = path.join(root, 'scripts/editorial-exclusions.json');
const films = JSON.parse(fs.readFileSync(filmsPath, 'utf8'));
const approved = JSON.parse(fs.readFileSync(approvedPath, 'utf8'));
const unavailable = JSON.parse(fs.readFileSync(unavailablePath, 'utf8'));
const exclusions = JSON.parse(fs.readFileSync(exclusionsPath, 'utf8'));
const exclusionById = new Map(exclusions.map((item) => [item.youtubeVideoId, item]));
const approvedById = new Map(approved.map((item) => [item.youtubeVideoId, item]));

const directorFrom = (item, fallback) => {
  const description = String(item?.description || '');
  const match = description.match(/(?:^|\n)\s*(?:written\s+(?:&|and)\s+directed\s+by|directed\s+by|director)\s*[:\-]?\s*([^\n|,]{2,80})/imu);
  const candidate = String(match?.[1] || '').replace(/^[|:\-\s]+/, '').replace(/https?:\/\/.*$/i, '').trim();
  return candidate && !/^(by|unknown)$/i.test(candidate) ? candidate : fallback;
};

const genresFrom = (item, fallback) => {
  const source = `${item?.title || ''} ${item?.description || ''}`.toLowerCase();
  const genres = [];
  if (/award|winner|festival|official selection|nominated/.test(source)) genres.push('Award Winning');
  if (/documentary|non[ -]?fiction|true story|real life/.test(source)) genres.push('Documentary');
  if (/animat|stop[ -]?motion/.test(source)) genres.push('Animation');
  if (/horror|terrifying|scary|supernatural/.test(source)) genres.push('Horror');
  if (/thriller|suspense|mystery|crime/.test(source)) genres.push('Thriller');
  if (/comedy|comic|funny|humou?r/.test(source)) genres.push('Comedy');
  if (/romance|romantic|love story/.test(source)) genres.push('Romance');
  if (/sci[ -]?fi|science fiction|artificial intelligence|\bai\b/.test(source)) genres.push('Sci-Fi');
  return genres.length ? [...new Set(genres)].slice(0, 3) : fallback;
};

const seenIds = new Set();
const curated = [];
for (const film of films) {
  const videoId = film.youtubeVideoId || film.id;
  if (!videoId || seenIds.has(videoId)) continue;
  seenIds.add(videoId);
  const exclusion = exclusionById.get(film.youtubeVideoId);
  if (exclusion) {
    if (!unavailable.some((item) => item.youtubeVideoId === film.youtubeVideoId)) {
      unavailable.push({ ...film, availability: exclusion.reason, isPublished: false });
    }
    continue;
  }
  const source = approvedById.get(film.youtubeVideoId);
  const rawTitle = source?.title || film.title;
  const rawDescription = source?.description || film.description;
  const description = cleanEditorialText(rawDescription) || cleanEditorialText(film.description) || film.description;
  const director = source ? directorFrom(source, source.channelTitle || film.director) : film.director;
  curated.push({
    ...film,
    title: cleanFilmTitle(rawTitle) || film.title,
    titleHi: cleanFilmTitle(rawTitle) || film.titleHi || film.title,
    director,
    genre: source ? genresFrom(source, film.genre) : film.genre,
    description,
    descriptionHi: description
  });
}

const temporary = `${filmsPath}.tmp`;
fs.writeFileSync(temporary, `${JSON.stringify(curated, null, 2)}\n`);
fs.renameSync(temporary, filmsPath);
const unavailableTemporary = `${unavailablePath}.tmp`;
fs.writeFileSync(unavailableTemporary, `${JSON.stringify(unavailable, null, 2)}\n`);
fs.renameSync(unavailableTemporary, unavailablePath);
console.log(`Curated ${curated.length} films: clean titles, synopses, credits and duplicate IDs.`);
