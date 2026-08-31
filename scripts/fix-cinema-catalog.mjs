import fs from 'fs';
import path from 'path';

const filmsPath = path.resolve('src/data/films.json');
const rawFilms = JSON.parse(fs.readFileSync(filmsPath, 'utf8'));

const knownFilms = [
  { pattern: /\bchimes\b/i, title: "Chimes", director: "Aadish Keluskar", genres: ["Drama", "Thriller", "Suspense"] },
  { pattern: /\bjuice\b/i, title: "Juice", director: "Neeraj Ghaywan", genres: ["Drama", "Award Winning"] },
  { pattern: /\b(kriti|s a beautiful girl)\b/i, title: "Kriti", director: "Shirish Kunder", genres: ["Thriller", "Mystery", "Suspense"] },
  { pattern: /\brogan josh\b/i, title: "Rogan Josh", director: "Sanjeev Vig", genres: ["Drama", "Thriller"] },
  { pattern: /\bmanoharji ki nimmi\b/i, title: "Manoharji Ki Nimmi", director: "Sachin Gupta", genres: ["Comedy", "Drama"] },
  { pattern: /\beverything is fine\b/i, title: "Everything Is Fine", director: "Mansore", genres: ["Drama", "Family"] },
  { pattern: /\blistener\b/i, title: "Listener", director: "Tarun Dudeja", genres: ["Drama", "Mystery", "Thriller"] },
  { pattern: /\bthe promise\b/i, title: "The Promise", director: "Tigmanshu Dhulia", genres: ["Romance", "Drama"] },
  { pattern: /\bthe dinner\b/i, title: "The Dinner", director: "Siddharth Anand Kumar", genres: ["Thriller", "Crime", "Suspense"] },
  { pattern: /\bmasterpiece\b/i, title: "Masterpiece", director: "Ritesh Batra", genres: ["Drama", "Romance"] },
  { pattern: /\bpsycho\b/i, title: "Psycho", director: "Sudhir Sharma", genres: ["Thriller", "Crime", "Suspense"] },
  { pattern: /\bonboard\b/i, title: "Onboard", director: "Aparna Malladi", genres: ["Thriller", "Suspense"] },
  { pattern: /\bahalya\b/i, title: "Ahalya", director: "Sujoy Ghosh", genres: ["Thriller", "Mystery", "Suspense"] },
  { pattern: /\bchutney\b/i, title: "Chutney", director: "Jyoti Kapur Das", genres: ["Thriller", "Drama", "Suspense"] },
  { pattern: /\banukul\b/i, title: "Anukul", director: "Sujoy Ghosh", genres: ["Sci-Fi", "Thriller", "Suspense"] },
  { pattern: /\bthe school bag\b/i, title: "The School Bag", director: "Dheeraj Jindal", genres: ["Drama", "Emotional"] },
  { pattern: /\b(ouch|neeraj pandey)\b/i, title: "Ouch", director: "Neeraj Pandey", genres: ["Comedy", "Drama", "Thriller"] },
  { pattern: /\btaandav\b/i, title: "Taandav", director: "Devashish Makhija", genres: ["Drama", "Crime", "Thriller"] },
  { pattern: /\brubaru\b/i, title: "Rubaru", director: "Tisca Chopra", genres: ["Drama", "Thriller", "Suspense"] },
  { pattern: /\bthe bypass\b/i, title: "The Bypass", director: "Amit Kumar", genres: ["Crime", "Thriller", "Suspense"] },
  { pattern: /\bshunyata\b/i, title: "Shunyata", director: "Chintan Sarda", genres: ["Crime", "Drama", "Thriller"] },
  { pattern: /\bkahanibaaz\b/i, title: "Kahanibaaz", director: "Sandeep Verma", genres: ["Drama", "Thriller", "Suspense"] },
  { pattern: /\bbarat\b/i, title: "Barat", director: "Anoop Joshi", genres: ["Comedy", "Drama"] },
  { pattern: /\bpaneer ki sabzi\b/i, title: "Paneer Ki Sabzi", director: "Anupam Sharma", genres: ["Drama", "Family"] },
  { pattern: /\bgratitude list\b/i, title: "The Gratitude List", director: "Chandan Anand", genres: ["Drama", "Romance"] },
  { pattern: /\bhair love\b/i, title: "Hair Love", director: "Matthew A. Cherry", genres: ["Animation", "Family"] },
  { pattern: /\binterior cafe\b/i, title: "Interior Cafe Night", director: "Adhiraj Bose", genres: ["Romance", "Drama"] }
];

function processFilm(film) {
  const rawTitle = film.title?.en || film.title?.hi || film.title || '';
  const rawDesc = film.description?.en || film.description?.hi || film.description || '';
  const full = `${rawTitle} ${rawDesc}`;

  for (const item of knownFilms) {
    if (item.pattern.test(full)) {
      return {
        ...film,
        title: { en: item.title, hi: item.title },
        director: item.director,
        genre: item.genres
      };
    }
  }

  // सामान्य सफ़ाई
  let cleanTitle = rawTitle.replace(/\|.*$/g, '');
  cleanTitle = cleanTitle.replace(/^.*?['’]s\s+/gi, '');
  cleanTitle = cleanTitle.replace(/\b(Award Winning|Award-Winning|Hindi|English|Short Film|Full Movie|Oscar Winning|Latest|Acclaimed|Best|HD|4K|Comedy|Drama|Thriller)\b/gi, '');
  cleanTitle = cleanTitle.replace(/[-–—:|]+/g, ' ').replace(/\s+/g, ' ').trim();

  if (!cleanTitle || cleanTitle.length < 2 || cleanTitle.toLowerCase() === 'cinema short') {
    cleanTitle = rawTitle.slice(0, 20).trim();
  }

  let dir = film.director;
  if (!dir || dir.includes('Acclaimed') || dir === 'Filmmaker') {
    const match = full.match(/(?:directed by|director|written and directed by)\s*[:\-]?\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)/i);
    dir = match ? match[1].replace(/\s+(?:starring|featuring|and).*$/i, '').trim() : "Acclaimed Filmmaker";
  }

  // थ्रिलर कीवर्ड्स की जाँच
  const existingGenres = Array.isArray(film.genre) ? [...film.genre] : ["Drama"];
  if (/thriller|crime|mystery|murder|suspense|killer|police|investigation/i.test(full)) {
    if (!existingGenres.includes("Thriller")) existingGenres.push("Thriller");
    if (!existingGenres.includes("Suspense")) existingGenres.push("Suspense");
  }

  return {
    ...film,
    title: { en: cleanTitle, hi: cleanTitle },
    director: dir,
    genre: existingGenres
  };
}

const cleanedCatalog = rawFilms.map(processFilm);
fs.writeFileSync(filmsPath, JSON.stringify(cleanedCatalog, null, 2), 'utf8');
console.log(`✅ ${cleanedCatalog.length} फ़िल्मों के टाइटल्स, डायरेक्टर्स और थ्रिलर जॉनर्स पूरी तरह दुरुस्त हो गए!`);
