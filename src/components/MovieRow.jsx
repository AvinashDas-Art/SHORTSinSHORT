import React, { useRef, useState, useEffect } from 'react';
import MovieCard from './MovieCard';

const safeText = (val, lang = 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val[lang] || val.en || Object.values(val)[0] || '';
  return String(val);
};

export default function MovieRow({ title, films, onSelectFilm, lang }) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (!films || films.length === 0) return null;

  const checkScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [films]);

  const scroll = (direction) => {
    if (!rowRef.current) return;
    const clientWidth = rowRef.current.clientWidth;
    // लगभग 4-5 कार्ड्स की चौड़ाई जितना स्क्रोल
    const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
    rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  return (
    <div className="relative px-4 md:px-8 py-3 group/row select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-4 bg-red-600 rounded-full" />
          <h2 className="text-lg md:text-xl font-bold text-zinc-100 tracking-tight">
            {safeText(title, lang)}
          </h2>
        </div>
      </div>

      <div className="relative">
        {/* बायां ट्रांसपैरेंट स्क्रोल एरो */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-center justify-start pl-2 text-white/70 hover:text-white transition-opacity duration-200 opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll Left"
          >
            <div className="p-2 rounded-full bg-black/60 hover:bg-red-600 backdrop-blur-sm border border-white/10 transition shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </div>
          </button>
        )}

        {/* हॉरिजॉन्टल 5-कार्ड रो */}
        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex space-x-4 md:space-x-5 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {films.map(film => (
            <div 
              key={film.id || film.youtubeVideoId}
              className="flex-none w-[44vw] sm:w-[29vw] md:w-[22vw] lg:w-[calc(20%-1rem)]"
            >
              <MovieCard 
                film={film}
                onSelect={onSelectFilm}
                lang={lang}
              />
            </div>
          ))}
        </div>

        {/* दायां ट्रांसपैरेंट स्क्रोल एरो */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-black/90 via-black/50 to-transparent flex items-center justify-end pr-2 text-white/70 hover:text-white transition-opacity duration-200 opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll Right"
          >
            <div className="p-2 rounded-full bg-black/60 hover:bg-red-600 backdrop-blur-sm border border-white/10 transition shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
