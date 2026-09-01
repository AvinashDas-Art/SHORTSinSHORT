import ClubPage from './components/ClubPage';
import React, { useState, useMemo } from 'react';
import filmsData from './data/films.json';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import MovieCard from './components/MovieCard';
import VideoModal from './components/VideoModal';

export default function App() {
  const [isClubView, setIsClubView] = React.useState(false);
  const [lang, setLang] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [playingFilm, setPlayingFilm] = useState(null);

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedCountry('All');
    setPlayingFilm(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const genres = useMemo(() => {
    const set = new Set();
    filmsData.forEach(f => {
      if (Array.isArray(f.genre)) {
        f.genre.forEach(g => set.add(g));
      } else if (f.genre) {
        set.add(f.genre);
      }
    });
    return Array.from(set);
  }, []);

  const languages = useMemo(() => {
    const set = new Set();
    filmsData.forEach(f => f.language && set.add(f.language));
    return Array.from(set);
  }, []);

  const countries = useMemo(() => {
    const set = new Set();
    filmsData.forEach(f => f.country && set.add(f.country));
    return Array.from(set);
  }, []);

  const featuredFilm = useMemo(() => {
    return filmsData.find(f => f.featured) || filmsData[0];
  }, []);

  const isFiltering = searchTerm !== '' || selectedGenre !== 'All' || selectedLanguage !== 'All' || selectedCountry !== 'All';

  const filteredFilms = useMemo(() => {
    return filmsData.filter(film => {
      const matchesSearch = searchTerm === '' || 
        film.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        film.director?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        film.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGenre = selectedGenre === 'All' || 
        (Array.isArray(film.genre) ? film.genre.includes(selectedGenre) : film.genre === selectedGenre);

      const matchesLanguage = selectedLanguage === 'All' || film.language === selectedLanguage;
      const matchesCountry = selectedCountry === 'All' || film.country === selectedCountry;

      return matchesSearch && matchesGenre && matchesLanguage && matchesCountry;
    });
  }, [searchTerm, selectedGenre, selectedLanguage, selectedCountry]);

  const categorizedRows = useMemo(() => {
    const seenIds = new Set();
    if (featuredFilm) seenIds.add(featuredFilm.id || featuredFilm.youtubeVideoId);

    const isAi = (f) => f.id?.startsWith('ai-') || (Array.isArray(f.genre) ? f.genre.includes('AI Magic') : f.genre === 'AI Magic');

    const pickUnique = (predicate, limit = 16) => {
      const row = [];
      for (const f of filteredFilms) {
        const id = f.id || f.youtubeVideoId;
        if (!seenIds.has(id) && predicate(f)) {
          row.push(f);
          seenIds.add(id);
          if (row.length === limit) break;
        }
      }
      return row;
    };

    const awardWinning = pickUnique(f => !isAi(f) && ((Array.isArray(f.genre) ? f.genre.includes('Award Winning') : f.genre === 'Award Winning') || (f.popularityScore && f.popularityScore >= 90)), 16);
    const thriller = pickUnique(f => !isAi(f) && (Array.isArray(f.genre) ? (f.genre.includes('Thriller') || f.genre.includes('Mystery') || f.genre.includes('Suspense') || f.genre.includes('Crime')) : false), 16);
    const drama = pickUnique(f => !isAi(f) && (Array.isArray(f.genre) ? (f.genre.includes('Drama') || f.genre.includes('Family')) : false), 16);
    const globalShorts = pickUnique(f => !isAi(f) && (f.country !== 'India' || f.language !== 'Hindi'), 16);
    const moreFilms = pickUnique(f => !isAi(f), 16);
    const aiMagic = filteredFilms.filter(f => isAi(f));

    return { awardWinning, thriller, drama, globalShorts, moreFilms, aiMagic };
  }, [filteredFilms, featuredFilm]);

  if (isClubView) {
    return (
      <div className="min-h-screen bg-[#0d0d0f]">
        <Navbar isClubView={isClubView} onOpenClub={() => setIsClubView(false)} lang={lang} setLang={setLang} onResetFilters={() => setIsClubView(false)} />
        <ClubPage onBack={() => setIsClubView(false)} lang={lang} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-zinc-100 font-sans antialiased selection:bg-red-600 selection:text-white">
      <Navbar 
        isClubView={isClubView}
        onOpenClub={() => setIsClubView(true)}
        lang={lang}
        setLang={setLang}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        genres={genres}
        languages={languages}
        countries={countries}
        onResetFilters={resetAllFilters}
      />

      <main className="pt-16 pb-20">
        {!isFiltering && featuredFilm && (
          <Hero 
            film={featuredFilm} 
            onPlay={(f) => setPlayingFilm(f)} 
            lang={lang} 
          />
        )}

        {isFiltering ? (
          <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
            <h2 className="text-xl font-bold mb-6 text-zinc-200">
              {lang === 'hi' ? `परिणाम (${filteredFilms.length})` : `Results (${filteredFilms.length})`}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
              {filteredFilms.map(film => (
                <MovieCard
                  key={film.id || film.youtubeVideoId}
                  film={film}
                  onSelect={(f) => setPlayingFilm(f)}
                  lang={lang}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8 mt-2">
            {categorizedRows.awardWinning.length > 0 && (
              <MovieRow 
                title={lang === 'hi' ? "अवार्ड-विनिंग और लोकप्रिय शॉर्ट फ़िल्में" : "Award Winning & Popular"} 
                films={categorizedRows.awardWinning} 
                onSelectFilm={(f) => setPlayingFilm(f)} 
                lang={lang} 
              />
            )}
            {categorizedRows.thriller.length > 0 && (
              <MovieRow 
                title={lang === 'hi' ? "थ्रिलर और सस्पेंस" : "Thriller & Suspense"} 
                films={categorizedRows.thriller} 
                onSelectFilm={(f) => setPlayingFilm(f)} 
                lang={lang} 
              />
            )}
            {categorizedRows.drama.length > 0 && (
              <MovieRow 
                title={lang === 'hi' ? "ड्रामा और भावनाएँ" : "Drama & Human Stories"} 
                films={categorizedRows.drama} 
                onSelectFilm={(f) => setPlayingFilm(f)} 
                lang={lang} 
              />
            )}
            {categorizedRows.globalShorts.length > 0 && (
              <MovieRow 
                title={lang === 'hi' ? "ग्लोबल और ऑस्कर शॉर्ट्स" : "Global & International Cinema"} 
                films={categorizedRows.globalShorts} 
                onSelectFilm={(f) => setPlayingFilm(f)} 
                lang={lang} 
              />
            )}
            {categorizedRows.moreFilms.length > 0 && (
              <MovieRow 
                title={lang === 'hi' ? "अन्य चुनिंदा फ़िल्में" : "Explore More Shorts"} 
                films={categorizedRows.moreFilms} 
                onSelectFilm={(f) => setPlayingFilm(f)} 
                lang={lang} 
              />
            )}
            {categorizedRows.aiMagic.length > 0 && (
              <MovieRow 
                title={lang === 'hi' ? "एआई मैजिक" : "AI Magic"} 
                films={categorizedRows.aiMagic} 
                onSelectFilm={(f) => setPlayingFilm(f)} 
                lang={lang} 
              />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-500">
        <p>© 2026 SHORTSinSHORT - Curated World Cinema in Short Formats.</p>
      </footer>

      {playingFilm && (
        <VideoModal 
          film={playingFilm} 
          onClose={() => setPlayingFilm(null)} 
          lang={lang} 
        />
      )}
    </div>
  );
}
