import React from 'react';
import MovieCard from './MovieCard';

export default function MovieRow({ title, films, onSelectFilm, lang }) {
  if (!films || films.length === 0) return null;

  return (
    <div className="my-6 md:my-8 px-4 md:px-12">
      <h2 className="text-lg md:text-xl font-bold text-white tracking-wide mb-3 flex items-center gap-2">
        <span className="w-1 h-4 bg-red-600 rounded-full inline-block"></span>
        {title}
      </h2>
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar scroll-smooth">
        {films.map((film) => (
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
