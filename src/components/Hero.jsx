import React from 'react';

export default function Hero({ film, onPlay, lang = 'hi' }) {
  if (!film) return null;

  const title = film.title?.[lang] || film.title?.en || film.title;
  const desc = film.description?.[lang] || film.description?.en || film.description;

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] bg-black overflow-hidden select-none">
      <img
        src={`https://i.ytimg.com/vi/${film.youtubeVideoId}/maxresdefault.jpg`}
        onError={(e) => { e.target.src = `https://i.ytimg.com/vi/${film.youtubeVideoId}/hqdefault.jpg`; }}
        alt={title}
        className="w-full h-full object-cover object-center opacity-45 filter brightness-90"
      />
      
      {/* सिनेमैटिक ग्रेडिएंट्स */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent w-full md:w-2/3" />

      {/* हीरो विवरण */}
      <div className="absolute bottom-10 md:bottom-14 left-4 md:left-12 max-w-xl z-10">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-zinc-300">
          <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
            Featured
          </span>
          <span>{film.country || 'India'}</span>
          <span>•</span>
          <span>{film.language || 'Hindi'}</span>
          <span>•</span>
          <span>{film.duration || '15 min'}</span>
        </div>
        <h1 className="text-2xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3 drop-shadow-md">
          {title}
        </h1>
        <p className="text-zinc-300 text-xs md:text-sm line-clamp-3 leading-relaxed mb-5 font-light">
          {desc}
        </p>
        <button
          onClick={() => onPlay(film)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded shadow-lg transition-all transform hover:scale-105"
        >
          <span>▶</span> Play Now
        </button>
      </div>
    </div>
  );
}
