import fs from 'node:fs';
import path from 'node:path';

// scripts/review-channels.json में लिस्ट किये गये (बड़े, तीसरे-पक्ष) channels
// की uploads playlist खंगालकर नयी फ़िल्में उसी discovery-queue.json में डालता
// है, जिसे मौजूदा "Global YouTube Discovery" पाइपलाइन पहले से इस्तेमाल करती
// है। मतलब यह candidates भी उसी GitHub Issue पर, उसी /approve या /reject
// तरीक़े से curator के सामने आएंगी। यहां से live catalogue में सीधे कुछ नहीं
// जाता।

const root = process.cwd();
const apiKey = process.env.YOUTUBE_API_KEY?.trim();
const apply = process.argv.includes('--apply');
const scanCapPerChannel = 500;

if (!apiKey) {
  console.error('ERROR: YOUTUBE_API_KEY environment variable नहीं मिली।');
  process.exit(1);
}

const paths = {
  films: path.join(root, 'src/data/films.json'),
  unavailable: path.join(root, 'src/data/unavailable-films.json'),
  queue: path.join(root, 'src/data/discovery-queue.json'),
  rejected: path.join(root, 'src/data/discovery-rejected.json'),
  approved: path.join(root, 'src/data/discovery-approved.json'),
  channels: path.join(root, 'scripts/review-channels.json')
};

const readJson = (file, fallback = []) => {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const films = readJson(paths.films);
const unavailable = readJson(paths.unavailable);
const oldQueue = readJson(paths.queue);
const oldRejected = readJson(paths.rejected);
const approved = readJson(paths.approved);
const channels = readJson(paths.channels);
const maxQueue = 500;

for (const pair of Object.entries({ films, unavailable, oldQueue, oldRejected, approved, channels })) {
  if (!Array.isArray(pair[1])) {
    console.error('ERROR: ' + pair[0] + ' का root JSON array होना चाहिए।');
    process.exit(1);
  }
}

if (!channels.length) {
  console.log('scripts/review-channels.json खाली है, कुछ नहीं किया।');
  process.exit(0);
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

// discover-youtube-films.mjs जैसे ही सिग्नल, ताकि एक चैनल की टीज़र/इंटरव्यू/
// BTS वीडियो भी catalogue की गुणवत्ता ख़राब न करें।
const rejectPattern = /(\bofficial\s+trailer\b|\btrailer\b|\bteaser\b|\breaction\b|\breview\b|\bexplained\b|\brecap\b|\bbehind the scenes\b|\bmaking of\b|\bfull episode\b|\binterview\b|\bpodcast\b|\bmusic video\b|\blyric video\b|#shorts\b|\bcoming\s+\d|\bcoming\s+soon\b|\bannouncement\b)/i;

const now = new Date();
const nowIso = now.toISOString();
const expiryMs = 28 * 24 * 60 * 60 * 1000;
const approvedIds = new Set(approved.map(videoIdFrom).filter(Boolean));
const activeQueue = oldQueue.filter((item) => {
  if (approvedIds.has(videoIdFrom(item))) return false;
  if (item?.status && item.status !== 'pending') return false;
  const expires = Date.parse(item?.expiresAt || '');
  return !Number.isFinite(expires) || expires > now.getTime();
});

const knownIds = new Set(
  [...films, ...unavailable, ...activeQueue, ...oldRejected, ...approved].map(videoIdFrom).filter(Boolean)
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

const resolveUploadsPlaylistId = async (handle) => {
  const params = new URLSearchParams({ part: 'contentDetails', forHandle: handle, key: apiKey });
  const payload = await requestJson(
    'https://www.googleapis.com/youtube/v3/channels?' + params,
    'YouTube Channels (@' + handle + ')'
  );
  const item = payload.items?.[0];
  const uploadsId = item?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) {
    console.error('ERROR: @' + handle + ' के लिए uploads playlist नहीं मिली।');
    process.exit(1);
  }
  return uploadsId;
};

const fetchUploadIds = async (playlistId, cap) => {
  const ids = [];
  let pageToken = '';
  while (ids.length < cap) {
    const params = new URLSearchParams({ part: 'contentDetails', playlistId, maxResults: '50', key: apiKey });
    if (pageToken) params.set('pageToken', pageToken);
    const payload = await requestJson(
      'https://www.googleapis.com/youtube/v3/playlistItems?' + params,
      'YouTube PlaylistItems'
    );
    for (const item of payload.items || []) {
      const id = item?.contentDetails?.videoId;
      if (id) ids.push(id);
    }
    pageToken = payload.nextPageToken || '';
    if (!pageToken) break;
  }
  return ids.slice(0, cap);
};

const fetchVideoDetails = async (ids) => {
  const details = new Map();
  for (let index = 0; index < ids.length; index += 50) {
    const batch = ids.slice(index, index + 50);
    const params = new URLSearchParams({ part: 'snippet,status,contentDetails,statistics', id: batch.join(','), key: apiKey });
    const payload = await requestJson(
      'https://www.googleapis.com/youtube/v3/videos?' + params,
      'YouTube Videos'
    );
    for (const item of payload.items || []) details.set(item.id, item);
  }
  return details;
};

const allSelected = [];
const automaticRejects = [];

for (const channel of channels) {
  const handle = String(channel.handle || '').replace(/^@/, '').trim();
  if (!handle) continue;
  const maxPerRun = Math.min(Number(channel.maxPerRun) || 15, 30);

  console.log('CHANNEL @' + handle + ': स्कैन शुरू (अधिकतम ' + scanCapPerChannel + ' वीडियो जांचेंगे)।');
  const uploadsPlaylistId = await resolveUploadsPlaylistId(handle);
  const scannedIds = await fetchUploadIds(uploadsPlaylistId, scanCapPerChannel);
  const unknownIds = scannedIds.filter((id) => !knownIds.has(id));

  console.log('CHANNEL @' + handle + ': कुल स्कैन ' + scannedIds.length + ', पहले से अनजान ' + unknownIds.length + '।');
  if (!unknownIds.length) continue;

  const details = await fetchVideoDetails(unknownIds);
  const channelCandidates = [];

  for (const videoId of unknownIds) {
    const item = details.get(videoId);
    if (!item) continue;

    const seconds = durationSeconds(item.contentDetails?.duration);
    const title = cleanText(item.snippet?.title);
    let rejectReason = null;

    if (item.status?.privacyStatus !== 'public') rejectReason = 'not_public';
    else if (item.status?.embeddable !== true) rejectReason = 'embed_disabled';
    else if (seconds === null) rejectReason = 'invalid_runtime';
    else if (seconds < 90) rejectReason = 'runtime_under_90_seconds';
    else if (seconds > 2400) rejectReason = 'runtime_over_40_minutes';
    else if (rejectPattern.test(title)) rejectReason = 'non_film_title';

    if (rejectReason) {
      automaticRejects.push({ youtubeVideoId: videoId, reason: rejectReason, title, rejectedAt: nowIso, rejectionType: 'automatic' });
      continue;
    }

    const description = cleanText(item.snippet?.description);
    const views = Number(item.statistics?.viewCount || 0);
    const thumbs = item.snippet?.thumbnails || {};
    const thumbnail = thumbs.maxres?.url || thumbs.standard?.url || thumbs.high?.url
      || thumbs.medium?.url || thumbs.default?.url
      || 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg';

    channelCandidates.push({
      id: 'yt-' + videoId,
      youtubeVideoId: videoId,
      title,
      description,
      channelTitle: cleanText(item.snippet?.channelTitle),
      channelId: item.snippet?.channelId || null,
      publishedAt: item.snippet?.publishedAt || null,
      durationSeconds: seconds,
      durationMinutes: Math.ceil(seconds / 60),
      languageHint: channel.languageHint,
      countryHint: channel.countryHint,
      thumbnail,
      watchUrl: 'https://www.youtube.com/watch?v=' + videoId,
      embedUrl: 'https://www.youtube.com/embed/' + videoId,
      viewCount: views,
      discoveryQuery: '@' + handle + ' channel upload',
      discoveryScore: Number(Math.min(Math.log10(Math.max(views, 1)), 7).toFixed(3)),
      status: 'pending',
      discoveredAt: nowIso,
      expiresAt: new Date(now.getTime() + expiryMs).toISOString()
    });
  }

  // हर run में सबसे पुरानी uploads पहले, ताकि बैकलॉग क्रम से (और पूरी तरह)
  // curator के सामने आये, सिर्फ़ सबसे लोकप्रिय वाली बार-बार न दिखें।
  channelCandidates.sort((a, b) => Date.parse(a.publishedAt || 0) - Date.parse(b.publishedAt || 0));
  const selected = channelCandidates.slice(0, maxPerRun);
  allSelected.push(...selected);

  console.log('CHANNEL @' + handle + ': योग्य ' + channelCandidates.length + ', इस बार queue में जाएंगी ' + selected.length + '।');
  for (const item of selected) {
    console.log('QUEUE ' + item.youtubeVideoId + ' | ' + item.durationSeconds + 's | ' + item.title);
  }
}

const queue = [...activeQueue, ...allSelected].slice(0, maxQueue);
const rejectedMap = new Map(
  oldRejected.map((item) => [videoIdFrom(item) || item?.id || String(item?.title) + ':' + String(item?.reason), item])
);
for (const item of automaticRejects) rejectedMap.set(item.youtubeVideoId, item);
const rejected = [...rejectedMap.values()].slice(-5000);

console.log('\nChannel-sourced नयी candidates: ' + allSelected.length);
console.log('स्वतः reject: ' + automaticRejects.length);
console.log('कुल pending queue: ' + queue.length);

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
console.log('APPLIED: नयी candidates केवल review queue में रखी गयीं। Live catalogue नहीं बदला।');
