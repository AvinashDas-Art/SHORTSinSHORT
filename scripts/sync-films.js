import fs from 'fs';
import https from 'https';

const FILMS_PATH = 'src/data/films.json';

async function checkYouTubeAlive(videoId) {
  if (!videoId || videoId.startsWith('ai-')) return true;
  
  return new Promise((resolve) => {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(true);
    });
  });
}

async function syncAndCleanCatalog(newIncomingFilms = []) {
  console.log('🔄 कैटलॉग चेकिंग और सिंक शुरू हो रहा है...');
  
  let currentFilms = [];
  try {
    currentFilms = JSON.parse(fs.readFileSync(FILMS_PATH, 'utf8'));
  } catch (e) {
    currentFilms = [];
  }

  const filmMap = new Map();
  currentFilms.forEach(film => {
    const key = film.youtubeVideoId || film.id;
    if (key) filmMap.set(key, film);
  });

  newIncomingFilms.forEach(film => {
    const key = film.youtubeVideoId || film.id;
    if (key && !filmMap.has(key)) {
      filmMap.set(key, film);
    }
  });

  const allFilms = Array.from(filmMap.values());
  console.log(`📊 कुल जांची जा रही फ़िल्में: ${allFilms.length}`);

  const verifiedFilms = [];
  let deadCount = 0;

  for (const film of allFilms) {
    const vid = film.youtubeVideoId || film.id;
    const isAlive = await checkYouTubeAlive(vid);
    
    if (isAlive) {
      verifiedFilms.push(film);
    } else {
      console.log(`❌ यूट्यूब से हटाई जा चुकी फ़िल्म को निकाला गया: ${film.title} (${vid})`);
      deadCount++;
    }
  }

  fs.writeFileSync(FILMS_PATH, JSON.stringify(verifiedFilms, null, 2), 'utf8');
  console.log(`✅ सिंक संपूर्ण: ${verifiedFilms.length} फ़िल्में सुरक्षित, ${deadCount} डेड लिंक्स हटाए गये।`);
}

syncAndCleanCatalog([]);
