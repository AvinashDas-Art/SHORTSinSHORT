import fs from 'node:fs';
import path from 'node:path';

// भरोसेमंद channels (जैसे अपना own AI-film channel) से नयी uploads सीधे
// live catalogue (films.json) में जोड़ता है, बिना curator review के। सिर्फ़
// scripts/trusted-channels.json में लिस्ट किये गये channels ही यहां चलते हैं,
// इसलिए यह अनजान/random channels पर लागू नहीं होता।

const root = process.cwd();
const apiKey = process.env.YOUTUBE_API_KEY?.trim();
const apply = process.argv.includes('--apply');
const defaultMaxDurationSeconds = 40 * 60;

if (!apiKey) {
  console.error('ERROR: YOUTUBE_API_KEY environment variable नहीं मिली।');
  process.exit(1);
}

const paths = {
  films: path.join(root, 'src/data/films.json'),
  unavailable: path.join(root, 'src/data/unavailable-films.json'),
  channels: path.join(root, 'scripts/trusted-channels.json')
};

const readJson = (file, fallback = []) => {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const films = readJson(paths.films);
const unavailable = readJson(paths.unavailable);
const channels = readJson(paths.channels);

for (const pair of Object.entries({ films, unavailable, channels })) {
  if (!Array.isArray(pair[1])) {
    console.error('ERROR: ' + pair[0] + ' का root JSON array होना चाहिए।');
    process.exit(1);
  }
}

if (!channels.length) {
  console.log('scripts/trusted-channels.json खाली है, कुछ नहीं किया।');
  process.exit(0);
}

const videoIdFrom = (item) => {
  const values = [item?.youtubeVideoId, item?.youtubeId, item?.videoId, item?.id];
  for (const value of values) {
    const raw = String(value || '').trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  }
  return null;
};

const knownIds = new Set([...films, ...unavailable].map(videoIdFrom).filter(Boolean));

const titleKey = (value) => cleanText(value)
  .toLowerCase()
  .replace(/\b(remastered|4k|full film|with eng(?:lish)? subtitles?)\b/g, '')
  .replace(/\(\s*\)/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

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

const knownTitleKeys = new Set(films.map((film) => titleKey(film.title)).filter(Boolean));

const patternsFrom = (values) => (Array.isArray(values) ? values : [])
  .map((value) => {
    try {
      return new RegExp(String(value), 'i');
    } catch {
      console.error('ERROR: ग़लत regular expression: ' + value);
      process.exit(1);
    }
  });

const cleanCatalogueTitle = (value, style) => {
  const title = cleanText(value);
  if (style !== 'ftii') return title;
  return title
    .replace(/\s*(?:\||-)?\s*FTII\s+Student\s+Films?.*$/i, '')
    .replace(/\s+Acting\s+Diploma\s+Film.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const directorFromTitle = (value, fallback) => {
  const title = cleanText(value);
  const match = title.match(/(?:directed\s+by|dir\.?\s*(?:&\s*script\s*)?by|direction\s+by|student\s+films?\s+by|diploma\s+film\s+directed\s+by)\s+([^|]+)/i);
  if (!match) return fallback;
  const director = match[1]
    .replace(/\s+ft\..*$/i, '')
    .replace(/\s+with\s+.*$/i, '')
    .trim();
  return director || fallback;
};

const LANGUAGE_CODES = new Map([
  ['as', 'Assamese'], ['bn', 'Bengali'], ['bho', 'Bhojpuri'], ['en', 'English'],
  ['gu', 'Gujarati'], ['hi', 'Hindi'], ['kn', 'Kannada'], ['mai', 'Maithili'],
  ['ml', 'Malayalam'], ['mr', 'Marathi'], ['ne', 'Nepali'], ['or', 'Odia'],
  ['pa', 'Punjabi'], ['sa', 'Sanskrit'], ['ta', 'Tamil'], ['te', 'Telugu'], ['ur', 'Urdu']
]);

const inferLanguage = (item, channel) => {
  if (!channel.inferLanguage) return channel.language || 'Various';
  const rawCode = cleanText(item.snippet?.defaultAudioLanguage || item.snippet?.defaultLanguage).toLowerCase();
  const baseCode = rawCode.split(/[-_]/)[0];
  if (LANGUAGE_CODES.has(baseCode)) return LANGUAGE_CODES.get(baseCode);

  const source = cleanText(`${item.snippet?.title || ''}\n${item.snippet?.description || ''}`);
  const names = [
    ['Assamese', /\bassamese\b/i], ['Bengali', /\b(?:bengali|bangla)\b/i],
    ['Bhojpuri', /\bbhojpuri\b/i], ['Gujarati', /\bgujarati\b/i],
    ['Hindi', /\bhindi\b/i], ['Kannada', /\bkannada\b/i],
    ['Maithili', /\bmaithili\b/i], ['Malayalam', /\bmalayalam\b/i],
    ['Marathi', /\bmarathi\b/i], ['Nepali', /\bnepali\b/i],
    ['Odia', /\b(?:odia|oriya)\b/i], ['Punjabi', /\bpunjabi\b/i],
    ['Sanskrit', /\bsanskrit\b/i], ['Tamil', /\btamil\b/i],
    ['Telugu', /\btelugu\b/i], ['Urdu', /\burdu\b/i]
  ];
  return names.find(([, pattern]) => pattern.test(source))?.[0] || channel.language || 'Various';
};

const genresFor = (item, channel) => {
  const configured = Array.isArray(channel.genre) ? channel.genre : [String(channel.genre || 'Drama')];
  if (!channel.inferGenre) return configured;
  const title = cleanText(item.snippet?.title || '');
  const description = cleanText(item.snippet?.description || '');
  const source = `${title}\n${description}`;
  if (/\b(?:non[- ]?fiction|documentary)\b/i.test(source)) return ['Documentary', 'Student Film'];
  const explicitlyAnimated = /\b(?:animated|animation|stop[- ]?motion)\s+(?:student\s+|diploma\s+)?(?:short\s+)?film\b/i.test(source)
    || /\b(?:student\s+|diploma\s+|short\s+)?film\s+(?:in\s+)?(?:animation|stop[- ]?motion)\b/i.test(source)
    || /\b(?:CGI|2D|3D)\s+animated\b/i.test(title);
  if (explicitlyAnimated) return ['Animation', 'Student Film'];
  return configured;
};

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

const fetchAllUploadIds = async (playlistId, cap = 200) => {
  const ids = [];
  let pageToken = '';
  while (ids.length < cap) {
    const params = new URLSearchParams({
      part: 'contentDetails',
      playlistId,
      maxResults: '50',
      key: apiKey
    });
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
    const params = new URLSearchParams({ part: 'snippet,status,contentDetails', id: batch.join(','), key: apiKey });
    const payload = await requestJson(
      'https://www.googleapis.com/youtube/v3/videos?' + params,
      'YouTube Videos'
    );
    for (const item of payload.items || []) details.set(item.id, item);
  }
  return details;
};

const additions = [];

for (const channel of channels) {
  const handle = String(channel.handle || '').replace(/^@/, '').trim();
  if (!handle) continue;
  const minDuration = Number(channel.minDurationSeconds) || 90;
  const maxDuration = Number(channel.maxDurationSeconds) || defaultMaxDurationSeconds;
  const scanLimit = Number(channel.scanLimit) || 200;
  const includeTitlePatterns = patternsFrom(channel.includeTitlePatterns);
  const excludeTitlePatterns = patternsFrom(channel.excludeTitlePatterns);

  console.log('CHANNEL @' + handle + ': जांच शुरू।');
  const uploadsPlaylistId = await resolveUploadsPlaylistId(handle);
  const uploadIds = await fetchAllUploadIds(uploadsPlaylistId, scanLimit);
  const newIds = uploadIds.filter((id) => !knownIds.has(id));

  if (!newIds.length) {
    console.log('CHANNEL @' + handle + ': कोई नयी वीडियो नहीं।');
    continue;
  }

  const details = await fetchVideoDetails(newIds);
  for (const videoId of newIds) {
    const item = details.get(videoId);
    if (!item) continue;

    const seconds = durationSeconds(item.contentDetails?.duration);
    const rawTitle = cleanText(item.snippet?.title);
    const title = cleanCatalogueTitle(rawTitle, channel.titleStyle);
    const description = cleanText(item.snippet?.description).slice(0, 280);

    if (excludeTitlePatterns.some((pattern) => pattern.test(rawTitle))) {
      console.log('SKIP ' + videoId + ' (' + rawTitle + '): lecture/interview/promo filter।');
      continue;
    }
    if (includeTitlePatterns.length && !includeTitlePatterns.some((pattern) => pattern.test(rawTitle))) {
      console.log('SKIP ' + videoId + ' (' + rawTitle + '): पूरी student film के रूप में चिह्नित नहीं।');
      continue;
    }

    if (item.status?.privacyStatus !== 'public') {
      console.log('SKIP ' + videoId + ' (' + title + '): private/unlisted।');
      continue;
    }
    if (item.status?.embeddable !== true) {
      console.log('SKIP ' + videoId + ' (' + title + '): embed disabled।');
      continue;
    }
    if (seconds === null || seconds < minDuration) {
      console.log('SKIP ' + videoId + ' (' + title + '): ' + (seconds ?? '?') + 's, यह टीज़र/प्रोमो लग रहा है, पूरी फ़िल्म नहीं।');
      continue;
    }
    if (seconds > maxDuration) {
      console.log('SKIP ' + videoId + ' (' + title + '): ' + seconds + 's, ऊपरी सीमा से ज़्यादा लंबी।');
      continue;
    }

    const key = titleKey(title);
    if (key && knownTitleKeys.has(key)) {
      console.log('SKIP ' + videoId + ' (' + title + '): यही फ़िल्म catalogue में पहले से है।');
      continue;
    }

    const thumbs = item.snippet?.thumbnails || {};
    const thumbnail = thumbs.maxres?.url || thumbs.standard?.url || thumbs.high?.url
      || thumbs.medium?.url || thumbs.default?.url
      || 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg';

    const nowIso = new Date().toISOString();
    const titleYear = rawTitle.match(/\b(19|20)\d{2}\b/)?.[0];
    const year = titleYear || String(new Date(item.snippet?.publishedAt || Date.now()).getFullYear());
    const fallbackDirector = cleanText(item.snippet?.channelTitle) || handle;

    additions.push({
      id: 'yt-' + handle.toLowerCase() + '-' + videoId,
      title,
      titleHi: title,
      director: directorFromTitle(rawTitle, fallbackDirector),
      genre: genresFor(item, channel),
      language: inferLanguage(item, channel),
      duration: Math.ceil(seconds / 60) + ' min',
      durationSeconds: seconds,
      year,
      youtubeVideoId: videoId,
      thumbnail,
      description,
      descriptionHi: description,
      country: channel.country || 'India',
      collections: Array.isArray(channel.collections) ? channel.collections : [],
      availability: 'available',
      youtubeHealth: {
        available: true,
        reason: null,
        checkedAt: nowIso,
        embeddable: true,
        privacyStatus: 'public',
        madeForKids: Boolean(item.status?.madeForKids)
      }
    });
    knownTitleKeys.add(key);
    console.log('ADD ' + videoId + ': ' + title + ' (' + Math.ceil(seconds / 60) + ' min)');
  }
}

console.log('\nनयी फ़िल्में जोड़ी जानी हैं: ' + additions.length);

if (!apply) {
  console.log('DRY RUN: कोई file नहीं बदली।');
  process.exit(0);
}

if (!additions.length) {
  console.log('APPLIED: कुछ नया नहीं मिला, films.json नहीं बदला।');
  process.exit(0);
}

const atomicWrite = (file, value) => {
  const temporary = file + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(temporary, file);
};

atomicWrite(paths.films, [...films, ...additions]);
console.log('APPLIED: ' + additions.length + ' फ़िल्में सीधे live catalogue में जोड़ी गयीं।');
