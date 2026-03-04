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
      <span className="statusbar__item" title={`파일: ${fileName}`}>
        파일: {fileName}
      </span>
      <span className="statusbar__item" title={`상태: ${statusText}`}>
        상태: {statusText}
      </span>
      <span className="statusbar__item" title={message ?? '준비됨'}>
        {message ?? '준비됨'}
      </span>
      <span className="statusbar__item" title={`테마: ${themeMode} → ${resolvedTheme}`}>
        테마: {themeMode} → {resolvedTheme}
      </span>
    </footer>
  )
}
