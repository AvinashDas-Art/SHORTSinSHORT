import { useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function VideoModal({ film, onClose }) {
  const { lang, t } = useLanguage()

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!film) return null

  const title = film.title[lang] || film.title.en
  const description = film.description[lang] || film.description.en
  const isPending = film.youtubeVideoId === 'REPLACE_ME'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl overflow-hidden rounded-lg bg-neutral-900 shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg text-white transition hover:bg-black/80"
        >
          ✕
        </button>

        {/* Player */}
        <div className="aspect-video w-full bg-black">
          {isPending ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black px-4 text-center">
              <svg
                className="h-14 w-14 text-white/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="7" cy="9" r="0.6" fill="currentColor" />
                <circle cx="7" cy="15" r="0.6" fill="currentColor" />
                <circle cx="17" cy="9" r="0.6" fill="currentColor" />
                <circle cx="17" cy="15" r="0.6" fill="currentColor" />
                <path d="M10 9l4.5 3-4.5 3V9z" fill="currentColor" stroke="none" />
              </svg>
              <p className="text-lg font-bold text-white/80">{t.videoComingSoon}</p>
              <p className="max-w-xs text-sm text-gray-400">{t.videoComingSoonHint}</p>
            </div>
          ) : (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${film.youtubeVideoId}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Details */}
        <div className="space-y-3 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            {title}
          </h2>

          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            <span className="rounded bg-neutral-800 px-2 py-1 font-medium text-gray-300">
              {film.country}
            </span>
            <span className="rounded bg-neutral-800 px-2 py-1 font-medium text-gray-300">
              {film.language}
            </span>
            <span className="rounded bg-neutral-800 px-2 py-1 font-medium text-gray-300">
              {film.duration}
            </span>
            {film.genre.map((g) => (
              <span
                key={g}
                className="rounded bg-neutral-800 px-2 py-1 font-medium text-gray-300"
              >
                {g}
              </span>
            ))}
            <span className="rounded bg-neutral-800 px-2 py-1 font-medium text-gray-300">
              ★ {film.popularityScore}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-gray-300 sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
