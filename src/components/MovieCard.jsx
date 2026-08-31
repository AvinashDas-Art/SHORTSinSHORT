import React, { useState } from 'react';

export default function MovieCard({ film, onSelect, lang = 'hi' }) {
  const [imgSrc, setImgSrc] = useState(
    film.thumbnailUrl || `https://i.ytimg.com/vi/${film.youtubeVideoId}/hqdefault.jpg`
  );

  const title = film.title?.[lang] || film.title?.en || film.title || 'Untitled';
  const desc = film.description?.[lang] || film.description?.en || film.description || '';

  return (
    <div 
      onClick={() => onSelect(film)}
      className="group relative flex-none w-56 md:w-64 aspect-video bg-zinc-900 rounded-lg overflow-hidden cursor-pointer shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:z-30 hover:shadow-2xl hover:shadow-black"
    >
      {/* थंबनेल */}
      <img 
        src={imgSrc} 
        alt={title}
        onError={() => setImgSrc(`https://i.ytimg.com/vi/${film.youtubeVideoId}/mqdefault.jpg`)}
        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* सिनेमाई होवर ओवरले - केवल माउस ले जाने पर दिखेगा */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 backdrop-blur-[1px]">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold shadow">
            ▶
          </div>
          <span className="text-[11px] font-semibold text-zinc-300">{film.duration || '15 min'}</span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            {film.language || 'Hindi'}
          </span>
        </div>
        <h3 className="text-xs md:text-sm font-bold text-white leading-tight line-clamp-1">
          {title}
        </h3>
        {desc && (
          <p className="text-[10px] md:text-[11px] text-zinc-300 line-clamp-2 mt-1 leading-tight font-normal">
            {desc}
          </p>
        )}
      </div>
    </div>
  );
}
