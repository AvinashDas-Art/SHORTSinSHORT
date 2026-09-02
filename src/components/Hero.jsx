import React from 'react';

const safeText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] || value.en || Object.values(value)[0] || '';
  return String(value);
};

export default function Hero({ film, onPlay, lang, onMouseEnter, onMouseLeave }) {
  if (!film) return null;

  const videoId = film.youtubeVideoId || film.id;
  const title = lang === 'hi' && film.titleHi ? film.titleHi : safeText(film.title, lang);
  const description = lang === 'hi' && film.descriptionHi ? film.descriptionHi : safeText(film.description, lang);
  const language = safeText(film.language, lang);
  const duration = safeText(film.duration, lang) || safeText(film.runtime, lang);
  const country = safeText(film.country, lang);
  const artwork = film.backdrop || film.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '');

  return (
    <section className="sis3-hero" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <img
        src={artwork}
        alt=""
        onError={(event) => {
          if (videoId) event.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }}
      />
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
    </section>
  );
}
