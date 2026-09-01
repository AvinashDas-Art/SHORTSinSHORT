import fs from 'fs';
import path from 'path';

const filmsPath = path.resolve('src/data/films.json');
const rawFilms = JSON.parse(fs.readFileSync(filmsPath, 'utf8'));

const directorMapping = [
  { pattern: /\bpiper\b/i, title: "Piper", director: "Alan Barillaro", lang: "English", country: "USA" },
  { pattern: /\bforevergreen\b/i, title: "Forevergreen", director: "Nathan Engelhardt & Jeremy Spears", lang: "English", country: "USA" },
  { pattern: /\bnapo\b/i, title: "Napo", director: "Gustavo Ribeiro", lang: "English", country: "Global" },
  { pattern: /\bumbrella\b/i, title: "Umbrella", director: "Helena Hilario & Mario Pece", lang: "Silent", country: "Global" },
  { pattern: /\banimated movies for kids\b/i, title: "Wings of Hope", director: "Pixar Artists", lang: "English", country: "USA" },
  { pattern: /\bsamsaara\b/i, title: "Samsaara", director: "Ruturaj Dhalgade", lang: "Hindi", country: "India" },
  { pattern: /\bwindow seat in kashmir\b/i, title: "Window Seat in Kashmir", director: "Imtiaz Ali", lang: "Hindi", country: "India" },
  { pattern: /\bneed\b/i, title: "Need", director: "Ganga", lang: "Hindi", country: "India" },
  { pattern: /\bthe embrace\b/i, title: "The Embrace", director: "Veena Bakshi", lang: "Hindi", country: "India" },
  { pattern: /\bpardah\b/i, title: "Pardah", director: "K Rohit Ramswami", lang: "Hindi", country: "India" },
  { pattern: /\bchimes\b/i, title: "Chimes", director: "Aadish Keluskar", lang: "Hindi", country: "India" },
  { pattern: /\bthe promise\b/i, title: "The Promise", director: "Tigmanshu Dhulia", lang: "Hindi", country: "India" },
  { pattern: /\bthe dinner\b/i, title: "The Dinner", director: "Siddharth Anand Kumar", lang: "Hindi", country: "India" },
  { pattern: /\bmasterpiece\b/i, title: "Masterpiece", director: "Ritesh Batra", lang: "Hindi", country: "India" },
  { pattern: /\blistener\b/i, title: "Listener", director: "Tarun Dudeja", lang: "Hindi", country: "India" },
  { pattern: /\bjuice\b/i, title: "Juice", director: "Neeraj Ghaywan", lang: "Hindi", country: "India" },
  { pattern: /\bmanoharji ki nimmi\b/i, title: "Manoharji Ki Nimmi", director: "Sachin Gupta", lang: "Hindi", country: "India" },
  { pattern: /\beverything is fine\b/i, title: "Everything Is Fine", director: "Mansore", lang: "Hindi", country: "India" },
  { pattern: /\bkriti\b/i, title: "Kriti", director: "Shirish Kunder", lang: "Hindi", country: "India" },
  { pattern: /\brogan josh\b/i, title: "Rogan Josh", director: "Sanjeev Vig", lang: "Hindi", country: "India" },
  { pattern: /\bpsycho\b/i, title: "Psycho", director: "Sudhir Sharma", lang: "Hindi", country: "India" },
  { pattern: /\bonboard\b/i, title: "Onboard", director: "Aparna Malladi", lang: "Hindi", country: "India" },
  { pattern: /\bahalya\b/i, title: "Ahalya", director: "Sujoy Ghosh", lang: "Bengali", country: "India" },
  { pattern: /\bchutney\b/i, title: "Chutney", director: "Jyoti Kapur Das", lang: "Hindi", country: "India" },
  { pattern: /\banukul\b/i, title: "Anukul", director: "Sujoy Ghosh", lang: "Hindi", country: "India" },
  { pattern: /\bthe school bag\b/i, title: "The School Bag", director: "Dheeraj Jindal", lang: "Hindi", country: "India" },
  { pattern: /\bouch\b/i, title: "Ouch", director: "Neeraj Pandey", lang: "Hindi", country: "India" },
  { pattern: /\btaandav\b/i, title: "Taandav", director: "Devashish Makhija", lang: "Hindi", country: "India" },
  { pattern: /\brubaru\b/i, title: "Rubaru", director: "Tisca Chopra", lang: "Hindi", country: "India" },
  { pattern: /\bthe bypass\b/i, title: "The Bypass", director: "Amit Kumar", lang: "Silent", country: "India" },
  { pattern: /\bshunyata\b/i, title: "Shunyata", director: "Chintan Sarda", lang: "Hindi", country: "India" },
  { pattern: /\bkahanibaaz\b/i, title: "Kahanibaaz", director: "Sandeep Verma", lang: "Hindi", country: "India" },
  { pattern: /\bbarat\b/i, title: "Barat", director: "Anoop Joshi", lang: "Hindi", country: "India" },
  { pattern: /\bpaneer ki sabzi\b/i, title: "Paneer Ki Sabzi", director: "Anupam Sharma", lang: "Hindi", country: "India" },
  { pattern: /\bhair love\b/i, title: "Hair Love", director: "Matthew A. Cherry", lang: "English", country: "USA" }
];

const cleanedFilms = rawFilms.map(film => {
  const t = typeof film.title === 'object' ? (film.title.en || film.title.hi || '') : (film.title || '');
  const d = typeof film.description === 'object' ? (film.description.en || film.description.hi || '') : (film.description || '');
  const full = `${t} ${d}`;

  for (const m of directorMapping) {
    if (m.pattern.test(full)) {
      return {
        ...film,
        title: { en: m.title, hi: m.title },
        director: m.director,
        language: m.lang,
        country: m.country
      };
    }
  }

  let cleanDir = film.director;
  if (!cleanDir || cleanDir.includes('Acclaimed') || cleanDir.includes('of Rockstar') || cleanDir === 'Filmmaker') {
    const match = full.match(/(?:directed by|written & directed by|written and directed by|director)\s*[:\-]?\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)/i);
    cleanDir = match ? match[1].replace(/\s+(?:starring|featuring|and|presents).*$/i, '').trim() : "Independent Creator";
  }

  let cleanTitle = t.replace(/\|.*$/g, '').replace(/[-–—:|]+/g, ' ').replace(/\s+/g, ' ').trim();

  return {
    ...film,
    title: { en: cleanTitle, hi: cleanTitle },
    director: cleanDir
  };
});

fs.writeFileSync(filmsPath, JSON.stringify(cleanedFilms, null, 2), 'utf8');
console.log('✅ Update Complete!');
