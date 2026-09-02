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
  onSurpriseMe,
  lang, 
  setLang, 
  searchTerm, 
  setSearchTerm, 
  selectedGenre, 
  setSelectedGenre, 
  genres,
  selectedLangFilter,
  setSelectedLangFilter,
  languages,
  onResetFilters 
}) {
  return (
    <nav className="sis-nav fixed top-0 left-0 right-0 z-40 bg-[#0d0d0f]/95 backdrop-blur-md border-b border-zinc-800/80 px-3 md:px-8 py-3 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onResetFilters} 
          className="group flex items-baseline select-none cursor-pointer focus:outline-none transition transform hover:scale-[1.02]"
        >
          <span className="text-red-600 font-black text-2xl md:text-3xl tracking-tight drop-shadow-[0_2px_10px_rgba(220,38,38,0.35)]">
            SHORTS
          </span>
          <span className="text-white font-extrabold text-xl md:text-2xl tracking-normal ml-0.5 group-hover:text-zinc-200 transition">
            in<span className="text-white font-black uppercase tracking-tight">SHORT</span>
          </span>
        </button>
      </div>

      {!isClubView && !isArchiveView && (
        <div className="hidden lg:flex items-center space-x-2.5 max-w-xl w-full mx-4">
          <input 
            type="text"
            placeholder={lang === 'hi' ? "फ़िल्में, निर्देशक खोजें..." : "Search films, directors..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white px-3.5 py-1.5 rounded-lg focus:outline-none focus:border-red-600 transition"
          />

          <select
            value={selectedLangFilter}
            onChange={(e) => setSelectedLangFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-red-600 cursor-pointer"
          >
            <option value="All">{lang === 'hi' ? 'भाषा: सब' : 'Language: All'}</option>
            {languages.map((l, idx) => (
              <option key={idx} value={l}>{l}</option>
            ))}
          </select>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-red-600 cursor-pointer"
          >
            <option value="All">{lang === 'hi' ? 'शैली: सब' : 'Genre: All'}</option>
            {genres.map((g, idx) => {
              const label = safeText(g, lang);
              return <option key={idx} value={typeof g === 'string' ? g : label}>{label}</option>;
            })}
          </select>
        </div>
      )}

      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={onSurpriseMe}
          title={lang === 'hi' ? 'रैंडम फ़िल्म देखें' : 'Surprise Me'}
          className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-white hover:border-amber-500/50 cursor-pointer transition group"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="group-hover:rotate-45 transition transform duration-300">
            <rect x="3" y="3" width="18" height="18" rx="4" ry="4"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
            <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"/>
            <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"/>
          </svg>
          <span className="hidden xl:inline">{lang === 'hi' ? 'सरप्राइज़' : 'Surprise'}</span>
        </button>

        <button
          onClick={onOpenArchive}
          className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl border cursor-pointer transition ${
            isArchiveView ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/>
            <line x1="17" y1="2" x2="17" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="2" y1="7" x2="7" y2="7"/>
            <line x1="2" y1="17" x2="7" y2="17"/>
            <line x1="17" y1="17" x2="22" y2="17"/>
            <line x1="17" y1="7" x2="22" y2="7"/>
          </svg>
          <span className="hidden sm:inline">{lang === 'hi' ? 'मेरी रील' : 'My Reel'}</span>
        </button>

        <button
          onClick={onOpenClub}
          className="flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow cursor-pointer transition hover:opacity-95"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>Club ₹5</span>
        </button>

        <button
          onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
          className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg cursor-pointer transition font-semibold"
        >
          {lang === 'hi' ? 'EN' : 'HI'}
        </button>
      </div>
    </nav>
  );
}
