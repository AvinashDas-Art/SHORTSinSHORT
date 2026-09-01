import React from 'react';

const safeText = (val, lang = 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val[lang] || val.en || Object.values(val)[0] || '';
  return String(val);
};

export default function MovieCard({ film, onSelect, lang }) {
  if (!film) return null;

  const title = lang === 'hi' && film.titleHi ? film.titleHi : safeText(film.title, lang);
  const director = lang === 'hi' && film.directorHi ? film.directorHi : safeText(film.director, lang);
  const language = safeText(film.language, lang) || 'Hindi';
  const duration = safeText(film.duration, lang);
  const vid = film.youtubeVideoId || film.id;
  const thumbSrc = film.thumbnail || (vid ? `https://img.youtube.com/vi/${vid}/mqdefault.jpg` : '');

  return (
    <div 
      onClick={() => onSelect(film)}
      className="group relative flex-shrink-0 w-full cursor-pointer select-none transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative aspect-video w-full bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800/80 group-hover:border-red-600/60 shadow-md transition duration-300">
        <img 
          src={thumbSrc} 
          alt={title}
          onError={(e) => {
            if (vid) e.target.src = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition" />

        {/* Top Badges: Language & AI/Club */}
        <div className="absolute top-2 left-2 flex items-center space-x-1.5">
          <span className="bg-black/70 backdrop-blur-md border border-white/10 text-zinc-300 text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
            {language}
          </span>
          {film.hasSubtitles !== false && (
            <span className="bg-zinc-800/80 backdrop-blur-md text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
              CC
            </span>
          )}
        </div>

        {/* Duration Badge */}
        {duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded">
            {duration}
          </span>
        )}

        {/* Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
          <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-0.5 px-0.5">
        <h3 className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white line-clamp-1 transition">
          {title}
        </h3>
        <p className="text-[11px] text-zinc-500 line-clamp-1">
          {director || (Array.isArray(film.genre) ? film.genre.join(', ') : film.genre)}
        </p>
      </div>
    </div>
  );
}
