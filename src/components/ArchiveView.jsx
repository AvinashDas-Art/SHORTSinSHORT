import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';

export default function ArchiveView({ onSelectFilm, lang, onBack }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shorts_watch_history') || '[]');
      setHistory(saved);
    } catch (e) {
      setHistory([]);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-[60vh]">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {lang === 'hi' ? 'मेरा सिनेमा' : 'My Cinema'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {lang === 'hi' ? 'हाल में देखी गई फ़िल्में' : 'Your recently watched films'}
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs bg-zinc-900 border border-zinc-800 hover:border-red-600 text-zinc-300 hover:text-white px-4 py-2 rounded-xl transition"
        >
          {lang === 'hi' ? '← वापस होम पर' : '← Back to Home'}
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
            🎬
          </div>
          <p className="text-sm">{lang === 'hi' ? 'आपका सिनेमा अभी खाली है। कोई फ़िल्म देखकर शुरुआत करें!' : 'Your cinema is empty. Start with a film!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {history.map((film) => (
            <MovieCard key={film.id || film.youtubeVideoId} film={film} onSelect={onSelectFilm} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
