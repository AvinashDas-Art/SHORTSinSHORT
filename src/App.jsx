import React, { useState, useMemo, useEffect } from 'react';
import filmsData from './data/films.json';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import MovieCard from './components/MovieCard';
import VideoModal from './components/VideoModal';
import ClubPage from './components/ClubPage';
import ArchivePage from './components/ArchivePage';

export default function App() {
  const [isClubView, setIsClubView] = useState(false);
  const [isArchiveView, setIsArchiveView] = useState(false);
  const [lang, setLang] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [playingFilm, setPlayingFilm] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const genreParam = params.get('genre');
    if (genreParam) {
      setSelectedGenre(genreParam);
    }
  }, []);

  const updateGenre = (genre) => {
    setSelectedGenre(genre);
    const url = new URL(window.location);
    if (genre === 'All') {
      url.searchParams.delete('genre');
    } else {
      url.searchParams.set('genre', genre);
    }
    window.history.pushState({}, '', url);
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    updateGenre('All');
    setPlayingFilm(null);
    setIsClubView(false);
    setIsArchiveView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const genres = useMemo(() => {
    const set = new Set();
    filmsData.forEach(f => {
      if (Array.isArray(f.genre)) f.genre.forEach(g => set.add(g));
      else if (f.genre) set.add(f.genre);
    });
    return Array.from(set);
  }, []);

  const heroPool = useMemo(() => {
    const pool = [];
    const isAi = (f) => f.id?.startsWith('ai-') || (Array.isArray(f.genre) ? f.genre.includes('AI Magic') : f.genre === 'AI Magic');

    const award = filmsData.find(f => !isAi(f) && (f.popularityScore >= 90 || (Array.isArray(f.genre) && f.genre.includes('Award Winning'))));
    if (award) pool.push(award);

    const thrill = filmsData.find(f => !isAi(f) && Array.isArray(f.genre) && (f.genre.includes('Thriller') || f.genre.includes('Mystery')));
    if (thrill && !pool.some(p => p.id === thrill.id)) pool.push(thrill);

    const drm = filmsData.find(f => !isAi(f) && Array.isArray(f.genre) && f.genre.includes('Drama'));
    if (drm && !pool.some(p => p.id === drm.id)) pool.push(drm);

    const globalFilm = filmsData.find(f => !isAi(f) && (f.country !== 'India' || f.language !== 'Hindi'));
    if (globalFilm && !pool.some(p => p.id === globalFilm.id)) pool.push(globalFilm);

    const aiFilm = filmsData.find(f => isAi(f));
    if (aiFilm && !pool.some(p => p.id === aiFilm.id)) pool.push(aiFilm);

    return pool.length > 0 ? pool : filmsData.slice(0, 5);
  }, []);

  useEffect(() => {
    if (heroPool.length <= 1 || isHeroPaused) return;
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroPool.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [heroPool, isHeroPaused]);

  const featuredFilm = heroPool[heroIndex] || heroPool[0];
  const isFiltering = searchTerm !== '' || selectedGenre !== 'All';

  const filteredFilms = useMemo(() => {
    return filmsData.filter(film => {
      const matchesSearch = searchTerm === '' || 
        film.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        film.director?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGenre = selectedGenre === 'All' || 
        (Array.isArray(film.genre) ? film.genre.includes(selectedGenre) : film.genre === selectedGenre);

      return matchesSearch && matchesGenre;
    });
  }, [searchTerm, selectedGenre]);

  const categorizedRows = useMemo(() => {
    const isAi = (f) => f.id?.startsWith('ai-') || (Array.isArray(f.genre) ? f.genre.includes('AI Magic') : f.genre === 'AI Magic');

    const pickUnique = (predicate, limit = 16) => {
      const row = [];
      for (const f of filteredFilms) {
        if (predicate(f)) {
          row.push(f);
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
  }, [filteredFilms]);

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-zinc-100 font-sans antialiased selection:bg-red-600 selection:text-white">
      <Navbar 
        isClubView={isClubView}
        onOpenClub={() => { setIsClubView(true); setIsArchiveView(false); }}
        isArchiveView={isArchiveView}
        onOpenArchive={() => { setIsArchiveView(true); setIsClubView(false); }}
        lang={lang}
        setLang={setLang}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedGenre={selectedGenre}
        setSelectedGenre={updateGenre}
        genres={genres}
        onResetFilters={resetAllFilters}
      />

      {isClubView ? (
        <ClubPage onBack={() => setIsClubView(false)} lang={lang} />
      ) : isArchiveView ? (
        <ArchivePage onBack={() => setIsArchiveView(false)} onPlayFilm={(f) => setPlayingFilm(f)} lang={lang} />
      ) : (
        <main className="pt-16 pb-20">
          {!isFiltering && featuredFilm && (
            <Hero 
              key={featuredFilm.id || featuredFilm.youtubeVideoId}
              film={featuredFilm} 
              onPlay={(f) => setPlayingFilm(f)} 
              lang={lang} 
              onMouseEnter={() => setIsHeroPaused(true)}
              onMouseLeave={() => setIsHeroPaused(false)}
            />
          )}

          {isFiltering ? (
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-200">
                  {lang === 'hi' ? `परिणाम (${filteredFilms.length})` : `Results (${filteredFilms.length})`}
                </h2>
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-red-500 hover:text-red-400 font-medium"
                >
                  {lang === 'hi' ? 'सभी फ़िल्में देखें (होम)' : 'Back to All Films'}
                </button>
              </div>
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
      )}

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
