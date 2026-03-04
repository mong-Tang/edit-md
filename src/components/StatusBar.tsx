import type { ThemeMode } from '../types/theme'

type StatusBarProps = {
  fileName: string
  message?: string
  resolvedTheme: Exclude<ThemeMode, 'system'>
  statusText: string
  themeMode: ThemeMode
}

export function StatusBar({ fileName, message, resolvedTheme, statusText, themeMode }: StatusBarProps) {
  return (
    <footer className="statusbar">
      <span>파일: {fileName}</span>
      <span>상태: {statusText}</span>
      <span>{message ?? '준비됨'}</span>
      <span>테마: {themeMode} → {resolvedTheme}</span>
    </footer>
  )
}
