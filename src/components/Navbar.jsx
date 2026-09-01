import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
  const { currentUser, loginWithGoogle, logout, isPremium } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d0f]/90 backdrop-blur-md border-b border-zinc-800/60 px-4 md:px-8 py-3 flex items-center justify-between transition-all duration-300">
      {/* Brand Logo */}
      <div 
        onClick={onResetFilters}
        className="flex items-center space-x-2 cursor-pointer select-none group"
      >
        <span className="text-xl md:text-2xl font-black tracking-tight text-red-600 group-hover:scale-105 transition-transform duration-200">
          SHORTS<span className="text-zinc-400 font-light italic">in</span>SHORT
        </span>
      </div>

      {/* Middle: Search & Filter Controls */}
      <div className="flex items-center space-x-2 md:space-x-3 flex-1 max-w-xl mx-4">
        <div className="relative w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'hi' ? "फ़िल्में, निर्देशक खोजें..." : "Search films, directors..."}
            className="w-full bg-zinc-900/80 border border-zinc-700/60 text-zinc-200 text-xs md:text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-zinc-500"
          />
          <svg className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Desktop Filter Dropdowns */}
        <div className="hidden lg:flex items-center space-x-2">
          <select 
            value={selectedGenre} 
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="All">Genre: All</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="All">Language: All</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Right Controls: Language & Sign In */}
      <div className="flex items-center space-x-3">
        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="text-xs font-semibold px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
        >
          {lang === 'en' ? 'Hi' : 'En'}
        </button>

        {/* User Auth Button / Profile Avatar */}
        {currentUser ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <img 
                src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=ef4444&color=fff`} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-red-500/80 object-cover hover:scale-105 transition-transform"
              />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-zinc-800">
                  <p className="text-xs font-bold text-zinc-100 truncate">{currentUser.displayName || 'Cinema Lover'}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                  {isPremium ? (
                    <span className="inline-block mt-1 text-[10px] bg-red-600/30 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/40">
                      ★ Premium Member
                    </span>
                  ) : (
                    <span className="inline-block mt-1 text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                      Free Member
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-zinc-800/80 transition flex items-center space-x-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md hover:shadow-red-600/30 transition transform hover:scale-105"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
            </svg>
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
