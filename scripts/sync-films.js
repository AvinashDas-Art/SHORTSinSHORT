const fs = require('fs');
const https = require('https');

const FILMS_PATH = 'src/data/films.json';

// यूट्यूब वीडियो लाइव है या डिलीट हो चुका है, यह जांचने का फंक्शन
async function checkYouTubeAlive(videoId) {
  if (!videoId || videoId.startsWith('ai-')) return true; // लोकल / AI फ़िल्मों को हमेशा सुरक्षित रखना
  
  return new Promise((resolve) => {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    https.get(url, (res) => {
      // 200 OK का मतलब वीडियो यूट्यूब पर लाइव और एक्टिव है
      // 404 या 401 का मतलब वीडियो डिलीट, प्राइवेट या अनअवेलेबल हो गया है
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(true); // नेटवर्क रुकावट पर फ़िल्म को डिलीट न करें
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

  // 1. नए और पुराने का सुरक्षित मर्जर (Duplicate Prevention)
  const filmMap = new Map();
  
  // पुरानी सभी फ़िल्मों को पहले सुरक्षित रखना
  currentFilms.forEach(film => {
    const key = film.youtubeVideoId || film.id;
    if (key) filmMap.set(key, film);
  });

  // नई फ़िल्मों को बिना पुरानी को मिटाए जोड़ना
  newIncomingFilms.forEach(film => {
    const key = film.youtubeVideoId || film.id;
    if (key && !filmMap.has(key)) {
      filmMap.set(key, film);
    }
  });

  const allFilms = Array.from(filmMap.values());
  console.log(`📊 कुल जांची जा रही फ़िल्में: ${allFilms.length}`);

  // 2. यूट्यूब डेड-लिंक जांच
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

  // 3. फ़ाइल को सुरक्षित रूप से अपडेट करना
  fs.writeFileSync(FILMS_PATH, JSON.stringify(verifiedFilms, null, 2), 'utf8');
  console.log(`✅ सिंक संपूर्ण: ${verifiedFilms.length} फ़िल्में सुरक्षित, ${deadCount} डेड लिंक्स हटाए गये।`);
}

// टेस्ट रन: बिना कोई नया डेटा डाले वर्तमान डेटा की जांच
syncAndCleanCatalog([]);
