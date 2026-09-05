
const getSafeString = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return (val.en || val.hi || Object.values(val)[0] || "");
  return String(val);
};

import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import TimePicker from './components/TimePicker';
import MovieCard from './components/MovieCard';
import PlayerModal from './components/PlayerModal';
// These four are only ever shown behind a click (club page, profile, legal
// pages, the YouTube archive), never on first paint - loading them lazily
// keeps them out of the initial JS bundle everyone downloads on arrival.
const ClubModal = lazy(() => import('./components/ClubModal'));
const LegalPage = lazy(() => import('./components/LegalPage'));
const ArchiveView = lazy(() => import('./components/ArchiveView'));
const ProfileModal = lazy(() => import('./components/ProfileModal'));
import filmsData from './data/films.json';
import { getDailyHeroFilms, getIndiaDateKey } from './utils/dailyHeroFilms';
import { filmPath } from './utils/slug';

const SITE_URL = 'https://www.shortsinshort.com';
const DEFAULT_TITLE = 'SHORTSinSHORT - Curated World Cinema in Short Formats';
const DEFAULT_DESCRIPTION = 'Discover handpicked short films from India and around the world, presented through authorised creator and YouTube embeds., thrillers, human dramas, and groundbreaking AI cinema.';

const setMetaTag = (attr, key, content) => {
  if (!content) return;
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setCanonical = (href) => {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

const setJsonLd = (data) => {
  let script = document.getElementById('film-jsonld');
  if (!data) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'film-jsonld';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

const safeText = (val, lang = 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val[lang] || val.en || Object.values(val)[0] || '';
  return String(val);
};

export default function App() {
  const { filmId } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLangFilter, setSelectedLangFilter] = useState('All');
  const [isClubView, setIsClubView] = useState(false);
  const [isArchiveView, setIsArchiveView] = useState(false);
  const [legalView, setLegalView] = useState(null);
  const [activeFilm, setActiveFilm] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroDayKey, setHeroDayKey] = useState(() => getIndiaDateKey());
  const [heroReadyKey, setHeroReadyKey] = useState('');
  const [unavailableHeroIds, setUnavailableHeroIds] = useState(() => new Set());
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [watchHistory, setWatchHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shorts_watch_history') || '[]');
      setWatchHistory(saved);
    } catch (e) {
      setWatchHistory([]);
    }
  }, []);

  const handlePlayFilm = (film) => {
    setActiveFilm(film);
    navigate(filmPath(film));
    try {
      const saved = JSON.parse(localStorage.getItem('shorts_watch_history') || '[]');
      const filtered = saved.filter(f => (f.id || f.youtubeVideoId) !== (film.id || film.youtubeVideoId));
      const updated = [film, ...filtered].slice(0, 30);
      localStorage.setItem('shorts_watch_history', JSON.stringify(updated));
      setWatchHistory(updated);
    } catch (e) {}
  };

  const handleClosePlayer = () => {
    setActiveFilm(null);
    if (filmId) navigate('/');
  };

  const handleResetFilters = () => {
    setSelectedGenre('All');
    setSelectedLangFilter('All');
    setSearchTerm('');
    setIsClubView(false);
    setIsArchiveView(false);
    setLegalView(null);
  };

  const allFilms = useMemo(() => filmsData || [], []);

  // New films are appended at the end of films.json, so this reversed view
  // shows the latest additions first (position #1) in the homepage rows and
  // in search/filter results, with older films sliding further back.
  // (dailyHeroFilms.js does its own reversal internally, so the Hero keeps
  // using `allFilms` in its original order — do not swap that one.)
  const newestFirstFilms = useMemo(() => [...allFilms].reverse(), [allFilms]);

  const filmsById = useMemo(() => {
    const map = new Map();
    allFilms.forEach((f) => {
      const id = f.id || f.youtubeVideoId;
      if (id) map.set(id, f);
    });
    return map;
  }, [allFilms]);

  // Opening a /film/:filmId link directly (a shared link, a bookmark, or a
  // page refresh) should open that film's player, same as clicking it from
  // a row. A bad/unknown id just sends the visitor back to the homepage.
  useEffect(() => {
    if (!filmId) {
      // Covers the browser Back/Forward buttons: the URL already changed to
      // "/" (react-router updates filmId on its own for that), so just
      // close the player - no navigate() here, or Back would get stuck.
      setActiveFilm((current) => (current ? null : current));
      return;
    }
    const decoded = decodeURIComponent(filmId);
    const film = filmsById.get(decoded);
    if (film) {
      setActiveFilm((current) => {
        const currentId = current?.id || current?.youtubeVideoId;
        return currentId === decoded ? current : film;
      });
    } else if (filmsById.size > 0) {
      navigate('/', { replace: true });
    }
  }, [filmId, filmsById, navigate]);

  // Per-film <title>/meta description/canonical/VideoObject so a shared
  // film link (and Google's JS-rendered index) carries that film's own
  // details instead of the generic homepage ones.
  useEffect(() => {
    if (activeFilm) {
      const title = safeText(activeFilm.title, lang) || DEFAULT_TITLE;
      const description = safeText(activeFilm.descriptionHi || activeFilm.description, lang) || DEFAULT_DESCRIPTION;
      const pageTitle = `${title} | SHORTSinSHORT`;
      document.title = pageTitle;
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:title', pageTitle);
      setMetaTag('property', 'og:description', description);
      if (activeFilm.thumbnail) setMetaTag('property', 'og:image', activeFilm.thumbnail);
      setMetaTag('name', 'twitter:title', pageTitle);
      setMetaTag('name', 'twitter:description', description);
      const canonicalUrl = SITE_URL + filmPath(activeFilm);
      setCanonical(canonicalUrl);
      setJsonLd({
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: title,
        description,
        thumbnailUrl: activeFilm.thumbnail ? [activeFilm.thumbnail] : undefined,
        uploadDate: activeFilm.year ? `${activeFilm.year}-01-01` : undefined,
        duration: Number.isFinite(activeFilm.durationSeconds) ? `PT${activeFilm.durationSeconds}S` : undefined,
        embedUrl: activeFilm.youtubeVideoId ? `https://www.youtube.com/embed/${activeFilm.youtubeVideoId}` : undefined,
        contentUrl: activeFilm.youtubeVideoId ? `https://www.youtube.com/watch?v=${activeFilm.youtubeVideoId}` : undefined
      });
    } else {
      document.title = DEFAULT_TITLE;
      setMetaTag('name', 'description', DEFAULT_DESCRIPTION);
      setMetaTag('property', 'og:title', DEFAULT_TITLE);
      setMetaTag('property', 'og:description', DEFAULT_DESCRIPTION);
      setMetaTag('property', 'og:image', SITE_URL + '/og-image.png');
      setMetaTag('name', 'twitter:title', DEFAULT_TITLE);
      setMetaTag('name', 'twitter:description', DEFAULT_DESCRIPTION);
      setCanonical(SITE_URL + '/');
      setJsonLd(null);
    }
  }, [activeFilm, lang]);

  // Distinct Languages & Genres
  const { genres, languages } = useMemo(() => {
    const gSet = new Set();
    const lSet = new Set();
    allFilms.forEach(f => {
      if (Array.isArray(f.genre)) f.genre.forEach(g => gSet.add(g));
      else if (typeof f.genre === 'string') gSet.add(f.genre);

      const l = safeText(f.language, 'en');
      if (l) lSet.add(l);
    });
    return { 
      genres: Array.from(gSet), 
      languages: Array.from(lSet).filter(Boolean).sort()
    };
  }, [allFilms]);

  // Surprise Random Picker
  const handleSurpriseMe = () => {
    if (allFilms.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allFilms.length);
    handlePlayFilm(allFilms[randomIndex]);
  };

  // Five fresh hero films per India calendar day; each remains on screen for 7 seconds.
  const dailyHeroFilms = useMemo(
    () => getDailyHeroFilms(allFilms, heroDayKey),
    [allFilms, heroDayKey]
  );
  const heroFilms = useMemo(
    () => dailyHeroFilms.filter((film) => !unavailableHeroIds.has(film.youtubeVideoId || film.youtubeId || film.id)),
    [dailyHeroFilms, unavailableHeroIds]
  );
  useEffect(() => {
    const timer = setInterval(() => setHeroDayKey(getIndiaDateKey()), 60_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    setHeroIndex(0);
    setHeroReadyKey('');
  }, [heroDayKey]);
  useEffect(() => {
    if (isHeroHovered || heroFilms.length <= 1 || !heroReadyKey) return undefined;
    const timer = setTimeout(() => {
      setHeroReadyKey('');
      setHeroIndex((prev) => (prev + 1) % heroFilms.length);
    }, 7000);
    return () => clearTimeout(timer);
  }, [isHeroHovered, heroFilms.length, heroIndex, heroReadyKey]);

  const handleHeroArtworkUnavailable = (filmKey) => {
    if (!filmKey) return;
    setUnavailableHeroIds((current) => {
      if (current.has(filmKey)) return current;
      const updated = new Set(current);
      updated.add(filmKey);
      return updated;
    });
    setHeroReadyKey('');
    setHeroIndex(0);
  };

  // Client-Side Recommendations
  const recommendedFilms = useMemo(() => {
    if (watchHistory.length === 0) return [];
    const genreScore = {};
    const watchedIds = new Set(watchHistory.map(f => f.id || f.youtubeVideoId));

    watchHistory.slice(0, 8).forEach(film => {
      const gList = Array.isArray(film.genre) ? film.genre : [film.genre];
      gList.forEach(g => { if (g) genreScore[g] = (genreScore[g] || 0) + 1; });
    });

    return allFilms
      .filter(f => !watchedIds.has(f.id || f.youtubeVideoId))
      .map(f => {
        let score = 0;
        const gList = Array.isArray(f.genre) ? f.genre : [f.genre];
        gList.forEach(g => { if (genreScore[g]) score += genreScore[g] * 2; });
        return { film: f, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.film)
      .slice(0, 10);
  }, [watchHistory, allFilms]);

  // Dedicated Rows
  const categorizedSections = useMemo(() => {
    const list = [
      {
        title: lang === 'hi' ? 'पुरस्कृत और बहुप्रशंसित (Award Winners & Festival Favourites)' : 'Award Winners & Festival Favourites',
        films: newestFirstFilms.filter(f => {
          const gList = (Array.isArray(f.genre) ? f.genre : [f.genre]).map(String);
          return gList.some(g => g.toLowerCase().includes('award'));
        })
      },
      {
        title: lang === 'hi' ? '🌍 वर्ल्ड सिनेमा (World Cinema Showcase)' : 'World Cinema, In Short',
        films: newestFirstFilms.filter(f => {
          const l = safeText(f.language, 'en').toLowerCase();
          const gList = (Array.isArray(f.genre) ? f.genre : [f.genre]).map(String);
          const isWorldGenre = gList.some(g => g.toLowerCase().includes('world'));
          const isInternationalLang = ['french', 'iranian', 'spanish', 'german', 'korean', 'japanese'].includes(l);
          const isSilentClassic = l === 'silent' && isWorldGenre;
          return isInternationalLang || isSilentClassic || (isWorldGenre && l !== 'malayalam' && l !== 'tamil' && l !== 'telugu' && l !== 'kannada' && l !== 'hindi' && l !== 'bhojpuri' && l !== 'maithili' && l !== 'marathi' && l !== 'bengali');
        })
      },
      {
        title: lang === 'hi' ? '🌴 मलयालम सिनेमा हब (Roots of Kerala)' : 'Roots of Kerala (Malayalam Short Films)',
        films: newestFirstFilms.filter(f => safeText(f.language, 'en').toLowerCase() === 'malayalam')
      },
      {
        title: lang === 'hi' ? '🌾 माटी की कहानियाँ: मैथिली सिनेमा' : 'Roots of Mithila (Maithili Short Films)',
        films: newestFirstFilms.filter(f => safeText(f.language, 'en').toLowerCase() === 'maithili')
      },
      {
        title: lang === 'hi' ? '🚩 मराठी शॉर्ट सिनेमा (Marathi Cinema Showcase)' : 'Marathi Cinema Showcase (Marathi Shorts)',
        films: newestFirstFilms.filter(f => safeText(f.language, 'en').toLowerCase() === 'marathi')
      },
      {
        title: lang === 'hi' ? '🌿 भोजपुरी माटी (Bhojpuri Cinema Showcase)' : 'Bhojpuri Soil & Cinema (Bhojpuri Shorts)',
        films: newestFirstFilms.filter(f => safeText(f.language, 'en').toLowerCase() === 'bhojpuri')
      },
      {
        title: lang === 'hi' ? '🎭 बांग्ला शॉर्ट सिनेमा (Bengali Masterpieces)' : 'Bangla Cinema Showcase (Bengali Shorts)',
        films: newestFirstFilms.filter(f => safeText(f.language, 'en').toLowerCase() === 'bengali')
      },
      {
        title: lang === 'hi' ? 'AI सिनेमा और न्यू-एज विज़ुअल्स' : 'AI Magic & Generative Cinema',
        films: newestFirstFilms.filter(f => {
          const gList = (Array.isArray(f.genre) ? f.genre : [f.genre]).map(String);
          return gList.some(g => g.toLowerCase().includes('ai'));
        })
      },
      {
        title: lang === 'hi' ? 'ह्यूमन ड्रामा और संवेदनाएँ' : 'Human Drama & Emotions',
        films: newestFirstFilms.filter(f => {
          const gList = (Array.isArray(f.genre) ? f.genre : [f.genre]).map(String);
          return gList.some(g => g.toLowerCase() === 'drama');
        })
      },
      {
        title: lang === 'hi' ? 'थ्रिलर और सस्पेंस' : 'Thrillers & Suspense',
        films: newestFirstFilms.filter(f => {
          const gList = (Array.isArray(f.genre) ? f.genre : [f.genre]).map(String);
          return gList.some(g => g.toLowerCase().includes('thriller') || g.toLowerCase().includes('suspense'));
        })
      }
    ];

    return list.filter(sec => sec.films.length > 0);
  }, [newestFirstFilms, lang]);

  // Combined Search & Filter View
  const filteredFilms = useMemo(() => {
    return newestFirstFilms.filter(film => {
      const matchesSearch = searchTerm === '' || 
        (film.title && getSafeString(film.title).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (film.director && getSafeString(film.director).toLowerCase().includes(searchTerm.toLowerCase()));
      
      const gList = Array.isArray(film.genre) ? film.genre : [film.genre];
      const matchesGenre = selectedGenre === 'All' || gList.some(g => typeof g === 'string' && g.toLowerCase() === selectedGenre.toLowerCase());
      
      const filmLang = safeText(film.language, 'en');
      const matchesLang = selectedLangFilter === 'All' || (filmLang && filmLang.toLowerCase() === selectedLangFilter.toLowerCase());

      return matchesSearch && matchesGenre && matchesLang;
    });
  }, [newestFirstFilms, searchTerm, selectedGenre, selectedLangFilter]);

  const isFiltered = selectedGenre !== 'All' || selectedLangFilter !== 'All' || searchTerm !== '';

  return (
    <div className="sis-v2 min-h-screen bg-[#221f1a] text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Navbar
        isClubView={isClubView}
        onOpenClub={() => { setIsClubView(true); setIsArchiveView(false); setLegalView(null); }}
        isArchiveView={isArchiveView}
        onOpenArchive={() => { setIsArchiveView(true); setIsClubView(false); setLegalView(null); }}
        onSurpriseMe={handleSurpriseMe}
        lang={lang}
        setLang={setLang}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        genres={genres}
        selectedLangFilter={selectedLangFilter}
        setSelectedLangFilter={setSelectedLangFilter}
        languages={languages}
        onResetFilters={handleResetFilters}
        films={allFilms}
        onSelectFilm={handlePlayFilm}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="flex-1 pt-16">
        {legalView ? (
          <Suspense fallback={null}>
            <LegalPage page={legalView} lang={lang} onBack={() => setLegalView(null)} />
          </Suspense>
        ) : isClubView ? (
          <Suspense fallback={null}>
            <ClubModal onClose={() => setIsClubView(false)} lang={lang} />
          </Suspense>
        ) : isArchiveView ? (
          <Suspense fallback={null}>
            <ArchiveView onSelectFilm={handlePlayFilm} lang={lang} onBack={handleResetFilters} />
          </Suspense>
        ) : isFiltered ? (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {lang === 'hi' ? 'फ़िल्में' : 'Catalog'} ({filteredFilms.length})
              </h2>
              <button onClick={handleResetFilters} className="text-xs text-red-500 hover:underline">
                {lang === 'hi' ? 'फ़िल्टर साफ़ करें' : 'Clear Filters'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredFilms.map(film => (
                <MovieCard key={film.id || film.youtubeVideoId} film={film} onSelect={handlePlayFilm} lang={lang} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <Hero
              film={heroFilms[heroIndex]}
              nextFilm={heroFilms.length > 1 ? heroFilms[(heroIndex + 1) % heroFilms.length] : null}
              onPlay={handlePlayFilm}
              lang={lang}
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
              onArtworkReady={setHeroReadyKey}
              onArtworkUnavailable={handleHeroArtworkUnavailable}
            />

            <div className="space-y-4 -mt-10 relative z-10 pb-16">
              {recommendedFilms.length > 0 && (
                <MovieRow
                  title={lang === 'hi' ? '✨ आपके लिए अनुशंसित' : '✨ Recommended For You'}
                  films={recommendedFilms}
                  onSelectFilm={handlePlayFilm}
                  lang={lang}
                />
              )}
              <TimePicker
                films={allFilms}
                onSelectFilm={handlePlayFilm}
                lang={lang}
              />


              {categorizedSections.map((section) => (
                <MovieRow
                  key={section.title}
                  title={section.title}
                  films={section.films}
                  onSelectFilm={handlePlayFilm}
                  lang={lang}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {activeFilm && (
        <PlayerModal
          film={activeFilm}
          onClose={handleClosePlayer}
          lang={lang}
        />
      )}

      {profileOpen && (
        <Suspense fallback={null}>
          <ProfileModal lang={lang} onClose={() => setProfileOpen(false)} />
        </Suspense>
      )}

      <footer className="border-t border-zinc-800/60 px-4 py-8 text-center text-xs text-zinc-500">
        <p>© 2026 SHORTSinSHORT. An Equal Tales Entertainment Pvt Ltd initiative.</p>
        <nav className="mx-auto mt-4 flex max-w-4xl flex-wrap justify-center gap-x-5 gap-y-3" aria-label="Legal and support">
          <button type="button" onClick={() => { setLegalView('contact'); setIsClubView(false); setIsArchiveView(false); window.scrollTo(0, 0); }} className="border-0 bg-transparent hover:text-white">{lang === 'hi' ? 'हमारे बारे में और संपर्क' : 'About & Contact'}</button>
          <button type="button" onClick={() => { setLegalView('content'); setIsClubView(false); setIsArchiveView(false); window.scrollTo(0, 0); }} className="border-0 bg-transparent hover:text-white">{lang === 'hi' ? 'कंटेंट और कॉपीराइट' : 'Content & Copyright'}</button>
          <button type="button" onClick={() => { setLegalView('membership'); setIsClubView(false); setIsArchiveView(false); window.scrollTo(0, 0); }} className="border-0 bg-transparent hover:text-white">{lang === 'hi' ? 'सदस्यता की शर्तें' : 'Membership Terms'}</button>
          <button type="button" onClick={() => { setLegalView('refunds'); setIsClubView(false); setIsArchiveView(false); window.scrollTo(0, 0); }} className="border-0 bg-transparent hover:text-white">{lang === 'hi' ? 'Cancellation और Refund' : 'Cancellation & Refund'}</button>
          <button type="button" onClick={() => { setLegalView('privacy'); setIsClubView(false); setIsArchiveView(false); window.scrollTo(0, 0); }} className="border-0 bg-transparent hover:text-white">Privacy</button>
        </nav>
      </footer>
    </div>
  );
}
