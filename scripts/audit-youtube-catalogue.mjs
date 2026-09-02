import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const cataloguePath = path.join(root, 'src/data/films.json');
const archivePath = path.join(root, 'src/data/unavailable-films.json');
const apply = process.argv.includes('--apply');
const force = process.argv.includes('--force');
const apiKey = process.env.YOUTUBE_API_KEY?.trim();

if (!apiKey) {
  console.error('ERROR: YOUTUBE_API_KEY environment variable नहीं मिली।');
  process.exit(1);
}

const readJson = (file, fallback) => {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const films = readJson(cataloguePath, []);
if (!Array.isArray(films)) {
  console.error('ERROR: src/data/films.json का root JSON array होना चाहिए।');
  process.exit(1);
}

const previousArchive = readJson(archivePath, []);
if (!Array.isArray(previousArchive)) {
  console.error('ERROR: unavailable-films.json का root JSON array होना चाहिए।');
  process.exit(1);
}

const videoIdFrom = (film) => {
  const candidates = [film?.youtubeVideoId, film?.youtubeId, film?.videoId, film?.youtubeUrl, film?.url, film?.id];
  for (const value of candidates) {
    const raw = String(value || '').trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
    const match = raw.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/i);
    if (match) return match[1];
  }
  return null;
};

const durationSeconds = (iso) => {
  const match = String(iso || '').match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!match) return null;
  return Number(match[1] || 0) * 86400 + Number(match[2] || 0) * 3600 + Number(match[3] || 0) * 60 + Number(match[4] || 0);
};

const uniqueIds = [...new Set(films.map(videoIdFrom).filter(Boolean))];
const apiVideos = new Map();

for (let index = 0; index < uniqueIds.length; index += 50) {
  const ids = uniqueIds.slice(index, index + 50);
  const query = new URLSearchParams({
    part: 'status,contentDetails,snippet',
    id: ids.join(','),
    key: apiKey,
  });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${query}`);
  if (!response.ok) {
    const message = await response.text();
    console.error(`ERROR: YouTube API ${response.status}: ${message.slice(0, 500)}`);
    process.exit(1);
  }
  const payload = await response.json();
  for (const item of payload.items || []) apiVideos.set(item.id, item);
}

const checkedAt = new Date().toISOString();
const active = [];
const newlyUnavailable = [];
const skipped = [];

for (const film of films) {
  const videoId = videoIdFrom(film);
  if (!videoId) {
    skipped.push({ title: film?.title || film?.name || 'Untitled', reason: 'missing_youtube_id' });
    active.push(film);
    continue;
  }

  const item = apiVideos.get(videoId);
  const seconds = item ? durationSeconds(item.contentDetails?.duration) : null;
  let reason = null;
  if (!item) reason = 'removed_or_private';
  else if (item.status?.privacyStatus !== 'public') reason = `privacy_${item.status?.privacyStatus || 'unknown'}`;
  else if (item.status?.embeddable !== true) reason = 'embed_disabled';
  else if (seconds !== null && seconds > 1800) reason = 'runtime_over_30_minutes';

  const health = {
    available: !reason,
    reason,
    checkedAt,
    embeddable: item?.status?.embeddable ?? false,
    privacyStatus: item?.status?.privacyStatus || 'unavailable',
    madeForKids: item?.status?.madeForKids ?? null,
  };

  if (reason) {
    newlyUnavailable.push({
      ...film,
      youtubeVideoId: film.youtubeVideoId || videoId,
      availability: reason,
      isPublished: false,
      youtubeHealth: health,
      removedAt: film.removedAt || checkedAt,
    });
  } else {
    active.push({
      ...film,
      youtubeVideoId: film.youtubeVideoId || videoId,
      durationSeconds: seconds,
      availability: 'available',
      youtubeHealth: health,
    });
  }
}

const unavailableRatio = films.length ? newlyUnavailable.length / films.length : 0;
if (apply && unavailableRatio > 0.5 && !force) {
  console.error(`SAFETY STOP: ${newlyUnavailable.length}/${films.length} फ़िल्में unavailable मिलीं।`);
  console.error('यह असामान्य रूप से बड़ा बदलाव है। API key और data schema जांचकर ही --force इस्तेमाल करें।');
  process.exit(1);
}

const archiveKey = (film) => `${videoIdFrom(film) || film?.id || film?.title || 'unknown'}:${film?.availability || 'unknown'}`;
const archiveMap = new Map(previousArchive.map((film) => [archiveKey(film), film]));
for (const film of newlyUnavailable) archiveMap.set(archiveKey(film), film);
const archive = [...archiveMap.values()];

console.log(`Catalogue total: ${films.length}`);
console.log(`Available: ${active.length}`);
console.log(`Unavailable: ${newlyUnavailable.length}`);
console.log(`Skipped without YouTube ID: ${skipped.length}`);
for (const film of newlyUnavailable) {
  console.log(`HIDE ${videoIdFrom(film)} | ${film.availability} | ${film.title || film.name || 'Untitled'}`);
}

if (!apply) {
  console.log('\nDRY RUN: कोई file नहीं बदली। बदलाव लागू करने के लिए --apply लगाइए।');
  process.exit(0);
}

if (films.length && active.length === 0) {
  console.error('SAFETY STOP: कोई playable फ़िल्म नहीं बची। Files नहीं बदली गयीं।');
  process.exit(1);
}

const atomicWrite = (file, value) => {
  const temporary = `${file}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, file);
};

atomicWrite(cataloguePath, active);
atomicWrite(archivePath, archive);
console.log('\nAPPLIED: unavailable फ़िल्में live catalogue से हटाकर archive में रख दी गयीं।');
