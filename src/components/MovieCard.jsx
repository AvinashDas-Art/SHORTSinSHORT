import React, { useState } from 'react';

export default function MovieCard({ film, onSelect, lang = 'hi' }) {
  const [imgSrc, setImgSrc] = useState(
    film.thumbnailUrl || `https://i.ytimg.com/vi/${film.youtubeVideoId}/hqdefault.jpg`
  );

  const title = film.title?.[lang] || film.title?.en || film.title || 'Untitled';
  const director = film.director || 'Filmmaker';
  const language = film.language || 'Hindi';

  return (
    <div 
      onClick={() => onSelect(film)}
      className="group flex-none w-56 md:w-64 cursor-pointer select-none"
    >
      {/* थंबनेल बॉक्स */}
      <div className="relative aspect-video w-full bg-zinc-900 rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black">
        <img 
          src={imgSrc} 
          alt={title}
          onError={() => setImgSrc(`https://i.ytimg.com/vi/${film.youtubeVideoId}/mqdefault.jpg`)}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* होवर प्ले आइकॉन ओवरले */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-red-600/90 text-white flex items-center justify-center text-sm font-bold shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            ▶
          </div>
        </div>
      </div>

      {/* थंबनेल के ठीक नीचे निर्देशक और भाषा का विवरण */}
      <div className="mt-2 px-0.5">
        <h3 className="text-xs md:text-sm font-semibold text-zinc-100 truncate group-hover:text-red-400 transition-colors">
          {title}
        </h3>
        <p className="text-[11px] md:text-xs text-zinc-400 mt-0.5 truncate tracking-normal">
          <span className="text-zinc-500 font-light">Directed by</span> <span className="text-zinc-300 font-medium">{director}</span> <span className="text-red-500/90 font-medium">[{language}]</span>
        </p>
      </div>
    </div>
  );
}
