import { useState, useMemo } from 'react'
import films from './data/films.json'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MovieRow from './components/MovieRow'
import MovieCard from './components/MovieCard'
import VideoModal from './components/VideoModal'
import { useLanguage } from './context/LanguageContext'

export default function App() {
  const { lang, t } = useLanguage()
  const [activeFilm, setActiveFilm] = useState(null)

  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('All')
  const [language, setLanguage] = useState('All')
  const [country, setCountry] = useState('All')

  const isFiltering =
    search.trim() !== '' || genre !== 'All' || language !== 'All' || country !== 'All'

  const resetFilters = () => {
    setSearch('')
    setGenre('All')
    setLanguage('All')
    setCountry('All')
  }

  const filteredFilms = useMemo(() => {
    const q = search.trim().toLowerCase()
    return films.filter((f) => {
      const titleEn = f.title.en.toLowerCase()
      const titleHi = f.title.hi.toLowerCase()
      const descEn = f.description.en.toLowerCase()
      const descHi = f.description.hi.toLowerCase()
      const matchesSearch =
        q === '' ||
        titleEn.includes(q) ||
        titleHi.includes(q) ||
        descEn.includes(q) ||
        descHi.includes(q)
      const matchesGenre = genre === 'All' || f.genre.includes(genre)
      const matchesLanguage = language === 'All' || f.language === language
      const matchesCountry = country === 'All' || f.country === country
      return matchesSearch && matchesGenre && matchesLanguage && matchesCountry
    })
  }, [search, genre, language, country])

  const featuredFilm = useMemo(
    () => films.find((f) => f.isFeatured) || films[0],
    []
  )

  const featuredRow = useMemo(() => films.filter((f) => f.isFeatured), [])

  const globalCinemaRow = useMemo(
    () => [...films].sort((a, b) => b.popularityScore - a.popularityScore),
    []
  )

  const dramaRomanceRow = useMemo(
    () =>
      films.filter(
        (f) => f.genre.includes('Drama') || f.genre.includes('Romance')
      ),
    []
  )

  const thrillerSciFiRow = useMemo(
    () =>
      films.filter(
        (f) => f.genre.includes('Thriller') || f.genre.includes('Sci-Fi')
      ),
    []
  )

  return (
    <div className="min-h-screen bg-black">
      <Navbar
        search={search}
        onSearchChange={setSearch}
        genre={genre}
        onGenreChange={setGenre}
        language={language}
        onLanguageChange={setLanguage}
        country={country}
        onCountryChange={setCountry}
        onReset={resetFilters}
      />

      {isFiltering ? (
        <main className="min-h-screen px-4 pb-16 pt-24 sm:px-10 sm:pt-28 lg:px-16">
          <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">
            {filteredFilms.length > 0
              ? `${t.results} (${filteredFilms.length})`
              : t.results}
          </h2>

          {filteredFilms.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
              <p className="text-lg font-semibold text-gray-300">
                {t.noFilmsFound}
              </p>
              <p className="text-sm text-gray-500">{t.noFilmsHint}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredFilms.map((film) => (
                <MovieCard key={film.id} film={film} onPlay={setActiveFilm} />
              ))}
            </div>
          )}
        </main>
      ) : (
        <>
          <Hero film={featuredFilm} onPlay={setActiveFilm} />

          <main className="relative z-10 -mt-10 space-y-2 pb-16 sm:-mt-16">
            <MovieRow
              title={t.featuredOriginals}
              films={featuredRow}
              onPlay={setActiveFilm}
            />
            <MovieRow
              title={t.globalCinema}
              films={globalCinemaRow}
              onPlay={setActiveFilm}
            />
            <MovieRow
              title={t.dramaRomance}
              films={dramaRomanceRow}
              onPlay={setActiveFilm}
            />
            <MovieRow
              title={t.thrillerSciFi}
              films={thrillerSciFiRow}
              onPlay={setActiveFilm}
            />
          </main>
        </>
      )}

      <VideoModal film={activeFilm} onClose={() => setActiveFilm(null)} />
    </div>
  )
}
