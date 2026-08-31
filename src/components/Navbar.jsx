import { useLanguage } from '../context/LanguageContext'
import { GENRES, LANGUAGES, COUNTRIES } from '../i18n/translations'

export default function Navbar({
  search,
  onSearchChange,
  genre,
  onGenreChange,
  language,
  onLanguageChange,
  country,
  onCountryChange,
  onReset,
}) {
  const { lang, toggleLang, t } = useLanguage()

  const selectClass =
    'rounded-md border border-white/10 bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-gray-200 focus:border-red-600 focus:outline-none sm:text-sm'

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-black via-black/80 to-transparent px-4 py-3 sm:px-10 lg:px-16">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Logo + Search */}
        <div className="flex items-center gap-4">
          <h1 className="shrink-0 text-xl sm:text-2xl">
            <span className="font-black tracking-wider text-[#E50914]">{t.siteName}</span>
            <span className="font-bold tracking-tight text-white">{t.siteNameSuffix}</span>
          </h1>

          <div className="relative w-40 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-md border border-white/10 bg-neutral-900/90 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-red-600 focus:outline-none sm:text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={genre}
            onChange={(e) => onGenreChange(e.target.value)}
            className={selectClass}
          >
            {GENRES.map((g) => (
              <option key={g.key} value={g.key}>
                {g.key === 'All' ? `${t.genreLabel}: ${g[lang]}` : g[lang]}
              </option>
            ))}
          </select>

          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className={selectClass}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l === 'All' ? `${t.languageLabel}: All` : l}
              </option>
            ))}
          </select>

          <select
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className={selectClass}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? `${t.countryLabel}: All` : c}
              </option>
            ))}
          </select>

          <button
            onClick={onReset}
            className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 sm:text-sm"
          >
            {t.resetFilters}
          </button>

          {/* En | Hi language switcher */}
          <button
            onClick={toggleLang}
            aria-label="Toggle language"
            className="flex items-center gap-1 rounded-md border border-white/10 bg-neutral-900 px-2.5 py-1.5 text-xs font-bold text-white sm:text-sm"
          >
            <span className={lang === 'en' ? 'text-red-500' : 'text-gray-500'}>En</span>
            <span className="text-gray-600">|</span>
            <span className={lang === 'hi' ? 'text-red-500' : 'text-gray-500'}>Hi</span>
          </button>
        </div>
      </div>
    </header>
  )
}
