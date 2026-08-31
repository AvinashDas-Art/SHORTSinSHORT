import { useLanguage } from '../context/LanguageContext'
import { fallbackPosterFor } from '../utils/posterFallback'

export default function Hero({ film, onPlay }) {
  const { lang, t } = useLanguage()

  if (!film) return null

  const title = film.title[lang] || film.title.en
  const description = film.description[lang] || film.description.en
  const isPending = film.youtubeVideoId === 'REPLACE_ME'
  const bgImage = isPending ? fallbackPosterFor(title) : film.thumbnailUrl

  return (
    <section className="relative w-full h-[56vw] max-h-[85vh] min-h-[420px] text-white">
      {/* Background image, with automatic fallback if it 404s */}
      <img
        src={bgImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = fallbackPosterFor(title)
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/10 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end gap-4 px-6 pb-16 sm:px-10 sm:pb-24 lg:px-16">
        <h1 className="max-w-2xl text-3xl font-extrabold leading-tight drop-shadow-lg sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <span className="rounded bg-white/15 px-2 py-1 font-medium backdrop-blur-sm">
            {film.language}
          </span>
          <span className="rounded bg-white/15 px-2 py-1 font-medium backdrop-blur-sm">
            {film.duration}
          </span>
          {film.genre.map((g) => (
            <span
              key={g}
              className="rounded bg-white/15 px-2 py-1 font-medium backdrop-blur-sm"
            >
              {g}
            </span>
          ))}
        </div>

        <p className="max-w-xl text-sm text-gray-200 line-clamp-2 sm:text-base lg:text-lg">
          {description}
        </p>

        <div className="mt-2 flex gap-3">
          <button
            onClick={() => onPlay(film)}
            className="flex items-center gap-2 rounded-md bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 sm:px-8 sm:py-3 sm:text-base"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            {t.playNow}
          </button>
        </div>
      </div>
    </section>
  )
}
