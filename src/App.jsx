
const getSafeString = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return (val.en || val.hi || Object.values(val)[0] || "");
  return String(val);
};

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import TimePicker from './components/TimePicker';
import MovieCard from './components/MovieCard';
import PlayerModal from './components/PlayerModal';
import ClubModal from './components/ClubModal';
import LegalPage from './components/LegalPage';
import ArchiveView from './components/ArchiveView';
import ProfileModal from './components/ProfileModal';
import filmsData from './data/films.json';
import { getDailyHeroFilms, getIndiaDateKey } from './utils/dailyHeroFilms';

const safeText = (val, lang = 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val[lang] || val.en || Object.values(val)[0] || '';
  return String(val);
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLangFilter, setSelectedLangFilter] = useState('All');
  const [isClubView, setIsClubView] = useState(false);
  const [isArchiveView, setIsArchiveView] = useState(false);
  const [legalView, setLegalView] = useState(null);
  const [activeFilm, setActiveFilm] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroDayKey, setHeroDayKey] = useState(() => getIndiaDateKey());
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [watchHistory, setWatchHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shorts_watch_history') || '[]');
      setWatchHistory(saved);
    } catch (e) {
      setWatchHistory([]);
    }
  }, []);

  const handlePlayFilm = (film) => {
    setActiveFilm(film);
    try {
      const saved = JSON.parse(localStorage.getItem('shorts_watch_history') || '[]');
      const filtered = saved.filter(f => (f.id || f.youtubeVideoId) !== (film.id || film.youtubeVideoId));
      const updated = [film, ...filtered].slice(0, 30);
      localStorage.setItem('shorts_watch_history', JSON.stringify(updated));
      setWatchHistory(updated);
    } catch (e) {}
  };

  const handleResetFilters = () => {
    setSelectedGenre('All');
    setSelectedLangFilter('All');
    setSearchTerm('');
    setIsClubView(false);
    setIsArchiveView(false);
    setLegalView(null);
  };

  const allFilms = useMemo(() => filmsData || [], []);

  // Distinct Languages & Genres
  const { genres, languages } = useMemo(() => {
    const gSet = new Set();
    const lSet = new Set();
    allFilms.forEach(f => {
      if (Array.isArray(f.genre)) f.genre.forEach(g => gSet.add(g));
      else if (typeof f.genre === 'string') gSet.add(f.genre);

      const l = safeText(f.language, 'en');
      if (l) lSet.add(l);
    });
    return { 
      genres: Array.from(gSet), 
      languages: Array.from(lSet).filter(Boolean).sort()
    };
  }, [allFilms]);

  // Surprise Random Picker
  const handleSurpriseMe = () => {
    if (allFilms.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allFilms.length);
    handlePlayFilm(allFilms[randomIndex]);
  };

  // Five fresh hero films per India calendar day; each remains on screen for 7 seconds.
  const heroFilms = useMemo(
    () => getDailyHeroFilms(allFilms, heroDayKey),
    [allFilms, heroDayKey]
  );
  useEffect(() => {
    const timer = setInterval(() => setHeroDayKey(getIndiaDateKey()), 60_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (isHeroHovered || heroFilms.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroFilms.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isHeroHovered, heroFilms]);

  // Client-Side Recommendations
  const recommendedFilms = useMemo(() => {
    if (watchHistory.length === 0) return [];
    const genreScore = {};
    const watchedIds = new Set(watchHistory.map(f => f.id || f.youtubeVideoId));

    watchHistory.slice(0, 8).forEach(film => {
      const gList = Array.isArray(film.genre) ? film.genre : [film.genre];
      gList.forEach(g => { if (g) genreScore[g] = (genreScore[g] || 0) + 1; });
    });

    return allFilms
      .filter(f => !watchedIds.has(f.id || f.youtubeVideoId))
      .map(f => {
        let score = 0;
        const gList = Array.isArray(f.genre) ? f.genre : [f.genre];
        gList.forEach(g => { if (genreScore[g]) score += genreScore[g] * 2; });
        return { film: f, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.film)
      .slice(0, 10);
  }, [watchHistory, allFilms]);

  // Dedicated Rows
  const categorizedSections = useMemo(() => {
    const list = [
      {
        title: lang === 'hi' ? 'पुरस्कृत और बहुप्रशंसित (Award Winners & Festival Favourites)' : 'Award Winners & Festival Favourites',
        films: allFilms.filter(f => {
          const gList = (Array.isArray(f.genre) ? f.genre : [f.genre]).map(String);
          return gList.some(g => g.toLowerCase().includes('award'));
        })
      },
      {
        title: lang === 'hi' ? '🌍 वर्ल्ड सिनेमा (World Cinema Showcase)' : 'World Cinema, In Short',
        films: allFilms.filter(f => {
          const l = safeText(f.language, 'en').toLowerCase();
          const gList = (Array.isArray(f.genre) ? f.genre : [f.genre]).map(String);
          const isWorldGenre = gList.some(g => g.toLowerCase().includes('world'));
          const isInternationalLang = ['french', 'iranian', 'spanish', 'german', 'korean', 'japanese'].includes(l);
          const isSilentClassic = l === 'silent' && isWorldGenre;
          return isInternationalLang || isSilentClassic || (isWorldGenre && l !== 'malayalam' && l !== 'tamil' && l !== 'telugu' && l !== 'kannada' && l !== 'hindi' && l !== 'bhojpuri' && l !== 'maithili' && l !== 'marathi' && l !== 'bengali');
        })
      },
      {
        title: lang === 'hi' ? '🌴 मलयालम सिनेमा हब (Roots of Kerala)' : 'Roots of Kerala (Malayalam Short Films)',
        films: allFilms.filter(f => safeText(f.language, 'en').toLowerCase() === 'malayalam')
      },
      {
        title: lang === 'hi' ? '🌾 माटी की कहानियाँ: मैथिली सिनेमा' : 'Roots of Mithila (Maithili Short Films)',
        films: allFilms.filter(f => safeText(f.language, 'en').toLowerCase() === 'maithili')
      },
      {
        title: lang === 'hi' ? '🚩 मराठी शॉर्ट सिनेमा (Marathi Cinema Showcase)' : 'Marathi Cinema Showcase (Marathi Shorts)',
        films: allFilms.filter(f => safeText(f.language, 'en').toLowerCase() === 'marathi')
      },
      {
        title: lang === 'hi' ? '🌿 भोजपुरी माटी (Bhojpuri Cinema Showcase)' : 'Bhojpuri Soil & Cinema (Bhojpuri Shorts)',
        films: allFilms.filter(f => safeText(f.language, 'en').toLowerCase() === 'bhojpuri')
      },
      {
        title: lang === 'hi' ? '🎭 बांग्ला शॉर्ट सिनेमा (Bengali Masterpieces)' : 'Bangla Cinema Showcase (Bengali Shorts)',
        films: allFilms.filter(f => safeText(f.language, 'en').toLowerCase() === 'bengali')
      },
      {
        title: lang === 'hi' ? 'AI सिनेमा और न्यू-एज विज़ुअल्स' : 'AI Magic & Generative Cinema',
        films: allFilms.filter(f => {
          const gList = (Array.isArray(f.genre) ? f.genre : [f.genre]).map(String);
          return gList.some(g => g.toLowerCase().includes('ai'));
        })
      },
      {
        title: lang === 'hi' ? 'ह्यूमन ड्रामा और संवेदनाएँ' : 'Human Drama & Emotions',
        films: allFilms.filter(f => {
          const gList = (Array.isArray(f.genre) ? f.genre : [f.genre]).map(String);
          return gList.some(g => g.toLowerCase() === 'drama');
        })
      },
      {
        title: lang === 'hi' ? 'थ्रिलर और सस्पेंस' : 'Thrillers & Suspense',
        films: allFilms.filter(f => {
          const gList = (Array.isArray(f.genre) ? f.genre : [f.genre]).map(String);
          return gList.some(g => g.toLowerCase().includes('thriller') || g.toLowerCase().includes('suspense'));
        })
      }
    ];

    return list.filter(sec => sec.films.length > 0);
  }, [allFilms, lang]);

  // Combined Search & Filter View
  const filteredFilms = useMemo(() => {
    return allFilms.filter(film => {
      const matchesSearch = searchTerm === '' || 
        (film.title && getSafeString(film.title).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (film.director && getSafeString(film.director).toLowerCase().includes(searchTerm.toLowerCase()));
      
      const gList = Array.isArray(film.genre) ? film.genre : [film.genre];
      const matchesGenre = selectedGenre === 'All' || gList.some(g => typeof g === 'string' && g.toLowerCase() === selectedGenre.toLowerCase());
      
      const filmLang = safeText(film.language, 'en');
      const matchesLang = selectedLangFilter === 'All' || (filmLang && filmLang.toLowerCase() === selectedLangFilter.toLowerCase());

      return matchesSearch && matchesGenre && matchesLang;
    });
  }, [allFilms, searchTerm, selectedGenre, selectedLangFilter]);

  const isFiltered = selectedGenre !== 'All' || selectedLangFilter !== 'All' || searchTerm !== '';

  return (
    <div className="sis-v2 min-h-screen bg-[#221f1a] text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Navbar
        isClubView={isClubView}
        onOpenClub={() => { setIsClubView(true); setIsArchiveView(false); setLegalView(null); }}
        isArchiveView={isArchiveView}
        onOpenArchive={() => { setIsArchiveView(true); setIsClubView(false); setLegalView(null); }}
        onSurpriseMe={handleSurpriseMe}
        lang={lang}
        setLang={setLang}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        genres={genres}
        selectedLangFilter={selectedLangFilter}
        setSelectedLangFilter={setSelectedLangFilter}
        languages={languages}
        onResetFilters={handleResetFilters}
        films={allFilms}
        onSelectFilm={handlePlayFilm}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="flex-1 pt-16">
        {legalView ? (
          <LegalPage page={legalView} lang={lang} onBack={() => setLegalView(null)} />
        ) : isClubView ? (
          <ClubModal onClose={() => setIsClubView(false)} lang={lang} />
        ) : isArchiveView ? (
          <ArchiveView onSelectFilm={handlePlayFilm} lang={lang} onBack={handleResetFilters} />
        ) : isFiltered ? (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {lang === 'hi' ? 'फ़िल्में' : 'Catalog'} ({filteredFilms.length})
              </h2>
              <button onClick={handleResetFilters} className="text-xs text-red-500 hover:underline">
                {lang === 'hi' ? 'फ़िल्टर साफ़ करें' : 'Clear Filters'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredFilms.map(film => (
                <MovieCard key={film.id || film.youtubeVideoId} film={film} onSelect={handlePlayFilm} lang={lang} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <Hero
              film={heroFilms[heroIndex]}
              onPlay={handlePlayFilm}
              lang={lang}
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
            />

            <div className="space-y-4 -mt-10 relative z-10 pb-16">
              {recommendedFilms.length > 0 && (
                <MovieRow
                  title={lang === 'hi' ? '✨ आपके लिए अनुशंसित' : '✨ Recommended For You'}
                  films={recommendedFilms}
                  onSelectFilm={handlePlayFilm}
                  lang={lang}
                />
              )}
              <TimePicker
                films={allFilms}
                onSelectFilm={handlePlayFilm}
                lang={lang}
              />


              {categorizedSections.map((section) => (
                <MovieRow
                  key={section.title}
                  title={section.title}
                  films={section.films}
                  onSelectFilm={handlePlayFilm}
                  lang={lang}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {activeFilm && (
        <PlayerModal
          film={activeFilm}
          onClose={() => setActiveFilm(null)}
          lang={lang}
        />
      )}

      {profileOpen && <ProfileModal lang={lang} onClose={() => setProfileOpen(false)} />}

      <footer className="border-t border-zinc-800/60 px-4 py-8 text-center text-xs text-zinc-500">
        <p>© 2026 SHORTSinSHORT. An Equal Tales Entertainment Pvt Ltd initiative.</p>
        <nav className="mx-auto mt-4 flex max-w-4xl flex-wrap justify-center gap-x-5 gap-y-3" aria-label="Legal and support">
          <button type="button" onClick={() => { setLegalView('contact'); setIsClubView(false); setIsArchiveView(false); window.scrollTo(0, 0); }} className="border-0 bg-transparent hover:text-white">{lang === 'hi' ? 'हमारे बारे में और संपर्क' : 'About & Contact'}</button>
          <button type="button" onClick={() => { setLegalView('content'); setIsClubView(false); setIsArchiveView(false); window.scrollTo(0, 0); }} className="border-0 bg-transparent hover:text-white">{lang === 'hi' ? 'कंटेंट और कॉपीराइट' : 'Content & Copyright'}</button>
          <button type="button" onClick={() => { setLegalView('membership'); setIsClubView(false); setIsArchiveView(false); window.scrollTo(0, 0); }} className="border-0 bg-transparent hover:text-white">{lang === 'hi' ? 'सदस्यता की शर्तें' : 'Membership Terms'}</button>
          <button type="button" onClick={() => { setLegalView('refunds'); setIsClubView(false); setIsArchiveView(false); window.scrollTo(0, 0); }} className="border-0 bg-transparent hover:text-white">{lang === 'hi' ? 'Cancellation और Refund' : 'Cancellation & Refund'}</button>
          <button type="button" onClick={() => { setLegalView('privacy'); setIsClubView(false); setIsArchiveView(false); window.scrollTo(0, 0); }} className="border-0 bg-transparent hover:text-white">Privacy</button>
        </nav>
      </footer>
    </div>
  );
}
