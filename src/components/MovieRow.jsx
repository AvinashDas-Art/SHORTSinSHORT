import React, { useEffect, useRef, useState } from 'react';
import MovieCard from './MovieCard';

const safeText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] || value.en || Object.values(value)[0] || '';
  return String(value);
};

export default function MovieRow({ title, films, onSelectFilm, lang }) {
  const track = useRef(null);
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(true);
  const update = () => {
    if (!track.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = track.current;
    setLeft(scrollLeft > 8);
    setRight(scrollLeft < scrollWidth - clientWidth - 8);
  };

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [films]);

  if (!films?.length) return null;
  const move = (direction) => track.current?.scrollBy({ left: direction * track.current.clientWidth * .82, behavior: 'smooth' });

  return (
    <section className="sis3-film-row">
      <header><h2>{safeText(title, lang)}</h2><span>{lang === 'hi' ? 'चुनी हुई फ़िल्में' : 'Handpicked films'}</span></header>
      <div className="sis3-row-stage">
        {left && <button className="sis3-row-arrow sis3-row-left" type="button" onClick={() => move(-1)} aria-label="Previous films">‹</button>}
        <div className="sis3-row-track" ref={track} onScroll={update}>
          {films.map((film) => (
            <div className="sis3-card-shell" key={film.id || film.youtubeVideoId}>
              <MovieCard film={film} onSelect={onSelectFilm} lang={lang} />
            </div>
          ))}
        </div>
        {right && <button className="sis3-row-arrow sis3-row-right" type="button" onClick={() => move(1)} aria-label="Next films">›</button>}
      </div>
    </section>
  );
}
