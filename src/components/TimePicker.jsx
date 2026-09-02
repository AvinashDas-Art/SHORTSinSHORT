import React, { useMemo, useState } from 'react';

const text = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] || value.en || Object.values(value)[0] || '';
  return String(value);
};

const runtime = (film) => {
  const raw = text(film?.duration, 'en') || text(film?.runtime, 'en');
  const match = String(raw).match(/(\d{1,3})/);
  return match ? Number(match[1]) : null;
};

export default function TimePicker({ films = [], onSelectFilm, lang = 'en' }) {
  const [minutes, setMinutes] = useState(10);

  const matches = useMemo(() => films
    .filter((film) => {
      const value = runtime(film);
      return value !== null && value <= minutes;
    })
    .sort((a, b) => (runtime(b) || 0) - (runtime(a) || 0)), [films, minutes]);

  const featured = matches[0] || films[0];
  if (!featured) return null;

  const title = lang === 'hi' && featured.titleHi
    ? featured.titleHi
    : text(featured.title, lang);
  const language = text(featured.language, lang);
  const length = text(featured.duration, lang) || text(featured.runtime, lang);

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

      <div className="sis-time-feature">
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
