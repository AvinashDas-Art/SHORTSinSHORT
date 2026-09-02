import React, { useEffect, useMemo, useState } from 'react';
import MovieCard from './MovieCard';

const text = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] || value.en || Object.values(value)[0] || '';
  return String(value);
};

const runtime = (film) => {
  const match = String(text(film?.duration) || text(film?.runtime)).match(/(\d{1,3})/);
  return match ? Number(match[1]) : null;
};

const timeBucket = (film, upperBound) => {
  const length = runtime(film);
  const lowerBounds = { 5: 0, 10: 5, 15: 10, 20: 15, 30: 20 };
  const lowerBound = lowerBounds[upperBound] ?? 0;
  return length !== null && length > lowerBound && length <= upperBound;
};

const genres = (film) => (Array.isArray(film?.genre) ? film.genre : [film?.genre])
  .map((item) => text(item).toLowerCase())
  .filter(Boolean);

const country = (film) => text(film?.country) || text(film?.region) || text(film?.language) || 'World Cinema';

const artwork = (film) => {
  const videoId = film?.youtubeVideoId || film?.id;
  return film?.backdrop || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '') || film?.thumbnail || '';
};

const dedupe = (films) => {
  const seen = new Set();
  return films.filter((film) => {
    const id = film?.id || film?.youtubeVideoId || text(film?.title);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

function FilmGrid({ films, onSelectFilm, lang }) {
  return (
    <div className="sis4-world-grid">
      {films.map((film) => (
        <MovieCard
          key={film.id || film.youtubeVideoId || text(film.title)}
          film={film}
          lang={lang}
          onSelect={(selected) => onSelectFilm(selected)}
        />
      ))}
    </div>
  );
}

function WorldAtlas({ films, onSelectFilm, lang }) {
  const groups = useMemo(() => {
    const map = new Map();
    films.forEach((film) => {
      const key = country(film);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(film);
    });
    return [...map.entries()]
      .map(([name, items]) => ({ name, films: dedupe(items) }))
      .filter((group) => group.films.length)
      .sort((a, b) => b.films.length - a.films.length || a.name.localeCompare(b.name));
  }, [films]);

  const [selected, setSelected] = useState(groups[0]?.name || '');
  useEffect(() => {
    if (!groups.some((group) => group.name === selected)) setSelected(groups[0]?.name || '');
  }, [groups, selected]);
  const active = groups.find((group) => group.name === selected) || groups[0];
  const heroFilm = active?.films[0] || films[0];

  return (
    <div className="sis4-world-content sis4-atlas">
      <section className="sis4-world-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,14,16,.96), rgba(8,14,16,.58), rgba(8,14,16,.18)), url("${artwork(heroFilm)}")` }}>
        <p>SHORT CINEMA WITHOUT BORDERS</p>
        <h1>{lang === 'hi' ? 'दुनिया का नक़्शा' : 'World Atlas'}</h1>
        <span>{lang === 'hi' ? 'देश नहीं, कहानियां सीमाएं पार करती हैं।' : 'Cross borders through stories, one short film at a time.'}</span>
      </section>

      <div className="sis4-world-layout">
        <aside className="sis4-atlas-index">
          <p>{lang === 'hi' ? 'अपनी दुनिया चुनिए' : 'Choose a cinema territory'}</p>
          {groups.map((group) => (
            <button key={group.name} type="button" aria-pressed={group.name === active?.name} onClick={() => setSelected(group.name)}>
              <span>{group.name}</span><em>{group.films.length}</em>
            </button>
          ))}
        </aside>
        <main className="sis4-world-results">
          <header><div><small>NOW EXPLORING</small><h2>{active?.name || 'World Cinema'}</h2></div><p>{active?.films.length || 0} films</p></header>
          <FilmGrid films={active?.films || []} onSelectFilm={onSelectFilm} lang={lang} />
        </main>
      </div>
    </div>
  );
}

function FestivalCircuit({ films, onSelectFilm, lang }) {
  const programmes = useMemo(() => {
    const field = (film) => [
      ...genres(film),
      text(film?.awards), text(film?.festival), text(film?.description), text(film?.title)
    ].join(' ').toLowerCase();
    const indianLanguages = /hindi|malayalam|marathi|bengali|tamil|telugu|bhojpuri|maithili/;
    const data = [
      {
        id: 'awards',
        title: lang === 'hi' ? 'पुरस्कार और फ़ेस्टिवल' : 'Award Winners',
        note: lang === 'hi' ? 'सम्मानित और फ़ेस्टिवल में चुनी गयी फ़िल्में' : 'Celebrated films and festival favourites',
        films: films.filter((film) => /award|festival|winner|acclaim|official selection/.test(field(film)))
      },
      {
        id: 'india',
        title: lang === 'hi' ? 'भारत की नयी आवाज़ें' : 'New Voices from India',
        note: lang === 'hi' ? 'कई भाषाएं, कई नज़रिए, एक बेचैन सिनेमा' : 'Many languages, many gazes, one restless cinema',
        films: films.filter((film) => /india/.test(country(film).toLowerCase()) || indianLanguages.test(text(film.language).toLowerCase()))
      },
      {
        id: 'world',
        title: lang === 'hi' ? 'दुनिया भर की खोज' : 'World Cinema Spotlight',
        note: lang === 'hi' ? 'स्थानीय कहानियां, सार्वभौमिक असर' : 'Local stories with universal resonance',
        films: films.filter((film) => !/india/.test(country(film).toLowerCase()) && !indianLanguages.test(text(film.language).toLowerCase()))
      },
      {
        id: 'newforms',
        title: lang === 'hi' ? 'सिनेमा के नये रूप' : 'New Forms',
        note: lang === 'hi' ? 'एनीमेशन, प्रयोग और AI cinema' : 'Animation, experiments and AI cinema',
        films: films.filter((film) => /ai|animation|experimental|magic/.test(field(film)))
      }
    ];
    return data.map((item) => ({ ...item, films: dedupe(item.films).slice(0, 24) })).filter((item) => item.films.length);
  }, [films, lang]);

  const [selected, setSelected] = useState(programmes[0]?.id || '');
  useEffect(() => {
    if (!programmes.some((programme) => programme.id === selected)) setSelected(programmes[0]?.id || '');
  }, [programmes, selected]);
  const active = programmes.find((programme) => programme.id === selected) || programmes[0];
  const heroFilm = active?.films[0] || films[0];

  return (
    <div className="sis4-world-content sis4-festival">
      <section className="sis4-world-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(26,10,9,.96), rgba(26,10,9,.56), rgba(26,10,9,.18)), url("${artwork(heroFilm)}")` }}>
        <p>CURATED PROGRAMMES</p>
        <h1>{lang === 'hi' ? 'फ़ेस्टिवल सर्किट' : 'Festival Circuit'}</h1>
        <span>{lang === 'hi' ? 'तालियों से आगे, वे फ़िल्में जो भीतर रह जाती हैं।' : 'Beyond the applause, films that stay with you.'}</span>
      </section>
      <div className="sis4-programme-tabs">
        {programmes.map((programme) => (
          <button key={programme.id} type="button" aria-pressed={programme.id === active?.id} onClick={() => setSelected(programme.id)}>
            <strong>{programme.title}</strong><span>{programme.note}</span>
          </button>
        ))}
      </div>
      <main className="sis4-programme-results">
        <header><div><small>PROGRAMME</small><h2>{active?.title}</h2></div><p>{active?.note}</p></header>
        <FilmGrid films={active?.films || []} onSelectFilm={onSelectFilm} lang={lang} />
      </main>
    </div>
  );
}

function MoodAndTime({ films, onSelectFilm, lang }) {
  const [minutes, setMinutes] = useState(15);
  const [mood, setMood] = useState('All');
  const moods = [
    ['All', lang === 'hi' ? 'कुछ भी शानदार' : 'Anything great'],
    ['Drama', lang === 'hi' ? 'दिल छू लेने वाला' : 'Move me'],
    ['Comedy', lang === 'hi' ? 'हंसना है' : 'Make me laugh'],
    ['Thriller', lang === 'hi' ? 'बेचैन कर दे' : 'Keep me guessing'],
    ['Horror', lang === 'hi' ? 'डरना है' : 'After dark'],
    ['Documentary', lang === 'hi' ? 'कुछ जानना है' : 'Show me something real']
  ];
  const results = useMemo(() => dedupe(films.filter((film) => {
    const matchesMood = mood === 'All' || genres(film).some((genre) => genre.includes(mood.toLowerCase()));
    return timeBucket(film, minutes) && matchesMood;
  })).slice(0, 30), [films, minutes, mood]);
  const fallback = useMemo(() => dedupe(films.filter((film) => timeBucket(film, minutes))).slice(0, 30), [films, minutes]);
  const visible = results.length ? results : fallback;
  const heroFilm = visible[0] || films[0];
  const rangeLabel = minutes === 5
    ? (lang === 'hi' ? '5 मिनट तक' : 'Up to 5 minutes')
    : (lang === 'hi'
      ? `${minutes === 10 ? '5.1' : minutes === 15 ? '10.1' : minutes === 20 ? '15.1' : '20.1'} से ${minutes} मिनट`
      : `${minutes === 10 ? '5.1' : minutes === 15 ? '10.1' : minutes === 20 ? '15.1' : '20.1'} to ${minutes} minutes`);

  return (
    <div className="sis4-world-content sis4-mood">
      <section className="sis4-world-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(18,12,25,.96), rgba(18,12,25,.58), rgba(18,12,25,.18)), url("${artwork(heroFilm)}")` }}>
        <p>YOUR TIME. OUR TASTE.</p>
        <h1>{lang === 'hi' ? 'मूड और समय' : 'Mood & Time'}</h1>
        <span>{lang === 'hi' ? 'आप बस बताइए अभी कैसा महसूस करना चाहते हैं।' : 'Tell us how much time you have and how you want to feel.'}</span>
      </section>

      <section className="sis4-mood-console">
        <div><small>{lang === 'hi' ? 'कितना समय है?' : 'How much time?'}</small><div className="sis4-choice-row">{[5,10,15,20,30].map((value) => <button key={value} type="button" aria-pressed={minutes === value} onClick={() => setMinutes(value)}>{value}<span>min</span></button>)}</div></div>
        <div><small>{lang === 'hi' ? 'आज कैसा महसूस करना है?' : 'Choose a feeling'}</small><div className="sis4-mood-row">{moods.map(([value,label]) => <button key={value} type="button" aria-pressed={mood === value} onClick={() => setMood(value)}>{label}</button>)}</div></div>
      </section>

      <main className="sis4-programme-results">
        <header><div><small>YOUR PROGRAMME</small><h2>{visible.length} {lang === 'hi' ? 'फ़िल्में आपके लिए' : 'films for right now'}</h2></div><p>{rangeLabel}</p></header>
        <FilmGrid films={visible} onSelectFilm={onSelectFilm} lang={lang} />
      </main>
    </div>
  );
}

export default function DiscoveryWorlds({ world, films = [], onClose, onSelectFilm, lang = 'en' }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', close);
    };
  }, [onClose]);

  const select = (film) => {
    onSelectFilm?.(film);
  };

  return (
    <section className="sis4-world" role="dialog" aria-modal="true">
      <header className="sis4-world-top">
        <button type="button" onClick={onClose} aria-label="Back to home">← <span>{lang === 'hi' ? 'होम' : 'Home'}</span></button>
        <strong>SHORTSinSHORT</strong>
        <button type="button" onClick={onClose} aria-label="Close">×</button>
      </header>
      {world === 'atlas' && <WorldAtlas films={films} onSelectFilm={select} lang={lang} />}
      {world === 'festival' && <FestivalCircuit films={films} onSelectFilm={select} lang={lang} />}
      {world === 'mood' && <MoodAndTime films={films} onSelectFilm={select} lang={lang} />}
    </section>
  );
}
