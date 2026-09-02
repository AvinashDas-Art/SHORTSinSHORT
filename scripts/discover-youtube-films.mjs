import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const apiKey = process.env.YOUTUBE_API_KEY?.trim();
const apply = process.argv.includes('--apply');
const numberArg = (name, fallback) => {
  const prefix = '--' + name + '=';
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.split('=')[1];
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
};
const queriesPerRun = Math.min(numberArg('queries', 7), 10);
const maxNew = Math.min(numberArg('max', 30), 100);
const maxQueue = 500;

if (!apiKey) {
  console.error('ERROR: YOUTUBE_API_KEY environment variable नहीं मिली।');
  process.exit(1);
}

const paths = {
  films: path.join(root, 'src/data/films.json'),
  unavailable: path.join(root, 'src/data/unavailable-films.json'),
  queue: path.join(root, 'src/data/discovery-queue.json'),
  rejected: path.join(root, 'src/data/discovery-rejected.json'),
  queries: path.join(root, 'scripts/discovery-queries.json')
};

const readJson = (file, fallback = []) => {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const films = readJson(paths.films);
const unavailable = readJson(paths.unavailable);
const oldQueue = readJson(paths.queue);
const oldRejected = readJson(paths.rejected);
const queryBank = readJson(paths.queries);

for (const pair of Object.entries({ films, unavailable, oldQueue, oldRejected, queryBank })) {
  if (!Array.isArray(pair[1])) {
    console.error('ERROR: ' + pair[0] + ' का root JSON array होना चाहिए।');
    process.exit(1);
  }
}

const videoIdFrom = (item) => {
  const values = [
    item?.youtubeVideoId, item?.youtubeId, item?.videoId, item?.youtubeUrl,
    item?.watchUrl, item?.url, item?.id
  ];
  for (const value of values) {
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
  return Number(match[1] || 0) * 86400
    + Number(match[2] || 0) * 3600
    + Number(match[3] || 0) * 60
    + Number(match[4] || 0);
};

const cleanText = (value) => String(value || '')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .trim();

const positivePattern = /(short[\s-]*film|shortfilm|award[\s-]*winning|festival[\s-]*(selected|winner|film)|cortometraje|court métrage|curta[\s-]*metragem|cortometraggio|kurzfilm|film court|लघु\s*(फिल्म|फ़िल्म)|शॉर्ट\s*(फिल्म|फ़िल्म)|فيلم قصير|短編映画|단편영화|короткометраж)/i;
const rejectPattern = /(\bofficial\s+trailer\b|\btrailer\b|\bteaser\b|\breaction\b|\breview\b|\bexplained\b|\brecap\b|\bbehind the scenes\b|\bmaking of\b|\bfull episode\b|\binterview\b|\bpodcast\b|\bmusic video\b|\blyric video\b|#shorts\b)/i;
const prestigePattern = /(award|winner|winning|festival|official selection|nominated|nominee|cannes|sundance|bafta|oscar|clermont|berlinale|venice|tribeca)/i;

const now = new Date();
const nowIso = now.toISOString();
const expiryMs = 28 * 24 * 60 * 60 * 1000;
const activeQueue = oldQueue.filter((item) => {
  if (item?.status && item.status !== 'pending') return false;
  const expires = Date.parse(item?.expiresAt || '');
  return !Number.isFinite(expires) || expires > now.getTime();
});

const knownIds = new Set(
  [...films, ...unavailable, ...activeQueue, ...oldRejected].map(videoIdFrom).filter(Boolean)
);

if (!queryBank.length) {
  console.error('ERROR: Discovery query bank खाली है।');
  process.exit(1);
}

const dayNumber = Math.floor(now.getTime() / 86400000);
const start = (dayNumber * queriesPerRun) % queryBank.length;
const selectedQueries = Array.from(
  { length: Math.min(queriesPerRun, queryBank.length) },
  (_, offset) => queryBank[(start + offset) % queryBank.length]
);

const requestJson = async (url, label) => {
  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text();
    console.error('ERROR: ' + label + ' ' + response.status + ': ' + message.slice(0, 700));
    process.exit(1);
  }
  return response.json();
};

const searchResults = new Map();
for (const query of selectedQueries) {
  const params = new URLSearchParams({
    part: 'snippet',
    q: query.q,
    type: 'video',
    maxResults: '50',
    order: 'relevance',
    safeSearch: 'strict',
    videoEmbeddable: 'true',
    videoSyndicated: 'true',
    key: apiKey
  });
  const payload = await requestJson(
    'https://www.googleapis.com/youtube/v3/search?' + params,
    'YouTube Search (' + query.q + ')'
  );
  for (const item of payload.items || []) {
    const videoId = item?.id?.videoId;
    if (!videoId || knownIds.has(videoId) || searchResults.has(videoId)) continue;
    searchResults.set(videoId, { source: query });
  }
}

const ids = [...searchResults.keys()];
const details = new Map();
for (let index = 0; index < ids.length; index += 50) {
  const batch = ids.slice(index, index + 50);
  const params = new URLSearchParams({
    part: 'snippet,status,contentDetails,statistics',
    id: batch.join(','),
    key: apiKey
  });
  const payload = await requestJson(
    'https://www.googleapis.com/youtube/v3/videos?' + params,
    'YouTube Videos'
  );
  for (const item of payload.items || []) details.set(item.id, item);
}

const candidates = [];
const automaticRejects = [];

for (const pair of searchResults) {
  const videoId = pair[0];
  const source = pair[1].source;
  const item = details.get(videoId);
  if (!item) continue;

  const seconds = durationSeconds(item.contentDetails?.duration);
  const title = cleanText(item.snippet?.title);
  const description = cleanText(item.snippet?.description);
  const searchable = title + '\n' + description;
  let rejectReason = null;

  if (item.status?.privacyStatus !== 'public') rejectReason = 'not_public';
  else if (item.status?.embeddable !== true) rejectReason = 'embed_disabled';
  else if (seconds === null) rejectReason = 'invalid_runtime';
  else if (seconds < 60) rejectReason = 'runtime_under_1_minute';
  else if (seconds > 1800) rejectReason = 'runtime_over_30_minutes';
  else if (rejectPattern.test(title)) rejectReason = 'non_film_title';
  else if (!positivePattern.test(searchable)) rejectReason = 'weak_short_film_signal';

  if (rejectReason) {
    automaticRejects.push({
      youtubeVideoId: videoId,
      reason: rejectReason,
      title,
      rejectedAt: nowIso,
      rejectionType: 'automatic'
    });
    continue;
  }

  const views = Number(item.statistics?.viewCount || 0);
  const likes = Number(item.statistics?.likeCount || 0);
  let score = 0;
  if (positivePattern.test(title)) score += 8;
  if (positivePattern.test(description)) score += 3;
  if (prestigePattern.test(searchable)) score += 5;
  score += Math.min(Math.log10(Math.max(views, 1)), 7);
  if (views > 0 && likes > 0) score += Math.min((likes / views) * 100, 5);

  const thumbs = item.snippet?.thumbnails || {};
  const thumbnail = thumbs.maxres?.url || thumbs.standard?.url || thumbs.high?.url
    || thumbs.medium?.url || thumbs.default?.url
    || 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg';

  candidates.push({
    id: 'yt-' + videoId,
    youtubeVideoId: videoId,
    title,
    description,
    channelTitle: cleanText(item.snippet?.channelTitle),
    channelId: item.snippet?.channelId || null,
    publishedAt: item.snippet?.publishedAt || null,
    durationSeconds: seconds,
    durationMinutes: Math.ceil(seconds / 60),
    languageHint: source.languageHint,
    countryHint: source.countryHint,
    thumbnail,
    watchUrl: 'https://www.youtube.com/watch?v=' + videoId,
    embedUrl: 'https://www.youtube.com/embed/' + videoId,
    viewCount: views,
    likeCount: likes,
    discoveryQuery: source.q,
    discoveryScore: Number(score.toFixed(3)),
    status: 'pending',
    discoveredAt: nowIso,
    expiresAt: new Date(now.getTime() + expiryMs).toISOString()
  });
}

candidates.sort((a, b) => b.discoveryScore - a.discoveryScore);
const selected = candidates.slice(0, maxNew);
const queue = [...activeQueue, ...selected].slice(0, maxQueue);
const rejectedMap = new Map(
  oldRejected.map((item) => [
    videoIdFrom(item) || item?.id || String(item?.title) + ':' + String(item?.reason),
    item
  ])
);
for (const item of automaticRejects) rejectedMap.set(item.youtubeVideoId, item);
const rejected = [...rejectedMap.values()].slice(-5000);

console.log('Queries used: ' + selectedQueries.length);
for (const query of selectedQueries) console.log('QUERY ' + query.q);
console.log('Fresh search results: ' + ids.length);
console.log('Eligible candidates: ' + candidates.length);
console.log('Added to review queue: ' + selected.length);
console.log('Pending review total: ' + queue.length);
console.log('Automatically rejected this run: ' + automaticRejects.length);
for (const item of selected) {
  console.log('QUEUE ' + item.youtubeVideoId + ' | ' + item.durationSeconds
    + 's | score ' + item.discoveryScore + ' | ' + item.title);
}

if (!apply) {
  console.log('\nDRY RUN: कोई file नहीं बदली।');
  process.exit(0);
}

const atomicWrite = (file, value) => {
  const temporary = file + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(temporary, file);
};

atomicWrite(paths.queue, queue);
atomicWrite(paths.rejected, rejected);
console.log('\nAPPLIED: नयी candidates केवल review queue में रखी गयीं। Live catalogue नहीं बदला।');
