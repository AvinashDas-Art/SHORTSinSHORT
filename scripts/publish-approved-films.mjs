import fs from 'node:fs';
import path from 'node:path';

// discovery-approved.json में जो भी curator-approved फ़िल्में अभी तक live
// catalogue (films.json) में नहीं गयीं, उन्हें यहां जोड़ता है। हर approved
// entry को publishedToLive:true से चिह्नित कर देता है, ताकि दोबारा चलाने पर
// वही फ़िल्म दो बार न जुड़े।

const root = process.cwd();

const paths = {
  films: path.join(root, 'src/data/films.json'),
  approved: path.join(root, 'src/data/discovery-approved.json')
};

const readJson = (file, fallback = []) => {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const films = readJson(paths.films);
const approved = readJson(paths.approved);

for (const pair of Object.entries({ films, approved })) {
  if (!Array.isArray(pair[1])) {
    console.error('ERROR: ' + pair[0] + ' का root JSON array होना चाहिए।');
    process.exit(1);
  }
}

const videoIdFrom = (item) => {
  const raw = String(item?.youtubeVideoId || item?.videoId || item?.id || '').trim();
  return /^[A-Za-z0-9_-]{11}$/.test(raw) ? raw : null;
};

const knownFilmIds = new Set(films.map(videoIdFrom).filter(Boolean));

const cleanText = (value) => String(value || '').trim();

let addedCount = 0;
const updatedApproved = approved.map((item) => {
  const videoId = videoIdFrom(item);
  if (!videoId) return item;
  if (item.publishedToLive) return item;
  if (knownFilmIds.has(videoId)) return { ...item, publishedToLive: true, publishedAt: item.publishedAt || new Date().toISOString() };

  const title = cleanText(item.title) || 'Untitled film';
  const description = cleanText(item.description);
  const minutes = Number(item.durationMinutes) || (item.durationSeconds ? Math.ceil(item.durationSeconds / 60) : null);
  const year = item.publishedAt ? String(new Date(item.publishedAt).getFullYear()) : String(new Date().getFullYear());
  const nowIso = new Date().toISOString();

  films.push({
    id: 'yt-' + videoId,
    title,
    titleHi: title,
    director: cleanText(item.channelTitle) || 'Unknown',
    genre: ['Drama'],
    language: item.languageHint || 'Hindi',
    duration: (minutes || '?') + ' min',
    durationSeconds: item.durationSeconds ?? null,
    year,
    youtubeVideoId: videoId,
    thumbnail: item.thumbnail || ('https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg'),
    description,
    descriptionHi: description,
    country: item.countryHint || 'India',
    availability: 'available',
    youtubeHealth: {
      available: true,
      reason: null,
      checkedAt: nowIso,
      embeddable: true,
      privacyStatus: 'public',
      madeForKids: false
    }
  });
  knownFilmIds.add(videoId);
  addedCount += 1;
  console.log('PUBLISHED ' + videoId + ': ' + title);
  return { ...item, publishedToLive: true, publishedAt: nowIso };
});

if (!addedCount) {
  console.log('कोई नयी approved फ़िल्म publish करने के लिए नहीं मिली।');
  process.exit(0);
}

const atomicWrite = (file, value) => {
  const temporary = file + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(temporary, file);
};

atomicWrite(paths.films, films);
atomicWrite(paths.approved, updatedApproved);
console.log(addedCount + ' फ़िल्में live catalogue में publish हुईं।');
