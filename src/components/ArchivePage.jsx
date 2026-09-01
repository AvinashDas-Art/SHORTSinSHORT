import React, { useState, useEffect } from 'react';
import { Play, Trash2, ArrowLeft, Clock } from 'lucide-react';

export default function ArchivePage({ onBack, onPlayFilm, lang }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const records = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('watch_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && item.title) {
            records.push(item);
          }
        } catch (e) {}
      }
    }
    records.sort((a, b) => b.lastWatched - a.lastWatched);
    setHistory(records);
  }, []);

  const clearHistory = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('watch_')) localStorage.removeItem(key);
    });
    setHistory([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-20">
      <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {lang === 'hi' ? 'मेरा आर्काइव' : 'My Archive'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {lang === 'hi' ? 'आपकी देखी गयी फ़िल्में और बची हुई प्रगति' : 'Continue watching where you left off'}
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center space-x-1 text-xs text-zinc-400 hover:text-red-400 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800 transition"
          >
            <Trash2 size={14} />
            <span>{lang === 'hi' ? 'साफ़ करें' : 'Clear All'}</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/20 rounded-2xl border border-zinc-900">
          <Clock size={48} className="mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-400 font-medium">
            {lang === 'hi' ? 'आपने अभी तक कोई फ़िल्म नहीं देखी है।' : 'No watch history found yet.'}
          </p>
          <button 
            onClick={onBack}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-5 py-2 rounded-xl transition"
          >
            {lang === 'hi' ? 'फ़िल्में देखें' : 'Explore Cinema'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {history.map(item => (
            <div 
              key={item.filmId}
              onClick={() => onPlayFilm({ ...item, id: item.filmId, youtubeVideoId: item.filmId.replace('ai-', '') })}
              className="group relative bg-zinc-900/80 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 cursor-pointer transition flex flex-col"
            >
              <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition">
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
                  <div 
                    className="h-full bg-red-600 rounded-r-full" 
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-red-400 transition line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{item.director}</p>
                </div>
                <div className="flex items-center justify-between mt-3 text-[11px] text-zinc-400 border-t border-zinc-800/60 pt-2">
                  <span className="text-red-400 font-semibold">{item.percent}% Watched</span>
                  <span>{item.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
