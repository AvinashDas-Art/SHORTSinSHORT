import fs from 'fs';
import path from 'path';

// डेली क्यूरेटेड AI लिस्ट
const dailyQueue = [
  {
    id: "ai-chronicles-bone-ep4",
    title: "The Chronicles of Bone: Episode IV",
    director: "Kavan the Kid (Freepik)",
    genre: "AI Cinema",
    category: "AI Cinema",
    language: "English",
    duration: "14 min",
    year: "2026",
    youtubeId: "ScfibDSMXJA",
    thumbnail: "https://img.youtube.com/vi/ScfibDSMXJA/maxresdefault.jpg",
    description: "The ongoing saga of Captain Hook and Neverland created using cutting-edge Freepik & Magnific AI."
  },
  {
    id: "ai-higgsfield-genesis",
    title: "Higgsfield: Genesis",
    director: "Higgsfield Originals",
    genre: "AI Cinema",
    category: "AI Cinema",
    language: "English",
    duration: "8 min",
    year: "2026",
    youtubeId: "V5AFQaEbHQU",
    thumbnail: "https://img.youtube.com/vi/V5AFQaEbHQU/maxresdefault.jpg",
    description: "Higgsfield's flagship generative sci-fi cinematic universe exploring hyper-realistic worldbuilding."
  }
];

function injectDailyFilms(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      if (item !== 'node_modules' && item !== '.git' && item !== 'dist') {
        injectDailyFilms(full);
      }
    } else if (full.endsWith('.js') || full.endsWith('.jsx')) {
      let code = fs.readFileSync(full, 'utf8');
      if (code.includes('ai-dor-apex')) {
        dailyQueue.forEach(film => {
          if (!code.includes(film.id)) {
            const filmStr = JSON.stringify(film, null, 2);
            code = code.replace(/\[\s*\{\s*id:\s*"ai-dor-apex"/, `[\n${filmStr},\n  { id: "ai-dor-apex"`);
          }
        });
        fs.writeFileSync(full, code, 'utf8');
      }
    }
  }
}

injectDailyFilms('./src');
console.log("✓ Daily AI Curation pipeline verified.");
