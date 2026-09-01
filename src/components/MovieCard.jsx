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
  const language = safeText(film.language, lang);

  return (
    <div 
      onClick={() => onSelect(film)}
      className="group relative cursor-pointer flex flex-col select-none"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 group-hover:border-zinc-700 transition">
        <img 
          src={film.thumbnail} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
      </div>

      <div className="mt-2.5 px-0.5">
        <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-red-400 transition line-clamp-1">
          {title}
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
          {lang === 'hi' ? 'निर्देशित: ' : 'Directed by '}
          <span className="text-zinc-300">{director || (lang === 'hi' ? 'स्वतंत्र निर्माता' : 'Independent Creator')}</span>
          {language && <span className="text-red-500 ml-1">[{language}]</span>}
        </p>
      </div>
    </div>
  );
}
