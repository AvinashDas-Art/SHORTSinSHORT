// UI-level (chrome) translations for SHORTSinSHORT.
// Film-level content (title/description) lives inside films.json as { en, hi }.

export const GENRES = [
  { key: 'All', en: 'All', hi: 'सभी' },
  { key: 'Drama', en: 'Drama', hi: 'ड्रामा' },
  { key: 'Sci-Fi', en: 'Sci-Fi', hi: 'साइंस-फ़िक्शन' },
  { key: 'Thriller', en: 'Thriller', hi: 'थ्रिलर' },
  { key: 'Romance', en: 'Romance', hi: 'रोमांस' },
  { key: 'Horror', en: 'Horror', hi: 'हॉरर' },
  { key: 'Comedy', en: 'Comedy', hi: 'कॉमेडी' },
  { key: 'Animation', en: 'Animation', hi: 'एनिमेशन' },
  { key: 'Documentary', en: 'Documentary', hi: 'डॉक्यूमेंट्री' },
  { key: 'Fantasy', en: 'Fantasy', hi: 'फ़ैंटेसी' },
  { key: 'Action', en: 'Action', hi: 'एक्शन' },
  { key: 'Family', en: 'Family', hi: 'फ़ैमिली' },
  { key: 'Sports', en: 'Sports', hi: 'स्पोर्ट्स' },
  { key: 'Western', en: 'Western', hi: 'वेस्टर्न' },
  { key: 'Musical', en: 'Musical', hi: 'म्यूज़िकल' },
]

export const LANGUAGES = [
  'All',
  'Hindi',
  'English',
  'French',
  'Spanish',
  'Bengali',
  'Danish',
  'Hungarian',
  'Arabic',
  'German',
]

export const COUNTRIES = [
  'All',
  'India',
  'USA',
  'France',
  'Spain',
  'Germany',
  'UK',
  'Australia',
  'Canada',
  'Ireland',
  'Denmark',
  'Hungary',
  'Chile',
  'Morocco',
  'Guatemala',
  'International',
]

export const STRINGS = {
  en: {
    siteName: 'SHORTS',
    siteNameSuffix: 'inSHORT',
    searchPlaceholder: 'Search films...',
    genreLabel: 'Genre',
    languageLabel: 'Language',
    countryLabel: 'Country',
    resetFilters: 'Reset Filters',
    playNow: 'Play Now',
    results: 'Results',
    noFilmsFound: 'No Films Found',
    noFilmsHint: 'Try a different search term or reset your filters.',
    comingSoon: 'Coming Soon',
    videoComingSoon: 'Video Coming Soon',
    videoComingSoonHint: 'This film will be added soon, the video is not available yet.',
    featuredOriginals: 'Featured Originals',
    globalCinema: 'Global Cinema',
    dramaRomance: 'Drama & Romance',
    thrillerSciFi: 'Thriller & Sci-Fi',
  },
  hi: {
    siteName: 'SHORTS',
    siteNameSuffix: 'inSHORT',
    searchPlaceholder: 'फ़िल्में खोजें...',
    genreLabel: 'जॉनर',
    languageLabel: 'भाषा',
    countryLabel: 'देश',
    resetFilters: 'फ़िल्टर्स रीसेट करें',
    playNow: 'Play Now',
    results: 'नतीजे',
    noFilmsFound: 'कोई फ़िल्म नहीं मिली',
    noFilmsHint: 'कोई और सर्च टर्म आज़माएं या फ़िल्टर्स रीसेट करें।',
    comingSoon: 'जल्द आ रहा है',
    videoComingSoon: 'वीडियो जल्द आ रहा है',
    videoComingSoonHint: 'यह फ़िल्म जल्द ही जोड़ी जाएगी, फ़िलहाल इसका वीडियो उपलब्ध नहीं है।',
    featuredOriginals: 'फ़ीचर्ड ओरिजिनल्स',
    globalCinema: 'ग्लोबल सिनेमा',
    dramaRomance: 'ड्रामा और रोमांस',
    thrillerSciFi: 'थ्रिलर और साइंस-फ़िक्शन',
  },
}

export function genreLabel(key, lang) {
  const found = GENRES.find((g) => g.key === key)
  return found ? found[lang] : key
}
