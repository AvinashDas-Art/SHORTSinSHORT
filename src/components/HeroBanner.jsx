import React from 'react';

export default function HeroBanner({ film, onPlay, lang = 'hi' }) {
  if (!film) return null;

  const title = film.title?.[lang] || film.title?.en || film.title;
  const desc = film.description?.[lang] || film.description?.en || film.description;
  const bannerImg = `https://i.ytimg.com/vi/${film.youtubeVideoId}/maxresdefault.jpg`;

  return (
    <div className="relative w-full h-[65vh] md:h-[75vh] bg-black overflow-hidden select-none">
      {/* बैकग्राउंड इमेज विथ एस्थेटिक सिनेमाई विग्नेट */}
      <img
        src={bannerImg}
        onError={(e) => { e.target.src = `https://i.ytimg.com/vi/${film.youtubeVideoId}/hqdefault.jpg`; }}
        alt={title}
        className="w-full h-full object-cover object-center opacity-50 filter brightness-90"
      />
      
      {/* रेडियल और लीनियर सिनेमाई डार्क ग्रेडिएंट */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent w-full md:w-3/4" />

      {/* हीरो कंटेंट */}
      <div className="absolute bottom-12 md:bottom-16 left-6 md:left-14 max-w-2xl z-10">
        <div className="flex items-center gap-2.5 mb-3 text-xs font-medium tracking-wide text-zinc-300">
          <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">Featured</span>
          <span>{film.country || 'India'}</span>
          <span>•</span>
          <span>{film.language || 'Hindi'}</span>
          <span>•</span>
          <span>{film.duration || '15 min'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg mb-4">
          {title}
        </h1>
        <p className="text-zinc-300 text-sm md:text-base line-clamp-3 leading-relaxed drop-shadow mb-6 font-light max-w-xl">
          {desc}
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onPlay(film)}
            className="flex items-center gap-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-md shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <span className="text-base">▶</span> Play Now
          </button>
        </div>
      </div>
    </div>
  );
}
