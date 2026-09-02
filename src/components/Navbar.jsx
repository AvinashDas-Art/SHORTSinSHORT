import React, { useState } from 'react';
import DiscoveryWorlds from './DiscoveryWorlds';

const safeText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] || value.en || Object.values(value)[0] || '';
  return String(value);
};

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
);

export default function Navbar({
  isClubView, onOpenClub, isArchiveView, onOpenArchive, onSurpriseMe,
  lang, setLang, searchTerm, setSearchTerm, selectedGenre, setSelectedGenre,
  genres = [], selectedLangFilter, setSelectedLangFilter, languages = [],
  onResetFilters, films = [], onSelectFilm
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeWorld, setActiveWorld] = useState(null);

  const goHome = () => {
    setSearchOpen(false);
    setActiveWorld(null);
    onResetFilters?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWorld = (world) => {
    setSearchOpen(false);
    setActiveWorld(world);
  };

  return (
    <>
      <header className="sis3-nav">
        <button className="sis3-brand" type="button" onClick={goHome} aria-label="SHORTSinSHORT home">
          <span>SHORTS</span><i>in</i><strong>SHORT</strong><b aria-hidden="true" />
        </button>
        <nav className="sis3-primary-links" aria-label="Primary navigation">
          <button type="button" onClick={() => openWorld('atlas')}>{lang === 'hi' ? 'दुनिया का नक़्शा' : 'World Atlas'}</button>
          <button type="button" onClick={() => openWorld('festival')}>{lang === 'hi' ? 'फ़ेस्टिवल सर्किट' : 'Festival Circuit'}</button>
          <button type="button" onClick={() => openWorld('mood')}>{lang === 'hi' ? 'मूड और समय' : 'Mood & Time'}</button>
        </nav>
        <div className="sis3-nav-actions">
          <button className="sis3-icon-button" type="button" onClick={() => setSearchOpen((value) => !value)} aria-label="Search"><SearchIcon /></button>
          <button className="sis3-text-action sis3-desktop-action" type="button" onClick={onSurpriseMe}>{lang === 'hi' ? 'कोई शानदार फ़िल्म चलाइए' : 'Play me a great film'}</button>
          <button className="sis3-text-action sis3-desktop-action" type="button" onClick={onOpenArchive} aria-pressed={isArchiveView}>{lang === 'hi' ? 'मेरी रील' : 'My Reel'}</button>
          <button className="sis3-club-action" type="button" onClick={onOpenClub} aria-pressed={isClubView}>Club ₹5</button>
          <button className="sis3-language" type="button" onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}>{lang === 'hi' ? 'EN' : 'HI'}</button>
        </div>
      </header>

      {searchOpen && (
        <section className="sis3-discovery" aria-label="Film discovery">
          <label><span>{lang === 'hi' ? 'खोजिए' : 'Search'}</span><input autoFocus type="search" placeholder={lang === 'hi' ? 'फ़िल्म, निर्देशक या विषय...' : 'Film, director or subject...'} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label>
          <label><span>{lang === 'hi' ? 'भाषा' : 'Language'}</span><select value={selectedLangFilter} onChange={(event) => setSelectedLangFilter(event.target.value)}><option value="All">{lang === 'hi' ? 'सभी भाषाएं' : 'All languages'}</option>{languages.map((item) => <option key={safeText(item)} value={item}>{safeText(item, lang)}</option>)}</select></label>
          <label><span>{lang === 'hi' ? 'शैली' : 'Genre'}</span><select value={selectedGenre} onChange={(event) => setSelectedGenre(event.target.value)}><option value="All">{lang === 'hi' ? 'सभी शैलियां' : 'All genres'}</option>{genres.map((item) => { const label = safeText(item, lang); return <option key={label} value={typeof item === 'string' ? item : label}>{label}</option>; })}</select></label>
          <button type="button" onClick={() => setSearchOpen(false)}>{lang === 'hi' ? 'हो गया' : 'Done'}</button>
        </section>
      )}

      <nav className="sis3-mobile-dock" aria-label="Mobile navigation">
        <button type="button" onClick={goHome}><span className="sis3-dock-icon"><svg viewBox="0 0 24 24"><path d="M4 11.5 12 5l8 6.5V20h-6v-5h-4v5H4z"/></svg></span>{lang === 'hi' ? 'होम' : 'Home'}</button>
        <button type="button" onClick={() => openWorld('atlas')}><span className="sis3-dock-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.3 2.2 3.5 4.8 3.5 8S14.3 17.8 12 20M12 4c-2.3 2.2-3.5 4.8-3.5 8S9.7 17.8 12 20"/></svg></span>{lang === 'hi' ? 'दुनिया' : 'Worlds'}</button>
        <button type="button" onClick={onSurpriseMe}><span className="sis3-dock-icon"><svg viewBox="0 0 24 24"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg></span>{lang === 'hi' ? 'सरप्राइज़' : 'Surprise'}</button>
        <button type="button" onClick={onOpenArchive}><span className="sis3-dock-icon"><svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 5v14M16 5v14M4 10h4M16 10h4M4 14h4M16 14h4"/></svg></span>{lang === 'hi' ? 'मेरी रील' : 'My Reel'}</button>
      </nav>

      {activeWorld && <DiscoveryWorlds world={activeWorld} films={films} lang={lang} onClose={() => setActiveWorld(null)} onSelectFilm={onSelectFilm} />}
    </>
  );
}
