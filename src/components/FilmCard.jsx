import React, { useState } from 'react';

export default function FilmCard({ film, onSelect, lang = 'hi' }) {
  const [imgSrc, setImgSrc] = useState(
    `https://i.ytimg.com/vi/${film.youtubeVideoId}/hqdefault.jpg`
  );

  const handleImageError = () => {
    // अगर hqdefault फ़ेल हो तो mqdefault पर स्विच करें
    if (imgSrc.includes('hqdefault.jpg')) {
      setImgSrc(`https://i.ytimg.com/vi/${film.youtubeVideoId}/mqdefault.jpg`);
    } else {
      setImgSrc(`https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60`);
    }
  };

  const title = film.title?.[lang] || film.title?.en || film.title;
  const desc = film.description?.[lang] || film.description?.en || film.description;

  return (
    <div 
      onClick={() => onSelect(film)}
      className="group relative flex-none w-64 md:w-72 bg-zinc-900 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-20 hover:shadow-2xl hover:shadow-red-950/40"
    >
      <div className="relative aspect-video w-full bg-zinc-800 overflow-hidden">
        <img 
          src={imgSrc} 
          alt={title}
          onError={handleImageError}
          className="w-full h-full object-cover object-center group-hover:opacity-90 transition-opacity"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-xs bg-red-600 text-white font-semibold px-2 py-0.5 rounded shadow">
            ▶ Play
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-white truncate">{title}</h3>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
          <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{film.country || 'Global'}</span>
          <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{film.language || 'Hindi'}</span>
          <span>{film.duration}</span>
        </div>
        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-snug">{desc}</p>
      </div>
    </div>
  );
}
