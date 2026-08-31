import React from 'react';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  selectedGenre,
  setSelectedGenre,
  selectedLanguage,
  setSelectedLanguage,
  selectedCountry,
  setSelectedCountry,
  onResetFilters,
  genres = [],
  languages = [],
  countries = [],
  lang,
  setLang
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* लोगो - क्लिक करने पर होम और रीसेट */}
        <div 
          onClick={onResetFilters}
          className="flex items-center gap-1 cursor-pointer select-none group flex-shrink-0"
        >
          <span className="text-xl md:text-2xl font-black tracking-tighter text-red-600 transition-transform group-hover:scale-105">
            SHORTS<span className="text-white font-medium italic text-base md:text-lg">in</span>SHORT
          </span>
        </div>

        {/* सर्च बार */}
        <div className="flex-1 max-w-xs md:max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 text-xs">
              🔍
            </span>
            <input
              type="text"
              placeholder={lang === 'hi' ? "फ़िल्में खोजें..." : "Search films..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/90 text-zinc-200 text-xs md:text-sm pl-8 pr-3 py-1.5 rounded-full border border-zinc-700/60 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-3 flex items-center text-xs text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* फ़िल्टर्स और लैंग्वेज */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="hidden sm:block bg-zinc-900 text-zinc-300 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-800 focus:outline-none cursor-pointer"
          >
            <option value="All">Genre: All</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="hidden sm:block bg-zinc-900 text-zinc-300 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-800 focus:outline-none cursor-pointer"
          >
            <option value="All">Language: All</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <button
            onClick={onResetFilters}
            className="text-[11px] text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Reset
          </button>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded ${lang === 'en' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              En
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-0.5 rounded ${lang === 'hi' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Hi
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
