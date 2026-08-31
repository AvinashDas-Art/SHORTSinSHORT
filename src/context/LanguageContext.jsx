import { createContext, useContext, useEffect, useState } from 'react'
import { STRINGS } from '../i18n/translations'

const LanguageContext = createContext(null)

const STORAGE_KEY = 'shortsinshort-lang'

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved === 'en' || saved === 'hi' ? saved : 'hi'
    } catch {
      return 'hi'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore storage failures (private browsing, etc.)
    }
  }, [lang])

  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'hi' : 'en'))

  const t = STRINGS[lang]

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
