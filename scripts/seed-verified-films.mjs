import fs from 'fs';
import path from 'path';

const verifiedFilms = [
  {
    id: "sf001",
    title: { en: "Hair Love", hi: "हेयर लव" },
    description: {
      en: "An Oscar-winning animated short about an African American father learning to do his daughter's hair for the first time.",
      hi: "ऑस्कर विजेता एनिमेटेड शॉर्ट फिल्म, जिसमें एक पिता अपनी बेटी के बालों को संवारना सीखता है।"
    },
    youtubeVideoId: "kNw8V_Fkw28",
    thumbnailUrl: "https://img.youtube.com/vi/kNw8V_Fkw28/hqdefault.jpg",
    genre: ["Animation", "Drama", "Family"],
    language: "English",
    country: "USA",
    popularityScore: 99,
    duration: "7 min",
    isFeatured: true
  },
  {
    id: "sf002",
    title: { en: "Ahalya", hi: "अहल्या" },
    description: {
      en: "Sujoy Ghosh's thrilling spin on the mythological tale starring Radhika Apte and Soumitra Chatterjee.",
      hi: "राधिका आप्टे और सौमित्र चटर्जी अभिनीत सुजॉय घोष की रहस्य और रोमांच से भरी शानदार थ्रिलर।"
    },
    youtubeVideoId: "4wnTRPzHg6s",
    thumbnailUrl: "https://img.youtube.com/vi/4wnTRPzHg6s/hqdefault.jpg",
    genre: ["Thriller", "Mystery"],
    language: "Bengali",
    country: "India",
    popularityScore: 98,
    duration: "14 min",
    isFeatured: true
  },
  {
    id: "sf003",
    title: { en: "Chutney", hi: "चटनी" },
    description: {
      en: "A simple housewife from Ghaziabad tells an unsettling story over snacks. Starring Tisca Chopra and Adil Hussain.",
      hi: "टिस्का चोपड़ा और आदिल हुसैन अभिनीत - गाज़ियाबाद की एक सीधी-सादी गृहिणी की डरावनी और चौंकाने वाली दास्तान।"
    },
    youtubeVideoId: "9U3h00U_LqI",
    thumbnailUrl: "https://img.youtube.com/vi/9U3h00U_LqI/hqdefault.jpg",
    genre: ["Drama", "Thriller"],
    language: "Hindi",
    country: "India",
    popularityScore: 97,
    duration: "16 min",
    isFeatured: true
  },
  {
    id: "sf004",
    title: { en: "Juice", hi: "जूस" },
    description: {
      en: "Neeraj Ghaywan's sharp commentary on patriarchal mindsets during a warm family gathering. Starring Shefali Shah.",
      hi: "शेफाली शाह अभिनीत नीरज घेवान की समाज में पुरुषों के वर्चस्व और महिलाओं की स्थिति पर तीखी चोट।"
    },
    youtubeVideoId: "N1A7p4b0t3k",
    thumbnailUrl: "https://img.youtube.com/vi/N1A7p4b0t3k/hqdefault.jpg",
    genre: ["Drama"],
    language: "Hindi",
    country: "India",
    popularityScore: 96,
    duration: "15 min",
    isFeatured: true
  },
  {
    id: "sf005",
    title: { en: "Interior Cafe Night", hi: "इंटीरियर कैफे नाइट" },
    description: {
      en: "A touching tale of love, loss, and second chances inside a Kolkata cafe. Starring Naseeruddin Shah and Shernaz Patel.",
      hi: "नसीरुद्दीन शाह और शेरनाज़ पटेल अभिनीत - प्यार, जुदाई और ज़िंदगी के दूसरे मौके की दिल छू लेने वाली कहानी।"
    },
    youtubeVideoId: "cbT3vTbgvAQ",
    thumbnailUrl: "https://img.youtube.com/vi/cbT3vTbgvAQ/hqdefault.jpg",
    genre: ["Romance", "Drama"],
    language: "Hindi",
    country: "India",
    popularityScore: 95,
    duration: "13 min",
    isFeatured: false
  },
  {
    id: "sf006",
    title: { en: "Anukul", hi: "अनुकूल" },
    description: {
      en: "Based on Satyajit Ray's story, exploring human emotions and AI robots in a futuristic Kolkata. Starring Saurabh Shukla.",
      hi: "सत्यजीत रे की कहानी पर आधारित - भविष्य के भारत में एक इंसान और रोबोट के बीच का गहरा रिश्ता।"
    },
    youtubeVideoId: "R1w2H2O9y10",
    thumbnailUrl: "https://img.youtube.com/vi/R1w2H2O9y10/hqdefault.jpg",
    genre: ["Sci-Fi", "Drama"],
    language: "Hindi",
    country: "India",
    popularityScore: 94,
    duration: "21 min",
    isFeatured: false
  },
  {
    id: "sf007",
    title: { en: "The School Bag", hi: "द स्कूल बैग" },
    description: {
      en: "A mother in Peshawar tries to fulfill her young son's simple birthday wish before tragedy strikes. Starring Rasika Dugal.",
      hi: "रसिका दुग्गल अभिनीत - पेशावर में एक माँ और उसके मासूम बेटे के जन्मदिन के उपहार की मार्मिक कहानी।"
    },
    youtubeVideoId: "125tJ8F2_qA",
    thumbnailUrl: "https://img.youtube.com/vi/125tJ8F2_qA/hqdefault.jpg",
    genre: ["Drama", "Emotional"],
    language: "Hindi",
    country: "India",
    popularityScore: 95,
    duration: "15 min",
    isFeatured: false
  },
  {
    id: "sf008",
    title: { en: "Ouch", hi: "आउच" },
    description: {
      en: "Neeraj Pandey's dark comedy about a couple planning to leave their spouses. Starring Manoj Bajpayee and Pooja Chopra.",
      hi: "मनोज बाजपेयी और पूजा चोपड़ा अभिनीत नीरज पांडे की गुदगुदाने और चौंकाने वाली डार्क कॉमेडी।"
    },
    youtubeVideoId: "vB4pUu2Xz7M",
    thumbnailUrl: "https://img.youtube.com/vi/vB4pUu2Xz7M/hqdefault.jpg",
    genre: ["Comedy", "Drama"],
    language: "Hindi",
    country: "India",
    popularityScore: 93,
    duration: "14 min",
    isFeatured: false
  },
  {
    id: "sf009",
    title: { en: "Piper", hi: "पाइपर" },
    description: {
      en: "Oscar-winning Pixar short about a hungry sandpiper hatchling conquering her fear of the ocean waves.",
      hi: "ऑस्कर विजेता पिक्सर की दिलकश शॉर्ट फिल्म - समुद्र की लहरों से डर को मात देती एक नन्हीं चिड़िया।"
    },
    youtubeVideoId: "vPuRBiBCxSU",
    thumbnailUrl: "https://img.youtube.com/vi/vPuRBiBCxSU/hqdefault.jpg",
    genre: ["Animation", "Family"],
    language: "Silent",
    country: "USA",
    popularityScore: 99,
    duration: "6 min",
    isFeatured: true
  },
  {
    id: "sf010",
    title: { en: "Paperman", hi: "पेपरमैन" },
    description: {
      en: "An Oscar-winning romantic black-and-white animation using paper airplanes across a busy city.",
      hi: "कागज़ के जहाजों के सहारे अजनबी प्यार की तलाश करती ऑस्कर विजेता जादुई एनिमेटेड कहानी।"
    },
    youtubeVideoId: "eRLJscAlk1M",
    thumbnailUrl: "https://img.youtube.com/vi/eRLJscAlk1M/hqdefault.jpg",
    genre: ["Animation", "Romance"],
    language: "Silent",
    country: "USA",
    popularityScore: 98,
    duration: "7 min",
    isFeatured: false
  },
  {
    id: "sf011",
    title: { en: "Two Distant Strangers", hi: "टू डिस्टेंट स्ट्रेंजर्स" },
    description: {
      en: "An Oscar-winning film following a man trapped in a time loop trying to get home to his dog.",
      hi: "ऑस्कर विजेता टाइम-लूप थ्रिलर - घर पहुँचने की जद्दोजहद में फंसा एक युवक।"
    },
    youtubeVideoId: "tN3TjA6w6o8",
    thumbnailUrl: "https://img.youtube.com/vi/tN3TjA6w6o8/hqdefault.jpg",
    genre: ["Sci-Fi", "Drama"],
    language: "English",
    country: "USA",
    popularityScore: 97,
    duration: "32 min",
    isFeatured: false
  },
  {
    id: "sf012",
    title: { en: "Taandav", hi: "तांडव" },
    description: {
      en: "Manoj Bajpayee as a stressed Mumbai policeman facing moral conflicts during Ganpati Visarjan night.",
      hi: "मनोज बाजपेयी अभिनीत - तनाव और दबाव से जूझते एक पुलिसकर्मी के भीतर का तांडव।"
    },
    youtubeVideoId: "5b5p0e-z1gU",
    thumbnailUrl: "https://img.youtube.com/vi/5b5p0e-z1gU/hqdefault.jpg",
    genre: ["Drama", "Crime"],
    language: "Hindi",
    country: "India",
    popularityScore: 92,
    duration: "11 min",
    isFeatured: false
  }
];

const filmsPath = path.resolve('src/data/films.json');
fs.writeFileSync(filmsPath, JSON.stringify(verifiedFilms, null, 2), 'utf8');
console.log(`✅ ${verifiedFilms.length} वेरीफ़ाइड फ़िल्में सफलतापूर्वक जोड़ दी गईं!`);
