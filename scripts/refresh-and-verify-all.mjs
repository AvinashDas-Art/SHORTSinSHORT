import fs from 'fs';
import path from 'path';
import https from 'https';

const masterCatalog = [
  {
    id: "sf_ahalya",
    title: { en: "Ahalya", hi: "अहल्या" },
    description: {
      en: "Sujoy Ghosh's iconic thriller starring Radhika Apte and Soumitra Chatterjee.",
      hi: "राधिका आप्टे और सौमित्र चटर्जी अभिनीत सुजॉय घोष की बहुचर्चित रहस्यमयी थ्रिलर।"
    },
    youtubeVideoId: "Ff82XtV78xo",
    genre: ["Thriller", "Mystery"],
    language: "Bengali",
    country: "India",
    popularityScore: 99,
    duration: "14 min",
    isFeatured: true
  },
  {
    id: "sf_chutney",
    title: { en: "Chutney", hi: "चटनी" },
    description: {
      en: "Award winning short film starring Tisca Chopra, Adil Hussain and Rasika Dugal.",
      hi: "टिस्का चोपड़ा और आदिल हुसैन अभिनीत 140M+ व्यूज़ वाली ऑल-टाइम ब्लॉकबस्टर थ्रिलर।"
    },
    youtubeVideoId: "0krwKbsQscw",
    genre: ["Drama", "Thriller"],
    language: "Hindi",
    country: "India",
    popularityScore: 99,
    duration: "16 min",
    isFeatured: true
  },
  {
    id: "sf_juice",
    title: { en: "Juice", hi: "जूस" },
    description: {
      en: "Filmfare Award winning short film directed by Neeraj Ghaywan starring Shefali Shah.",
      hi: "नीरज घेवान निर्देशित और शेफाली शाह अभिनीत फ़िल्मफ़ेयर अवार्ड विजेता क्लासिक।"
    },
    youtubeVideoId: "R-Sk7fQGIjE",
    genre: ["Drama"],
    language: "Hindi",
    country: "India",
    popularityScore: 98,
    duration: "15 min",
    isFeatured: true
  },
  {
    id: "sf_interior_cafe",
    title: { en: "Interior Cafe Night", hi: "इंटीरियर कैफ़े नाइट" },
    description: {
      en: "Naseeruddin Shah and Shernaz Patel in a touching story of love and second chances.",
      hi: "नसीरुद्दीन शाह और शेरनाज़ पटेल की ज़िंदगी और प्यार के अहसास पर बनी खूबसूरत फ़िल्म।"
    },
    youtubeVideoId: "23KufSqo6cQ",
    genre: ["Romance", "Drama"],
    language: "Hindi",
    country: "India",
    popularityScore: 96,
    duration: "13 min",
    isFeatured: false
  },
  {
    id: "sf_hair_love",
    title: { en: "Hair Love", hi: "हेयर लव" },
    description: {
      en: "Oscar-winning animated masterpiece by Matthew A. Cherry.",
      hi: "ऑस्कर विजेता खूबसूरत एनिमेटेड शॉर्ट फ़िल्म।"
    },
    youtubeVideoId: "kNw8V_Fkw28",
    genre: ["Animation", "Family"],
    language: "English",
    country: "USA",
    popularityScore: 99,
    duration: "7 min",
    isFeatured: true
  }
];

function verifyAndEnrich(film) {
  return new Promise((resolve) => {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${film.youtubeVideoId}&format=json`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            film.thumbnailUrl = parsed.thumbnail_url || `https://i.ytimg.com/vi/${film.youtubeVideoId}/hqdefault.jpg`;
            resolve(film);
          } catch (e) {
            film.thumbnailUrl = `https://i.ytimg.com/vi/${film.youtubeVideoId}/hqdefault.jpg`;
            resolve(film);
          }
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  console.log("यूट्यूब oEmbed से लाइव थंबनेल और उपलब्धता जाँची जा रही है...");
  const validFilms = [];

  for (const film of masterCatalog) {
    const verified = await verifyAndEnrich(film);
    const filmName = film.title?.hi || film.title?.en;
    if (verified) {
      console.log(`सत्यापित और लाइव: ${filmName}`);
      validFilms.push(verified);
    } else {
      console.log(`ब्लॉक/अनुपलब्ध: ${filmName}`);
    }
  }

  const filmsPath = path.resolve('src/data/films.json');
  fs.writeFileSync(filmsPath, JSON.stringify(validFilms, null, 2), 'utf8');
  console.log(`\nकुल ${validFilms.length} फ़िल्में थंबनेल सहित सेव हो गयीं!`);
}

run();
