import React from 'react';
import MovieCard from './MovieCard';

const safeText = (val, lang = 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val[lang] || val.en || Object.values(val)[0] || '';
  return String(val);
};

export default function MovieRow({ title, films, onSelectFilm, lang }) {
  if (!films || films.length === 0) return null;

  return (
    <div className="px-4 md:px-8 py-3">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-1 h-4 bg-red-600 rounded-full" />
        <h2 className="text-lg md:text-xl font-bold text-zinc-100 tracking-tight">
          {safeText(title, lang)}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {films.map(film => (
          <MovieCard 
            key={film.id || film.youtubeVideoId}
            film={film}
            onSelect={onSelectFilm}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}
