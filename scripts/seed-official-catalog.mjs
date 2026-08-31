import fs from 'fs';
import path from 'path';

const officialCatalog = [
  {
    id: "sf_ahalya",
    title: { en: "Ahalya", hi: "अहल्या" },
    description: {
      en: "Sujoy Ghosh's iconic thriller starring Radhika Apte and Soumitra Chatterjee.",
      hi: "राधिका आप्टे और सौमित्र चटर्जी अभिनीत सुजॉय घोष की बहुचर्चित रहस्यमयी थ्रिलर।"
    },
    youtubeVideoId: "Ff82XtV78xo",
    thumbnailUrl: "https://i.ytimg.com/vi/Ff82XtV78xo/hqdefault.jpg",
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
      en: "Award-winning short film starring Tisca Chopra, Adil Hussain and Rasika Dugal.",
      hi: "टिस्का चोपड़ा और आदिल हुसैन अभिनीत 130 मिलियन से ज़्यादा व्यूज़ वाली ऑल-टाइम हिट थ्रिलर।"
    },
    youtubeVideoId: "9U3h00U_LqI",
    thumbnailUrl: "https://i.ytimg.com/vi/9U3h00U_LqI/hqdefault.jpg",
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
    youtubeVideoId: "N1A7p4b0t3k",
    thumbnailUrl: "https://i.ytimg.com/vi/N1A7p4b0t3k/hqdefault.jpg",
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
    youtubeVideoId: "cbT3vTbgvAQ",
    thumbnailUrl: "https://i.ytimg.com/vi/cbT3vTbgvAQ/hqdefault.jpg",
    genre: ["Romance", "Drama"],
    language: "Hindi",
    country: "India",
    popularityScore: 96,
    duration: "13 min",
    isFeatured: false
  },
  {
    id: "sf_anukul",
    title: { en: "Anukul", hi: "अनुकूल" },
    description: {
      en: "Satyajit Ray's sci-fi story adapted by Sujoy Ghosh starring Saurabh Shukla.",
      hi: "सत्यजीत रे की कहानी पर आधारित सुजॉय घोष और सौरभ शुक्ला की बेहतरीन साइंस-फ़िक्शन।"
    },
    youtubeVideoId: "R1w2H2O9y10",
    thumbnailUrl: "https://i.ytimg.com/vi/R1w2H2O9y10/hqdefault.jpg",
    genre: ["Sci-Fi", "Drama"],
    language: "Hindi",
    country: "India",
    popularityScore: 95,
    duration: "21 min",
    isFeatured: false
  },
  {
    id: "sf_school_bag",
    title: { en: "The School Bag", hi: "द स्कूल बैग" },
    description: {
      en: "Acclaimed emotional drama starring Rasika Dugal based in Peshawar.",
      hi: "रसिका दुग्गल अभिनीत पेशावर की पृष्ठभूमि पर बनी दिल छू लेने वाली कहानी।"
    },
    youtubeVideoId: "125tJ8F2_qA",
    thumbnailUrl: "https://i.ytimg.com/vi/125tJ8F2_qA/hqdefault.jpg",
    genre: ["Drama", "Emotional"],
    language: "Hindi",
    country: "India",
    popularityScore: 96,
    duration: "15 min",
    isFeatured: false
  },
  {
    id: "sf_ouch",
    title: { en: "Ouch", hi: "आउच" },
    description: {
      en: "Neeraj Pandey's dark comedy starring Manoj Bajpayee and Pooja Chopra.",
      hi: "मनोज बाजपेयी अभिनीत नीरज पांडे की चर्चित और मज़ेदार डार्क कॉमेडी।"
    },
    youtubeVideoId: "vB4pUu2Xz7M",
    thumbnailUrl: "https://i.ytimg.com/vi/vB4pUu2Xz7M/hqdefault.jpg",
    genre: ["Comedy", "Drama"],
    language: "Hindi",
    country: "India",
    popularityScore: 95,
    duration: "14 min",
    isFeatured: false
  },
  {
    id: "sf_taandav",
    title: { en: "Taandav", hi: "तांडव" },
    description: {
      en: "Manoj Bajpayee as a stressed policeman in Mumbai by Devashish Makhija.",
      hi: "देवाशीष मखीजा निर्देशित मनोज बाजपेयी का अविस्मरणीय अभिनय।"
    },
    youtubeVideoId: "5b5p0e-z1gU",
    thumbnailUrl: "https://i.ytimg.com/vi/5b5p0e-z1gU/hqdefault.jpg",
    genre: ["Drama", "Crime"],
    language: "Hindi",
    country: "India",
    popularityScore: 94,
    duration: "11 min",
    isFeatured: false
  },
  {
    id: "sf_hair_love",
    title: { en: "Hair Love", hi: "हेयर लव" },
    description: {
      en: "Oscar-winning animated masterpiece by Matthew A. Cherry.",
      hi: "ऑस्कर विजेता खूबसूरत एनिमेटेड फ़िल्म।"
    },
    youtubeVideoId: "kNw8V_Fkw28",
    thumbnailUrl: "https://i.ytimg.com/vi/kNw8V_Fkw28/hqdefault.jpg",
    genre: ["Animation", "Family"],
    language: "English",
    country: "USA",
    popularityScore: 99,
    duration: "7 min",
    isFeatured: true
  }
];

const filmsPath = path.resolve('src/data/films.json');
fs.writeFileSync(filmsPath, JSON.stringify(officialCatalog, null, 2), 'utf8');
console.log(`✅ ${officialCatalog.length} आधिकारिक फ़िल्में सफलतापूर्वक अपडेट हो गईं!`);
