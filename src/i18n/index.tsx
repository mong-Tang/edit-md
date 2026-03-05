import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { messages, type Locale, type MessageKey } from './messages'

const LOCALE_STORAGE_KEY = 'edit-md.locale'

type Params = Record<string, string | number | undefined>

type I18nContextValue = {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (key: MessageKey, params?: Params) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function resolveLocale(value: string | null | undefined): Locale {
  if (!value) return 'ko'
  return value.toLowerCase().startsWith('en') ? 'en' : 'ko'
}

function format(template: string, params?: Params) {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => `${params[key] ?? ''}`)
}

export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return 'ko'

  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (saved) return resolveLocale(saved)
  } catch {
    // ignore
  }

  return resolveLocale(window.navigator.language)
}

export function translate(locale: Locale, key: MessageKey, params?: Params): string {
  const table = messages[locale] ?? messages.ko
  const fallback = messages.ko[key]
  const value = table[key] ?? fallback ?? key
  return format(value, params)
}

export function translateCurrent(key: MessageKey, params?: Params): string {
  return translate(getCurrentLocale(), key, params)
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(() => getCurrentLocale())

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  const t = useCallback(
    (key: MessageKey, params?: Params) => {
      return translate(locale, key, params)
    },
    [locale],
  )

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider.')
  }
  return context
}

export type { Locale, MessageKey } from './messages'
