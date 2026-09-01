import fs from 'fs';

// टॉप AI चैनल्स और फ़िल्ममेकर्स की क्यूरेटेड लाइब्रेरी
const aiCatalog = [
  {
    id: "ai-dor-apex",
    title: "Apex",
    director: "The Dor Brothers",
    category: "AI Cinema",
    genre: "Hyper-Real Sci-Fi / Action",
    year: "2026",
    duration: "3 min",
    language: "English",
    youtubeId: "V5AFQaEbHQU",
    thumbnail: "https://img.youtube.com/vi/V5AFQaEbHQU/maxresdefault.jpg",
    description: "A visually staggering, high-octane AI action masterpiece showcasing the absolute bleeding edge of generative cinematography.",
    tags: ["Dor Brothers", "Hyper-Real", "Masterpiece"]
  },
  {
    id: "ai-freepik-bone-5",
    title: "The Chronicles of Bone: King of the Seas",
    director: "Kavan the Kid (Freepik Originals)",
    category: "AI Cinema",
    genre: "Dark Fantasy / Epic",
    year: "2026",
    duration: "15 min",
    language: "English",
    youtubeId: "ScfibDSMXJA",
    thumbnail: "https://img.youtube.com/vi/ScfibDSMXJA/maxresdefault.jpg",
    description: "The critically acclaimed Freepik original series. Captain Hook faces mutiny and encounters the formidable Captain Nemo in a masterfully directed AI epic.",
    tags: ["Freepik", "Magnific AI", "Fantasy Epic"]
  },
  {
    id: "ai-lennard-bone-throne",
    title: "BONE THRONE",
    director: "Lennard Smith",
    category: "AI Cinema",
    genre: "Dark Fantasy / Drama",
    year: "2026",
    duration: "5 min",
    language: "English",
    youtubeId: "6D4_ZMnPx7I",
    thumbnail: "https://img.youtube.com/vi/6D4_ZMnPx7I/maxresdefault.jpg",
    description: "Crafted with Kling 3.0 and Seedance, a gripping cinematic story of betrayal, family, and desert warlords with stunning motion consistency.",
    tags: ["Kling 3.0", "Seedance", "Dark Fantasy"]
  },
  {
    id: "ai-dair-jackpot",
    title: "JACKPOT",
    director: "Dair",
    category: "AI Cinema",
    genre: "Sci-Fi Comedy",
    year: "2026",
    duration: "13 min",
    language: "English",
    youtubeId: "q98WM0Gta0A",
    thumbnail: "https://img.youtube.com/vi/q98WM0Gta0A/maxresdefault.jpg",
    description: "Special selection for AAIFF. A futuristic scavenger discovers the last living tree on Earth, leading to a witty and visually dazzling philosophical adventure.",
    tags: ["AAIFF", "Sci-Fi", "Comedy"]
  },
  {
    id: "ai-goblin-woodnuts",
    title: "WOODNUTS",
    director: "Gossip Goblin",
    category: "AI Cinema",
    genre: "Cosmic Horror / Sci-Fi",
    year: "2025",
    duration: "11 min",
    language: "English",
    youtubeId: "NLAZubEa6X4",
    thumbnail: "https://img.youtube.com/vi/NLAZubEa6X4/maxresdefault.jpg",
    description: "A deep-space planetary harvesting crew encounters an ancient, sentient cosmic forest. Over 9 million views of pure atmospheric tension.",
    tags: ["Cosmic Horror", "Viral"]
  }
];

// App.jsx में डेटाबेस और कैटेगरी सुनिश्चित करना
const appPath = 'src/App.jsx';
if (fs.existsSync(appPath)) {
  let code = fs.readFileSync(appPath, 'utf8');

  if (!code.includes('"AI Cinema"')) {
    code = code.replace(/categories\s*=\s*\[([^\]]*)\]/, (match, p1) => {
      return `categories = ["All", "AI Cinema", ${p1.replace(/"All",?\s*/, '')}]`;
    });
  }

  aiCatalog.forEach(film => {
    if (!code.includes(film.id)) {
      const filmStr = JSON.stringify(film, null, 2);
      code = code.replace(/const\s+movies\s*=\s*\[/, `const movies = [\n${filmStr},`);
    }
  });

  fs.writeFileSync(appPath, code, 'utf8');
  console.log("✓ Daily AI Cinema sync executed successfully.");
}
