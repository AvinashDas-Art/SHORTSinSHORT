import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import PlayerModal from './components/PlayerModal';
import ClubModal from './components/ClubModal';
import ArchiveView from './components/ArchiveView';
import filmsData from './data/films.json';

export default function App() {
  const [lang, setLang] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [isClubView, setIsClubView] = useState(false);
  const [isArchiveView, setIsArchiveView] = useState(false);
  const [activeFilm, setActiveFilm] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // URL Query Sync
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const genreParam = params.get('genre');
    if (genreParam) setSelectedGenre(genreParam);
  }, []);

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    const url = new URL(window.location);
    if (genre && genre !== 'All') {
      url.searchParams.set('genre', genre);
    } else {
      url.searchParams.delete('genre');
    }
    window.history.pushState({}, '', url);
  };

  const handleResetFilters = () => {
    setSelectedGenre('All');
    setSearchTerm('');
    setIsClubView(false);
    setIsArchiveView(false);
    const url = new URL(window.location);
    url.search = '';
    window.history.pushState({}, '', url);
  };

  const allFilms = useMemo(() => filmsData || [], []);

  // Surprise Me: Random Film Picker
  const handleSurpriseMe = () => {
    if (allFilms.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allFilms.length);
    setActiveFilm(allFilms[randomIndex]);
  };

  const genres = useMemo(() => {
    const set = new Set();
    allFilms.forEach(f => {
      if (Array.isArray(f.genre)) f.genre.forEach(g => set.add(g));
      else if (typeof f.genre === 'string') set.add(f.genre);
    });
    return Array.from(set);
  }, [allFilms]);

  // Top featured films for 7s Auto-cycling Hero
  const heroFilms = useMemo(() => allFilms.slice(0, 8), [allFilms]);

  useEffect(() => {
    if (isHeroHovered || heroFilms.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroFilms.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isHeroHovered, heroFilms]);

  // Categories Categorization
  const standardCategories = useMemo(() => {
    const cats = ['Award Winning', 'Drama', 'Thriller', 'Global Cinema'];
    return cats.map(cat => ({
      title: cat,
      films: allFilms.filter(f => {
        const gList = Array.isArray(f.genre) ? f.genre : [f.genre];
        return gList.some(g => typeof g === 'string' && g.toLowerCase() === cat.toLowerCase());
      })
    })).filter(c => c.films.length > 0);
  }, [allFilms]);

  const aiMagicFilms = useMemo(() => {
    return allFilms.filter(f => {
      const gList = Array.isArray(f.genre) ? f.genre : [f.genre];
      return gList.some(g => typeof g === 'string' && g.toLowerCase().includes('ai'));
    });
  }, [allFilms]);

  // Search / Single Genre Filtered List
  const filteredFilms = useMemo(() => {
    return allFilms.filter(film => {
      const matchesSearch = searchTerm === '' || 
        (film.title && film.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (film.director && film.director.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const gList = Array.isArray(film.genre) ? film.genre : [film.genre];
      const matchesGenre = selectedGenre === 'All' || gList.some(g => typeof g === 'string' && g.toLowerCase() === selectedGenre.toLowerCase());
      
      return matchesSearch && matchesGenre;
    });
  }, [allFilms, searchTerm, selectedGenre]);

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Navbar
        isClubView={isClubView}
        onOpenClub={() => { setIsClubView(true); setIsArchiveView(false); }}
        isArchiveView={isArchiveView}
        onOpenArchive={() => { setIsArchiveView(true); setIsClubView(false); }}
        onSurpriseMe={handleSurpriseMe}
        lang={lang}
        setLang={setLang}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedGenre={selectedGenre}
        setSelectedGenre={handleGenreChange}
        genres={genres}
        onResetFilters={handleResetFilters}
      />

      <main className="flex-1 pt-16">
        {isClubView ? (
          <ClubModal onClose={() => setIsClubView(false)} lang={lang} />
        ) : isArchiveView ? (
          <ArchiveView onSelectFilm={setActiveFilm} lang={lang} onBack={handleResetFilters} />
        ) : selectedGenre !== 'All' || searchTerm !== '' ? (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {lang === 'hi' ? 'परिणाम' : 'Results'} ({filteredFilms.length})
              </h2>
              <button onClick={handleResetFilters} className="text-xs text-red-500 hover:underline">
                {lang === 'hi' ? 'सभी फ़िल्में देखें' : 'Back to All Films'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFilms.map(film => (
                <div key={film.id || film.youtubeVideoId}>
                  <MovieRow films={[film]} onSelectFilm={setActiveFilm} lang={lang} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <Hero
              film={heroFilms[heroIndex]}
              onPlay={setActiveFilm}
              lang={lang}
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
            />

            <div className="space-y-4 -mt-10 relative z-10 pb-16">
              {standardCategories.map((category) => (
                <MovieRow
                  key={category.title}
                  title={category.title}
                  films={category.films}
                  onSelectFilm={setActiveFilm}
                  lang={lang}
                />
              ))}

              {aiMagicFilms.length > 0 && (
                <MovieRow
                  title="AI Magic"
                  films={aiMagicFilms}
                  onSelectFilm={setActiveFilm}
                  lang={lang}
                />
              )}
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

      <footer className="border-t border-zinc-800/60 py-8 px-4 text-center text-xs text-zinc-500">
        <p>© 2026 SHORTSinSHORT. Curated World Cinema in Short Formats.</p>
      </footer>
    </div>
  );
}
