import React from 'react';

export default function VideoModal({ film, onClose, lang = 'hi' }) {
  if (!film) return null;

  const title = film.title?.[lang] || film.title?.en || film.title;
  const desc = film.description?.[lang] || film.description?.en || film.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors"
        >
          ✕
        </button>
        <div className="relative aspect-video w-full bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${film.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        <div className="p-5">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-zinc-300">
            <span className="bg-zinc-800 px-2 py-0.5 rounded">{film.country || 'India'}</span>
            <span className="bg-zinc-800 px-2 py-0.5 rounded">{film.language || 'Hindi'}</span>
            <span className="bg-zinc-800 px-2 py-0.5 rounded">{film.duration}</span>
            {film.genre && film.genre.map((g, i) => (
              <span key={i} className="bg-red-950/60 text-red-300 border border-red-800/40 px-2 py-0.5 rounded">{g}</span>
            ))}
          </div>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}
