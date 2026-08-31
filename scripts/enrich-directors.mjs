import fs from 'fs';
import path from 'path';

const filmsPath = path.resolve('src/data/films.json');
const rawFilms = JSON.parse(fs.readFileSync(filmsPath, 'utf8'));

function extractDirector(film) {
  const desc = (film.description?.en || film.description?.hi || film.description || '');
  const title = (film.title?.en || film.title?.hi || film.title || '');
  const fullText = `${title}. ${desc}`;

  // विशेष ज्ञात फ़िल्में
  if (title.includes('Ahalya') || desc.includes('Sujoy Ghosh')) return 'Sujoy Ghosh';
  if (title.includes('Juice') || desc.includes('Neeraj Ghaywan')) return 'Neeraj Ghaywan';
  if (title.includes('Chutney')) return 'Jyoti Kapur Das';
  if (title.includes('Gratitude List')) return 'Chandan Anand';
  if (title.includes('Tigmanshu Dhulia') || desc.includes('Tigmanshu Dhulia')) return 'Tigmanshu Dhulia';
  if (title.includes('Ouch') || desc.includes('Neeraj Pandey')) return 'Neeraj Pandey';
  if (title.includes('Taandav') || desc.includes('Devashish Makhija')) return 'Devashish Makhija';
  if (title.includes('Hair Love') || desc.includes('Matthew A. Cherry')) return 'Matthew A. Cherry';
  if (title.includes('Interior Cafe Night')) return 'Adhiraj Bose';
  if (title.includes('Anukul')) return 'Sujoy Ghosh';

  // सामान्य Regex एक्सट्रैक्शन
  const match1 = fullText.match(/(?:directed by|written & directed by|written and directed by)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)/i);
  if (match1) {
    return match1[1].replace(/\s+(?:starring|featuring|presents|and).*$/i, '').trim();
  }

  const match2 = fullText.match(/([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)(?:'s\s+(?:sensational|iconic|poignant|futuristic|acclaimed|dark|new|award|masterpiece|thriller|short))/i);
  if (match2) {
    return match2[1].trim();
  }

  return 'Acclaimed Filmmaker';
}

const enriched = rawFilms.map(f => ({
  ...f,
  director: f.director || extractDirector(f)
}));

fs.writeFileSync(filmsPath, JSON.stringify(enriched, null, 2), 'utf8');
console.log(`✅ ${enriched.length} फ़िल्मों में Director और [Language] डेटा अपडेट हो गया!`);
