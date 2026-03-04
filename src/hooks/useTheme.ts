import { useEffect, useState } from 'react'
import { getSavedTheme, getSystemTheme, THEME_STORAGE_KEY } from '../lib/theme'
import type { ThemeMode } from '../types/theme'

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getSavedTheme)
  const resolvedTheme = themeMode === 'system' ? getSystemTheme() : themeMode

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
  }, [resolvedTheme])

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
  }, [themeMode])

  useEffect(() => {
    if (themeMode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      document.documentElement.dataset.theme = getSystemTheme()
    }

    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [themeMode])

  return {
    themeMode,
    resolvedTheme,
    setThemeMode,
  }
}
