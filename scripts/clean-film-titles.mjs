import fs from 'fs';
import path from 'path';

const filmsPath = path.resolve('src/data/films.json');
const rawFilms = JSON.parse(fs.readFileSync(filmsPath, 'utf8'));

function getTrueTitle(film) {
  let raw = film.title?.en || film.title?.hi || film.title || '';
  let desc = film.description?.en || film.description?.hi || film.description || '';
  const fullText = `${raw} ${desc}`;

  // विशेष ज्ञात फ़िल्में
  if (/chimes/i.test(fullText)) return "Chimes";
  if (/the promise/i.test(fullText)) return "The Promise";
  if (/gratitude list/i.test(fullText)) return "The Gratitude List";
  if (/paneer ki sabzi/i.test(fullText)) return "Paneer Ki Sabzi";
  if (/masterpiece/i.test(fullText)) return "Masterpiece";
  if (/listener/i.test(fullText)) return "Listener";
  if (/barat/i.test(fullText)) return "Barat";
  if (/kahanibaaz/i.test(fullText)) return "Kahanibaaz";
  if (/chaara/i.test(fullText)) return "Chaara";
  if (/the dinner/i.test(fullText)) return "The Dinner";
  if (/psycho/i.test(fullText)) return "Psycho";
  if (/onboard/i.test(fullText)) return "Onboard";
  if (/rubaru/i.test(fullText)) return "Rubaru";
  if (/ek badalav/i.test(fullText)) return "Ek Badalav";

  // कोट्स में नाम खोजना
  const quoteMatch = desc.match(/['"‘“]([A-Za-z0-9\s]{2,30})['"’”]/);
  if (quoteMatch && !/short film|full movie|youtube|large short/i.test(quoteMatch[1])) {
    return quoteMatch[1].trim();
  }

  // टाइटल्स को सेपरेटर्स से विभाजित करना
  const parts = raw.split(/[-–—:|]/);
  for (const part of parts) {
    let p = part.replace(/^.*?['’]s\s+/i, '');
    p = p.replace(/\b(a\s+must\s+watch|must\s+watch|award\s*winning(\s*hindi|\s*english|\s*short\s*film|\s*film)?|acclaimed(\s*short\s*film)?|short\s*film|shortfilm|full\s*movie|full\s*film|official\s*video|official\s*trailer|hd|4k|\d+(\.\d+)?\s*(m|k|lac|lakh|million)\s*views?)\b/gi, '');
    p = p.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (p.length >= 3 && !/^(hindi|english|drama|thriller|short|award|winning|movie|cinema short)$/i.test(p)) {
      return p;
    }
  }

  return raw.replace(/\|.*$/g, '').slice(0, 25).trim();
}

function getTrueDirector(film) {
  let dir = film.director || '';
  const desc = film.description?.en || film.description?.hi || '';
  const fullText = `${film.title?.en || ''} ${desc}`;

  if (/chimes/i.test(fullText)) return 'Aadish Keluskar';
  if (/the promise/i.test(fullText)) return 'Tigmanshu Dhulia';
  if (/gratitude list/i.test(fullText)) return 'Chandan Anand';
  if (/paneer ki sabzi/i.test(fullText)) return 'Anupam Sharma';
  if (/rubaru/i.test(fullText)) return 'Tisca Chopra';
  if (/kahanibaaz/i.test(fullText)) return 'Sandeep Verma';
  if (/the dinner/i.test(fullText)) return 'Siddharth Anand Kumar';
  if (/barat/i.test(fullText)) return 'Anoop Joshi';

  if (!dir || dir.includes('Acclaimed') || dir === 'Filmmaker') {
    const match = fullText.match(/(?:directed by|written & directed by|written and directed by|director)\s*[:\-]?\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)/i);
    if (match) {
      return match[1].replace(/\s+(?:starring|featuring|and|presents).*$/i, '').trim();
    }
    const matchPoss = fullText.match(/([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)'s\s+/);
    if (matchPoss) return matchPoss[1].trim();
    return 'Acclaimed Director';
  }
  return dir;
}

const cleaned = rawFilms.map(f => {
  const t = getTrueTitle(f);
  const d = getTrueDirector(f);
  return {
    ...f,
    title: { en: t, hi: t },
    director: d
  };
});

fs.writeFileSync(filmsPath, JSON.stringify(cleaned, null, 2), 'utf8');
console.log(`✅ ${cleaned.length} फ़िल्मों के टाइटल्स (CHIMES सहित) और डायरेक्टर्स साफ़ हो गए!`);
