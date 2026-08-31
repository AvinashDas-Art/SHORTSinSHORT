import { useLanguage } from '../context/LanguageContext'
import { fallbackPosterFor } from '../utils/posterFallback'

export default function MovieCard({ film, onPlay }) {
  const { lang, t } = useLanguage()

  const title = film.title[lang] || film.title.en
  const description = film.description[lang] || film.description.en
  const isPending = film.youtubeVideoId === 'REPLACE_ME'

  return (
    <button
      onClick={() => onPlay(film)}
      className="group w-56 shrink-0 text-left focus:outline-none sm:w-64"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-lg bg-neutral-800">
        <img
          src={isPending ? fallbackPosterFor(title) : film.thumbnailUrl}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = fallbackPosterFor(title)
          }}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
          <svg
            className="h-10 w-10 text-white drop-shadow-lg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {isPending && (
          <span className="absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/70">
            {t.comingSoon}
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-2 space-y-1">
        <h3 className="truncate text-sm font-bold text-white sm:text-base">
          {title}
        </h3>

        <div className="flex flex-wrap gap-1.5">
          <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-300">
            {film.country}
          </span>
          <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-300">
            {film.language}
          </span>
          <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-300">
            {film.duration}
          </span>
        </div>

        <p className="line-clamp-2 text-xs text-gray-400">
          {description}
        </p>
      </div>
    </button>
  )
}
