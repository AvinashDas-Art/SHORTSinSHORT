import React, { useEffect, useRef } from 'react';
import ShareButton from './ShareButton';
import { filmPath } from '../utils/slug';
import { cleanFilmTitle, cleanEditorialText } from '../utils/editorialText';

const SITE_URL = 'https://www.shortsinshort.com';

const safeText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] || value.en || Object.values(value)[0] || '';
  return String(value);
};


export default function PlayerModal({ film, onClose, lang }) {
  const shell = useRef(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const keys = (event) => {
      if (event.key === 'Escape') onClose();
      if ((event.key === 'f' || event.key === 'F') && shell.current) {
        if (!document.fullscreenElement) shell.current.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    };
    window.addEventListener('keydown', keys);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', keys);
    };
  }, [onClose]);

  if (!film) return null;
  const videoId = film.youtubeVideoId || film.id;
  const rawTitle = lang === 'hi' && film.titleHi ? film.titleHi : safeText(film.title, lang);
  const title = cleanFilmTitle(rawTitle, lang);
  const director = lang === 'hi' && film.directorHi ? film.directorHi : safeText(film.director, lang);
  const rawDescription = lang === 'hi' && film.descriptionHi ? film.descriptionHi : film.description;
  const description = cleanEditorialText(rawDescription, lang);
  const metadata = [safeText(film.country, lang), safeText(film.language, lang), film.year, safeText(film.duration, lang)].filter(Boolean);

  return (
    <div className="sis3-player" ref={shell} role="dialog" aria-modal="true" aria-label={title}>
      <header className="sis3-player-top">
        <button type="button" onClick={onClose} aria-label="Close player">←</button>
        <span>SHORTSinSHORT</span>
        <button type="button" onClick={() => shell.current?.requestFullscreen?.()} aria-label="Fullscreen">⛶</button>
        <ShareButton
          lang={lang}
          url={SITE_URL + filmPath(film)}
          title={`${title} | SHORTSinSHORT`}
          text={lang === 'hi' ? `SHORTSinSHORT पर देखिए: ${title}` : `Watch "${title}" on SHORTSinSHORT`}
        />
      </header>

      <div className="sis3-player-stage">
        <div className="sis3-video-frame">
          {videoId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&controls=1&iv_load_policy=3&cc_load_policy=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : <p>{lang === 'hi' ? 'वीडियो उपलब्ध नहीं है' : 'Video unavailable'}</p>}
        </div>
      </div>

      <section className="sis3-player-info">
        <div>
          <p className="sis3-eyebrow">NOW PLAYING</p>
          <h2>{title}</h2>
          <p className="sis3-player-meta">{metadata.join(' · ')}</p>
        </div>
        <div className="sis3-curator-note">
          <span>{lang === 'hi' ? 'हमने इसे क्यों चुना' : 'Why we chose it'}</span>
          <p>{description || (lang === 'hi' ? 'दुनिया भर से चुनी हुई एक असाधारण शॉर्ट फ़िल्म।' : 'An exceptional short film selected from world cinema.')}</p>
          {director && <small>{lang === 'hi' ? 'निर्देशक' : 'Director'} · {director}</small>}
        </div>
      </section>
    </div>
  );
}
