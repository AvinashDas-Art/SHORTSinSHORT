import React from 'react';

const safeText = (val, lang = 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val[lang] || val.en || Object.values(val)[0] || '';
  return String(val);
};

export default function Hero({ film, onPlay, lang, onMouseEnter, onMouseLeave }) {
  if (!film) return null;

  const title = lang === 'hi' && film.titleHi ? film.titleHi : safeText(film.title, lang);
  const description = lang === 'hi' && film.descriptionHi ? film.descriptionHi : safeText(film.description, lang);
  const language = safeText(film.language, lang);
  const duration = safeText(film.duration, lang);
  const vid = film.youtubeVideoId || film.id;
  const thumbSrc = film.thumbnail || (vid ? `https://img.youtube.com/vi/${vid}/maxresdefault.jpg` : '');

  return (
    <div 
      className="relative w-full h-[65vh] md:h-[75vh] bg-black overflow-hidden select-none"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="absolute inset-0">
        <img 
          src={thumbSrc} 
          alt={title}
          onError={(e) => {
            if (vid) e.target.src = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
          }}
          className="w-full h-full object-cover object-center opacity-60 transition-all duration-1000 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0f] via-[#0d0d0f]/60 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 h-full flex flex-col justify-end pb-12 md:pb-16">
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center space-x-2">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {Array.isArray(film.genre) && film.genre.includes('AI Magic') ? 'AI SPECIAL' : 'FEATURED'}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {language} • {duration} • {film.year || '2026'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
            {title}
          </h1>

          <p className="text-sm md:text-base text-zinc-300 line-clamp-3 leading-relaxed drop-shadow">
            {description}
          </p>

          <div className="flex items-center space-x-4 pt-2">
            <button
              onClick={() => onPlay(film)}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg cursor-pointer transition duration-200 focus:outline-none"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span className="cursor-pointer">{lang === 'hi' ? 'अभी देखें' : 'Play Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
