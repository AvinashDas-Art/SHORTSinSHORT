import fs from 'node:fs';
import path from 'node:path';
import { cleanEditorialText, cleanFilmTitle } from '../src/utils/editorialText.js';

const root = process.cwd();
const filmsPath = path.join(root, 'src/data/films.json');
const writeChanges = process.argv.includes('--write');
const metadataFileIndex = process.argv.indexOf('--metadata-file');
const cachedDetails = new Map();
if (metadataFileIndex >= 0 && process.argv[metadataFileIndex + 1]) {
  const cachedRows = JSON.parse(fs.readFileSync(process.argv[metadataFileIndex + 1], 'utf8'));
  for (const row of cachedRows) {
    if (row?.id && row?.videoDetails) cachedDetails.set(row.id, row.videoDetails);
  }
}
const oembedFileIndex = process.argv.indexOf('--oembed-file');
const cachedOembed = new Map();
if (oembedFileIndex >= 0 && process.argv[oembedFileIndex + 1]) {
  const cachedRows = JSON.parse(fs.readFileSync(process.argv[oembedFileIndex + 1], 'utf8'));
  for (const row of cachedRows) {
    if (row?.id && row?.title) cachedOembed.set(row.id, row);
  }
}

const LANGUAGE_GROUPS = {
  Marathi: `5NsH9t-Lr8Q zD3dV0gQZOI ZhhGkqjCNsM mnuRxNiaOuo jABoeWQ1eLk l9IZFRP583U LwC5E5vi_2w eBGxhmh7O6A 0uKCEAKg0mA TIGNZIlb_Xo eVoJckqsxi8 XZxWmXB08Pw -meDyytJHDs bHNAi9KJUaA SPCLzONO_es cznZD4wyqE8 I73O7-HNzjM KwMoz_4HkzM KYUgN7rKEmc QgCe7CJDtWY w8yxCMIuhcw iP9hFXpKlgY`,
  Tamil: `khyokxd5xO0 soWrXaQmV3E 8EHK1KueVyU OZYLe-6KHuI dqXw7B-nx-M gKOknvYy80Y iKad0wyLmUU rWmNh_6Hfv8`,
  Telugu: `M4KAtiNCrDw 0h4mhD9_roU 4WnJ3hidXYs 9-eAn5YORqI imVhrFm_sFo s3oB7QwVDp0 jaREpV8IYd0 0FdXv_jf3pw pkghNLsmyHA Kv7vUK_3sFM mhZeNoTglDg y4jUy9yGP48 15QEeXhsJYk`,
  Kannada: `CU9ZmY8v8qw XsYsQahIaqw 24lJQ90B2Kg V_LUrm-ve_w x_U7_xahhrU NnXXSQSca24 nNbLKmDwIkY G26IlxL4Xhg qzjo8XicF6c NfkRrKkJHFI 802jamS-9AY khsQYaYRTTA -lFl0BAr1Kg OrQ9qy9W-fY Ljd2FXIXlFw wx53mSBxnK0`,
  Malayalam: `aesjDha3D7c 6qCb6D5K0F4 X2XfkAK7r4Y LxjKZmHMk5M C-PYmAVP9u4 vLM_ivbH9uA Nok9SRX8KFs dsf_z4urc4s C7OQHIpDlvA QqCZcMAC5Hk jolU7ruhDmY Q83v5ZfiAmE wXKBEu9LYDQ 2uE5PXVK6Uc y6qbdSuJOyI CxBpMNEzg_c 8iS1bQ3XNyM fwx2YNMLYfg FO38Qrov9xk`,
  Bengali: `01ycBhh60aU hskEXa2m7hQ k6D5ln72cTw gef6jPNQmOs QjjDZK1BSJE mol4DmkH88U Y5hcDPJycN4 7-uWVxCw6sY -qhhq-9cJ5g GWS6QDE7nZ8 28VLFaRIYRg S7ypMVbavd4 0p09on-iqjc iB4_GnZyvbY duN6InB7VKc`,
  Maithili: `ud9_4GsSiyo WlwUPTXVI-g`,
  Hindi: `mH_3Ljrv5gY iJcF89zXHPo 7z4MY4bWHSE l-ePFtPOxPQ snwjNEETPNY 5LdhH8oKbIY dw6k0yk6xi4 f1huqjdHIRQ eVVPkXjGM4M bMroddUAxCQ 7YewUWrLGY8 aIUufwqbZ0Q loy2jtolh7Q N7sB2u8n2GU bGqfHLFgFUQ EMIM0nSbs3Y ZcedNDaAjRQ`,
  Gujarati: `ishwhdzsGeg`,
  English: `-uoFbA4kmww D9gTYl95mXw mWMznt3IGtM Jvgton25o4s Lzz50xENH4g kV-J0hgcet8 Ene7vSejlEw Z61aXhHIkJo mgQfCUNf0no k1vCrsZ80M4`,
  Urdu: `Ytz56Em0X5g`,
  Hungarian: `0piiNk_jMrE`,
  Danish: `8uVqWlq75Nw`,
  German: `PwrySjp4J9Q`,
  French: `LbntfTD-Vxk`
};

const LANGUAGE_BY_ID = new Map();
for (const [language, ids] of Object.entries(LANGUAGE_GROUPS)) {
  for (const id of ids.split(/\s+/).filter(Boolean)) LANGUAGE_BY_ID.set(id, language);
}

const OSCAR_WINNER_IDS = new Set(`Jvgton25o4s Lzz50xENH4g 0piiNk_jMrE 8uVqWlq75Nw kV-J0hgcet8 Ene7vSejlEw Z61aXhHIkJo PwrySjp4J9Q LbntfTD-Vxk mgQfCUNf0no k1vCrsZ80M4`.split(/\s+/));

const TITLE_OVERRIDES = {
  'ZhhGkqjCNsM': 'Kevada',
  'cznZD4wyqE8': 'Paandhrya',
  'soWrXaQmV3E': 'Kuppaikkaaran',
  'eVoJckqsxi8': 'The Intruder',
  '8EHK1KueVyU': 'Love Changes Everything',
  'dqXw7B-nx-M': 'Savadhal',
  'gKOknvYy80Y': "Daro Mat (Don't Be Afraid)",
  '0h4mhD9_roU': 'Korrameenu',
  'imVhrFm_sFo': 'Prayatnam',
  'jaREpV8IYd0': 'Dhaara',
  '9-eAn5YORqI': 'The Film',
  'pkghNLsmyHA': 'Chappal',
  'Kv7vUK_3sFM': 'Dare',
  '802jamS-9AY': 'Ee Vishya Nammaolage Irli',
  'V_LUrm-ve_w': 'Kumarana Vadhe',
  '6qCb6D5K0F4': 'Robusta',
  'dsf_z4urc4s': 'Chalk',
  'FO38Qrov9xk': 'Chelemanushi',
  'CxBpMNEzg_c': 'Arakk',
  '01ycBhh60aU': 'Poroshpor',
  'k6D5ln72cTw': 'Probaho',
  'duN6InB7VKc': 'First Boy',
  '-meDyytJHDs': 'Olakh',
  'XZxWmXB08Pw': 'Sthal',
  'WlwUPTXVI-g': 'Namonarayan',
  'w8yxCMIuhcw': 'Opingo Bethingo',
  'EMIM0nSbs3Y': 'CatDog',
  'Ytz56Em0X5g': 'Aakhri Train',
  'Jvgton25o4s': 'An Irish Goodbye',
  'Lzz50xENH4g': 'The Long Goodbye',
  '0piiNk_jMrE': 'Sing',
  '8uVqWlq75Nw': 'Helium',
  'kV-J0hgcet8': 'The Shore',
  'Ene7vSejlEw': 'God of Love',
  'Z61aXhHIkJo': 'The New Tenants',
  'PwrySjp4J9Q': 'Toyland',
  'LbntfTD-Vxk': 'Le Mozart des Pickpockets',
  'mgQfCUNf0no': 'West Bank Story',
  'k1vCrsZ80M4': "The Neighbors' Window"
};

const MULTI_LANGUAGE_BY_ID = {
  'mH_3Ljrv5gY': ['Hindi', 'Persian'],
  '7z4MY4bWHSE': ['Hindi', 'English'],
  '7YewUWrLGY8': ['Hindi', 'Bundeli'],
  'aIUufwqbZ0Q': ['Hindi', 'Marathi'],
  'D9gTYl95mXw': ['English', 'Hindi'],
  'EMIM0nSbs3Y': ['Hindi', 'Marathi'],
  'mWMznt3IGtM': ['English', 'Hindi'],
  'mgQfCUNf0no': ['English', 'Hebrew', 'Arabic']
};

const FTII_FALLBACK_IDS = new Set(`KwMoz_4HkzM mH_3Ljrv5gY ishwhdzsGeg iJcF89zXHPo 7z4MY4bWHSE l-ePFtPOxPQ snwjNEETPNY 5LdhH8oKbIY dw6k0yk6xi4 KYUgN7rKEmc QgCe7CJDtWY w8yxCMIuhcw f1huqjdHIRQ eVVPkXjGM4M bMroddUAxCQ 7YewUWrLGY8 aIUufwqbZ0Q loy2jtolh7Q N7sB2u8n2GU D9gTYl95mXw bGqfHLFgFUQ EMIM0nSbs3Y mWMznt3IGtM iP9hFXpKlgY ZcedNDaAjRQ`.split(/\s+/));

const placeholder = (film) => /^Film\s+[A-Za-z0-9_-]{11}$/i.test(String(film.title || ''));

function objectAfter(source, marker) {
  const markerAt = source.indexOf(marker);
  if (markerAt < 0) return null;
  const start = source.indexOf('{', markerAt + marker.length);
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === '{') depth += 1;
    else if (character === '}' && --depth === 0) {
      try { return JSON.parse(source.slice(start, index + 1)); } catch { return null; }
    }
  }
  return null;
}

async function youtubeDetails(videoId) {
  if (cachedDetails.has(videoId)) {
    const details = { ...cachedDetails.get(videoId) };
    if (!details.title || placeholder({ title: details.title })) details.title = cachedOembed.get(videoId)?.title || details.title;
    if (!details.author) details.author = cachedOembed.get(videoId)?.author || details.author;
    return details;
  }
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9' },
    signal: AbortSignal.timeout(45_000)
  });
  if (!response.ok) throw new Error(`YouTube returned ${response.status}`);
  const html = await response.text();
  const details = objectAfter(html, '"videoDetails":');
  if (!details) throw new Error('videoDetails missing');
  if (!details.title || placeholder({ title: details.title })) {
    const oembed = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`, {
      signal: AbortSignal.timeout(30_000)
    });
    if (oembed.ok) {
      const metadata = await oembed.json();
      details.title = metadata.title || details.title;
      details.author = metadata.author_name || details.author;
    }
  }
  return details;
}

function directorFrom(title, description, channelTitle) {
  const source = `${title}\n${description}`;
  const match = source.match(/(?:story\s*(?:&|and)\s*direction|written\s*(?:&|and)\s*directed|directed|direction|student\s+film)\s*(?:by|:)\s*([^\n|]{2,70})/i);
  return String(match?.[1] || channelTitle || 'Independent filmmaker').replace(/\s+(?:ft\.|featuring).*$/i, '').trim();
}

function genresFrom(title, description) {
  const source = `${title} ${description}`.toLowerCase();
  const genres = [];
  if (/award|winner|festival|oscar|academy award/.test(source)) genres.push('Award Winning');
  if (/documentary|non[ -]?fiction|true story/.test(source)) genres.push('Documentary');
  if (/animat|stop[ -]?motion/.test(source)) genres.push('Animation');
  if (/horror|supernatural/.test(source)) genres.push('Horror');
  if (/thriller|suspense|mystery|crime/.test(source)) genres.push('Thriller');
  if (/comedy|comic|funny|humou?r/.test(source)) genres.push('Comedy');
  if (/romance|romantic|love story/.test(source)) genres.push('Romance');
  if (!genres.some((genre) => genre !== 'Award Winning')) genres.push('Drama');
  return [...new Set(genres)].slice(0, 3);
}

const LANGUAGE_NAMES = ['Hindi', 'Marathi', 'Bengali', 'Bangla', 'Maithili', 'Bhojpuri', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Gujarati', 'Urdu', 'English', 'Persian', 'Bundeli', 'Hungarian', 'Danish', 'German', 'French', 'Hebrew', 'Arabic'];

function languagesFrom(videoId, title, description, fallback) {
  if (MULTI_LANGUAGE_BY_ID[videoId]) return MULTI_LANGUAGE_BY_ID[videoId];
  if (LANGUAGE_BY_ID.has(videoId)) return [LANGUAGE_BY_ID.get(videoId)];
  const declared = description.match(/(?:Original\s+)?Language(?:\(s\))?\s*[:\-]\s*([^\n]+)/i)?.[1] || '';
  const source = `${declared} ${title}`;
  const found = LANGUAGE_NAMES.filter((language) => new RegExp(`\\b${language}\\b`, 'i').test(source))
    .map((language) => language === 'Bangla' ? 'Bengali' : language);
  return [...new Set(found.length ? found : [fallback].filter(Boolean))];
}

function collectionsFor(videoId, title, channelTitle) {
  const collections = [];
  if (FTII_FALLBACK_IDS.has(videoId) || /ftii/i.test(`${title} ${channelTitle}`)) collections.push('FTII Students Shorts');
  if (OSCAR_WINNER_IDS.has(videoId)) collections.push('Shorts in Oscar');
  return collections;
}

const films = JSON.parse(fs.readFileSync(filmsPath, 'utf8'));
const targets = films.filter(placeholder);
if (!targets.length) {
  console.log('No manually curated films found.');
  process.exit(0);
}

let cursor = 0;
let failures = 0;
const enriched = new Map();
async function worker() {
  while (cursor < targets.length) {
    const film = targets[cursor++];
    const videoId = film.youtubeVideoId || film.id;
    try {
      const details = await youtubeDetails(videoId);
      const rawTitle = details.title || TITLE_OVERRIDES[videoId] || film.title;
      const title = TITLE_OVERRIDES[videoId] || cleanFilmTitle(rawTitle) || film.title;
      const description = cleanEditorialText(details.shortDescription) || 'A handpicked film from the SHORTSinSHORT cinematheque.';
      const durationSeconds = Number(details.lengthSeconds) || null;
      const year = rawTitle.match(/\b(19|20)\d{2}\b/)?.[0] || film.year;
      const languages = languagesFrom(videoId, rawTitle, details.shortDescription || '', film.language);
      enriched.set(videoId, {
        ...film,
        title,
        titleHi: title,
        director: directorFrom(rawTitle, details.shortDescription, details.author),
        channelTitle: details.author,
        genre: genresFrom(rawTitle, details.shortDescription),
        language: languages[0] || film.language,
        languages,
        duration: durationSeconds ? `${Math.ceil(durationSeconds / 60)} min` : film.duration,
        durationSeconds,
        year,
        youtubeVideoId: videoId,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        description,
        descriptionHi: description,
        collections: collectionsFor(videoId, rawTitle, details.author),
        availability: details.isCrawlable === false ? 'unavailable' : 'available'
      });
    } catch (error) {
      failures += 1;
      console.error(`FAILED ${videoId}: ${error.message}`);
    }
  }
}

await Promise.all(Array.from({ length: 12 }, worker));
const output = films.map((film) => enriched.get(film.youtubeVideoId || film.id) || film);
const remaining = output.filter(placeholder);
console.log(`Enriched ${enriched.size}/${targets.length}; failures ${failures}; placeholders left ${remaining.length}.`);

if (!writeChanges) {
  console.log('Dry run only. Add --write to update src/data/films.json.');
  process.exit(remaining.length ? 1 : 0);
}

const temporary = `${filmsPath}.tmp`;
fs.writeFileSync(temporary, `${JSON.stringify(output, null, 2)}\n`);
fs.renameSync(temporary, filmsPath);
