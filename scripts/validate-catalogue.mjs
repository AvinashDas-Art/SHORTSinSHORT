import fs from 'node:fs';
import path from 'node:path';

const filmsPath = path.join(process.cwd(), 'src/data/films.json');
const films = JSON.parse(fs.readFileSync(filmsPath, 'utf8'));
if (!Array.isArray(films)) throw new Error('src/data/films.json must contain an array.');

const errors = [];
const seenVideoIds = new Set();
for (const [index, film] of films.entries()) {
  const videoId = String(film.youtubeVideoId || (/^[A-Za-z0-9_-]{11}$/.test(String(film.id || '')) ? film.id : '')).trim();
  const title = String(film.title || '').trim();
  const language = String(film.language || '').trim();
  if (!title || /^Film\s+[A-Za-z0-9_-]{11}$/i.test(title) || title === videoId) {
    errors.push(`row ${index + 1}: placeholder title for ${videoId || film.id || 'unknown id'}`);
  }
  if (!language || /^(indian|unknown|other)$/i.test(language)) {
    errors.push(`row ${index + 1}: invalid language "${language}" for ${title || videoId}`);
  }
  if (videoId) {
    if (seenVideoIds.has(videoId)) errors.push(`row ${index + 1}: duplicate YouTube ID ${videoId}`);
    seenVideoIds.add(videoId);
  }
}

if (errors.length) {
  console.error(`Catalogue validation failed with ${errors.length} error(s):`);
  errors.slice(0, 30).forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Catalogue valid: ${films.length} films, ${seenVideoIds.size} unique YouTube IDs.`);
