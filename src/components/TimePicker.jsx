import React, { useMemo, useState } from 'react';
import { getDailyFilmForDuration, getIndiaDateKey } from '../utils/dailyHeroFilms';
import { cleanFilmTitle } from '../utils/editorialText';

const text = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] || value.en || Object.values(value)[0] || '';
  return String(value);
};

export default function TimePicker({ films = [], onSelectFilm, lang = 'en' }) {
  const [minutes, setMinutes] = useState(10);

  // Rotates daily per duration bucket (like the homepage hero) instead of
  // always featuring the same single longest film under that cutoff.
  const featured = useMemo(
    () => getDailyFilmForDuration(films, minutes, getIndiaDateKey()) || films[0],
    [films, minutes]
  );
  if (!featured) return null;

  const title = cleanFilmTitle(
    lang === 'hi' && featured.titleHi ? featured.titleHi : featured.title,
    lang
  );
  const language = text(featured.language, lang);
  const length = text(featured.duration, lang) || text(featured.runtime, lang);
  const videoId = featured.youtubeVideoId || featured.id;
  const artwork = featured.backdrop || featured.thumbnail ||
    (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '');

  return (
    <section className="sis-time-picker" aria-labelledby="sis-time-title">
      <div className="sis-time-copy">
        <p className="sis-time-kicker">Your time. Our taste.</p>
        <h2 id="sis-time-title">
          {lang === 'hi' ? 'आपके पास कितना समय है?' : 'How much time do you have?'}
        </h2>
        <p>
          {lang === 'hi'
            ? 'मिनट चुनिए। शानदार फ़िल्म हम चुनेंगे।'
            : 'Choose the minutes. We will choose the cinema.'}
        </p>
        <div className="sis-time-options" aria-label="Choose available time">
          {[5, 10, 15, 20, 30].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={minutes === value}
              onClick={() => setMinutes(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div
        className="sis-time-feature"
        style={artwork ? { backgroundImage: `url("${artwork}")` } : undefined}
      >
        <div>
          <p className="sis-time-kicker">
            {lang === 'hi' ? `${minutes} मिनट के भीतर` : `A great film under ${minutes} minutes`}
          </p>
          <h3>{title}</h3>
          <p>{[language, length].filter(Boolean).join(' · ')}</p>
          <button type="button" onClick={() => onSelectFilm(featured)}>
            {lang === 'hi' ? 'फ़िल्म देखिए' : 'Watch film'}
          </button>
        </div>
      </div>
    </section>
  );
}
