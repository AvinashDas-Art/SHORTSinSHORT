import fs from 'fs';
import path from 'path';
import https from 'https';

const filmsPath = path.resolve('src/data/films.json');
const films = JSON.parse(fs.readFileSync(filmsPath, 'utf8'));

console.log(`कुल फ़िल्में: ${films.length}. यूट्यूब उपलब्धता की जाँच शुरू...`);

function checkYoutubeVideo(videoId) {
  return new Promise((resolve) => {
    if (!videoId) return resolve(false);

    const checkUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    https.get(checkUrl, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        // यदि वीडियो यूट्यूब पर उपलब्ध नहीं है (404 या 1200 बाइट से छोटा डमी थंबनेल)
        if (res.statusCode === 404 || buffer.length < 1200) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    }).on('error', () => resolve(false));
  });
}

async function cleanFilms() {
  const activeFilms = [];
  let removedCount = 0;

  for (const film of films) {
    const title = film.title?.en || film.title?.hi || film.id;
    const isAvailable = await checkYoutubeVideo(film.youtubeVideoId);
    
    if (isAvailable) {
      activeFilms.push(film);
    } else {
      console.log(`❌ हटाया गया: ${title} (यूट्यूब पर वीडियो अनुपलब्ध)`);
      removedCount++;
    }
  }

  fs.writeFileSync(filmsPath, JSON.stringify(activeFilms, null, 2), 'utf8');
  console.log(`\n✅ जाँच पूरी हुई!`);
  console.log(`हटाई गयी अनुपलब्ध फ़िल्में: ${removedCount}`);
  console.log(`सक्रिय बची हुई फ़िल्में: ${activeFilms.length}`);
}

cleanFilms();
