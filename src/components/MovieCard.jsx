import React, { useState } from 'react';

const safeText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] || value.en || Object.values(value)[0] || '';
  return String(value);
};

export default function MovieCard({ film, onSelect, lang }) {
  const videoId = film?.youtubeVideoId || film?.id;
  const fallback = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  const [image, setImage] = useState(film?.thumbnail || fallback);
  if (!film) return null;
  const title = lang === 'hi' && film.titleHi ? film.titleHi : safeText(film.title, lang);
  const director = lang === 'hi' && film.directorHi ? film.directorHi : safeText(film.director, lang);
  const language = safeText(film.language, lang);
  const duration = safeText(film.duration, lang) || safeText(film.runtime, lang);
  const country = safeText(film.country, lang);

  return (
    <article className="sis3-film-card">
      <button type="button" onClick={() => onSelect(film)} aria-label={`${lang === 'hi' ? 'देखिए' : 'Watch'} ${title}`}>
        <span className="sis3-card-art">
          <img
            src={image}
            alt={title}
            loading="lazy"
            onError={() => {
              if (videoId && image !== `https://img.youtube.com/vi/${videoId}/0.jpg`) {
                setImage(`https://img.youtube.com/vi/${videoId}/0.jpg`);
              }
            }}
          />
          <i className="sis3-card-play" aria-hidden="true">▶</i>
          {duration && <em>{duration}</em>}
        </span>
        <span className="sis3-card-copy">
          <strong>{title}</strong>
          <small>{[country || language, director].filter(Boolean).join(' · ')}</small>
        </span>
      </button>
    </article>
  );
}
