
import React, { useEffect, useRef, useState } from 'react';
import { getFilmVideoId, loadBestHeroArtwork } from '../utils/heroArtwork';

const safeText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] || value.en || Object.values(value)[0] || '';
  return String(value);
};
const cleanEditorialText = (value, lang = 'en') => {
  const raw = safeText(value, lang)
    .replace(/(^|\s)#[\p{L}\p{N}_-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s'"“”‘’,:;-]+/, '')
    .trim();
  if (!raw) return '';
  const sentences = raw.match(/[^.!?]+[.!?]+/g);
  if (sentences?.length) return sentences.slice(0, 2).join(' ').trim();
  const clauses = raw.split(',').map((part) => part.trim()).filter(Boolean);
  if (clauses.length > 2) return `${clauses.slice(0, 2).join(', ')}.`;
  if (!/[.!?][”’'"]?$/.test(raw)) return '';
  if (raw.length <= 190) return raw;
  return `${raw.slice(0, 187).replace(/\s+\S*$/, '')}…`;
};


const HeroSlide = ({ slide, onPlay, lang, stateClass }) => {
  const { film, artwork } = slide;
  const title = lang === 'hi' && film.titleHi ? film.titleHi : safeText(film.title, lang);
  const rawDescription = lang === 'hi' && film.descriptionHi ? film.descriptionHi : film.description;
  const cleanedDescription = cleanEditorialText(rawDescription, lang);
  const description = cleanedDescription || (lang === 'hi'
    ? 'दुनिया भर से चुनी हुई एक असाधारण शॉर्ट फ़िल्म।'
    : `A handpicked short film from ${safeText(film.country, lang) || 'world cinema'}, selected for its cinematic craft.`);
  const language = safeText(film.language, lang);
  const duration = safeText(film.duration, lang) || safeText(film.runtime, lang);
  const country = safeText(film.country, lang);
  return (
    <div className={`sis3-hero-slide ${stateClass}`} aria-hidden={stateClass === 'is-previous'}>
      <img src={artwork} alt="" />
      <div className="sis3-hero-shade" />
      <div className="sis3-hero-content">
        <p className="sis3-eyebrow">SHORTSinSHORT SELECTION</p>
        <h1>{title}</h1>
        <p className="sis3-hero-meta">{[country, language, film.year, duration].filter(Boolean).join(' · ')}</p>
        {description && <p className="sis3-hero-description">{description}</p>}
        <div className="sis3-hero-actions">
          <button className="sis3-play" type="button" onClick={() => onPlay(film)}>
            <span aria-hidden="true">▶</span>{lang === 'hi' ? 'फ़िल्म देखिए' : 'Watch film'}
          </button>
          <button className="sis3-secondary" type="button" onClick={() => document.querySelector('.sis3-film-row, .sis-time-picker')?.scrollIntoView({ behavior: 'smooth' })}>
            {lang === 'hi' ? 'और फ़िल्में' : 'Explore collection'}
          </button>
        </div>
      </div>
      <p className="sis3-hero-note">{lang === 'hi' ? 'दुनिया भर से चुना हुआ शॉर्ट सिनेमा' : 'Exceptional short cinema, handpicked worldwide'}</p>
    </div>
  );
};

export default function Hero({
  film,
  nextFilm,
  onPlay,
  lang,
  onMouseEnter,
  onMouseLeave,
  onArtworkReady,
  onArtworkUnavailable
}) {
  const [currentSlide, setCurrentSlide] = useState(null);
  const [previousSlide, setPreviousSlide] = useState(null);
  const currentSlideRef = useRef(null);
  const callbacksRef = useRef({ onArtworkReady, onArtworkUnavailable });

  useEffect(() => {
    callbacksRef.current = { onArtworkReady, onArtworkUnavailable };
  }, [onArtworkReady, onArtworkUnavailable]);

  useEffect(() => {
    if (!film) return undefined;
    let cancelled = false;
    const filmKey = getFilmVideoId(film) || safeText(film.title);

    loadBestHeroArtwork(film)
      .then((artwork) => {
        if (cancelled) return;
        const nextSlide = { film, artwork, key: `${filmKey}:${artwork}` };
        const outgoingSlide = currentSlideRef.current;
        setPreviousSlide(outgoingSlide);
        currentSlideRef.current = nextSlide;
        setCurrentSlide(nextSlide);
        callbacksRef.current.onArtworkReady?.(filmKey);
      })
      .catch(() => {
        if (!cancelled) callbacksRef.current.onArtworkUnavailable?.(filmKey);
      });

    return () => { cancelled = true; };
  }, [film]);

  useEffect(() => {
    if (!previousSlide) return undefined;
    const timer = window.setTimeout(() => setPreviousSlide(null), 700);
    return () => window.clearTimeout(timer);
  }, [previousSlide]);

  useEffect(() => {
    if (!nextFilm) return undefined;
    // Warm the browser cache during the current slide's 7-second window.
    // A failed preload is handled when that film is actually requested, so
    // the slide currently on screen never jumps unexpectedly.
    loadBestHeroArtwork(nextFilm).catch(() => {});
    return undefined;
  }, [nextFilm]);

  if (!currentSlide) return <section className="sis3-hero sis3-hero-loading" aria-label="Loading featured film" />;

  return (
    <section className="sis3-hero" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {previousSlide && (
        <HeroSlide slide={previousSlide} onPlay={onPlay} lang={lang} stateClass="is-previous" />
      )}
      <HeroSlide key={currentSlide.key} slide={currentSlide} onPlay={onPlay} lang={lang} stateClass="is-current" />
    </section>
  );
}
