import React from 'react';

const safeText = (val, lang = 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val[lang] || val.en || Object.values(val)[0] || '';
  return String(val);
};

export default function Navbar({ 
  isClubView, 
  onOpenClub, 
  isArchiveView,
  onOpenArchive,
  lang, 
  setLang, 
  searchTerm, 
  setSearchTerm, 
  selectedGenre, 
  setSelectedGenre, 
  genres, 
  onResetFilters 
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0d0d0f]/90 backdrop-blur-md border-b border-zinc-800/60 px-4 md:px-8 py-3 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center space-x-6">
        <button 
          onClick={onResetFilters} 
          className="flex items-center space-x-2 text-white font-black text-xl tracking-tighter hover:opacity-90 transition"
        >
          <span className="text-red-600 font-black">SHORTS</span>
          <span className="text-white font-light text-sm tracking-widest pl-0.5">inSHORT</span>
        </button>
      </div>

      {!isClubView && !isArchiveView && (
        <div className="hidden md:flex items-center space-x-3 max-w-md w-full mx-4">
          <input 
            type="text"
            placeholder={lang === 'hi' ? "फ़िल्में, निर्देशक खोजें..." : "Search films, directors..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white px-3.5 py-1.5 rounded-lg focus:outline-none focus:border-red-600 transition"
          />

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-red-600"
          >
            <option value="All">{lang === 'hi' ? 'कैटगरी: सब' : 'Genre: All'}</option>
            {genres.map((g, idx) => {
              const label = safeText(g, lang);
              return <option key={idx} value={typeof g === 'string' ? g : label}>{label}</option>;
            })}
          </select>
        </div>
      )}

      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenArchive}
          className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
            isArchiveView ? 'bg-red-600 border-red-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span className="hidden sm:inline">{lang === 'hi' ? 'आर्काइव' : 'Archive'}</span>
        </button>

        <button
          onClick={onOpenClub}
          className="flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition hover:opacity-95"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>Club ₹5</span>
        </button>

        <button
          onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
          className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg transition"
        >
          {lang === 'hi' ? 'EN' : 'HI'}
        </button>
      </div>
    </nav>
  );
}
