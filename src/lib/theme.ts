import type { ThemeMode } from '../types/theme'

export const THEME_STORAGE_KEY = 'edit-md-theme'

export function getSystemTheme(): Exclude<ThemeMode, 'system'> {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getSavedTheme(): ThemeMode {
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system'
}
