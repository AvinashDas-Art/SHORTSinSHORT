import React, { useState, useMemo } from 'react';
import filmsData from './data/films.json';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import MovieCard from './components/MovieCard';
import VideoModal from './components/VideoModal';

export default function App() {
  const [lang, setLang] = useState('hi');
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
    filmsData.forEach(f => f.genre?.forEach(g => set.add(g)));
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

  const filteredFilms = useMemo(() => {
    return filmsData.filter(film => {
      const titleEn = film.title?.en || film.title || '';
      const titleHi = film.title?.hi || film.title || '';
      const descEn = film.description?.en || film.description || '';
      const descHi = film.description?.hi || film.description || '';
      const director = film.director || '';
      
      const q = searchTerm.toLowerCase();
      const matchesSearch = !q || 
        titleEn.toLowerCase().includes(q) || 
        titleHi.toLowerCase().includes(q) || 
        descEn.toLowerCase().includes(q) || 
        descHi.toLowerCase().includes(q) ||
        director.toLowerCase().includes(q);

      const matchesGenre = selectedGenre === 'All' || (film.genre && film.genre.includes(selectedGenre));
      const matchesLang = selectedLanguage === 'All' || film.language === selectedLanguage;
      const matchesCountry = selectedCountry === 'All' || film.country === selectedCountry;

      return matchesSearch && matchesGenre && matchesLang && matchesCountry;
    });
  }, [searchTerm, selectedGenre, selectedLanguage, selectedCountry]);

  const featuredFilm = useMemo(() => {
    return filmsData.find(f => f.isFeatured) || filmsData[0];
  }, []);

  const isFiltering = searchTerm || selectedGenre !== 'All' || selectedLanguage !== 'All' || selectedCountry !== 'All';

  const awardWinningFilms = useMemo(() => filteredFilms.filter(f => f.genre?.includes('Award Winning') || f.popularityScore >= 95), [filteredFilms]);
  const dramaFilms = useMemo(() => filteredFilms.filter(f => f.genre?.includes('Drama')), [filteredFilms]);
  const thrillerFilms = useMemo(() => filteredFilms.filter(f => f.genre?.includes('Thriller') || f.genre?.includes('Mystery')), [filteredFilms]);
  const globalFilms = useMemo(() => filteredFilms.filter(f => f.country !== 'India'), [filteredFilms]);

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-zinc-100 font-sans antialiased selection:bg-red-600 selection:text-white">
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        onResetFilters={resetAllFilters}
        genres={genres}
        languages={languages}
        countries={countries}
        lang={lang}
        setLang={setLang}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
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
            <MovieRow 
              title={lang === 'hi' ? "अवार्ड-विनिंग और लोकप्रिय शॉर्ट फ़िल्में" : "Award Winning & Popular"} 
              films={awardWinningFilms.length ? awardWinningFilms : filteredFilms.slice(0, 15)} 
              onSelectFilm={(f) => setPlayingFilm(f)} 
              lang={lang} 
            />
            <MovieRow 
              title={lang === 'hi' ? "ड्रामा और भावनाएँ" : "Drama & Emotions"} 
              films={dramaFilms.length ? dramaFilms : filteredFilms.slice(5, 20)} 
              onSelectFilm={(f) => setPlayingFilm(f)} 
              lang={lang} 
            />
            <MovieRow 
              title={lang === 'hi' ? "थ्रिलर और सस्पेंस" : "Thriller & Suspense"} 
              films={thrillerFilms.length ? thrillerFilms : filteredFilms.slice(10, 25)} 
              onSelectFilm={(f) => setPlayingFilm(f)} 
              lang={lang} 
            />
            {globalFilms.length > 0 && (
              <MovieRow 
                title={lang === 'hi' ? "ग्लोबल और ऑस्कर शॉर्ट्स" : "Global & Oscar Shorts"} 
                films={globalFilms} 
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
