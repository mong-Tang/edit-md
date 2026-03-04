import type { ThemeMode } from '../types/theme'

type ToolbarProps = {
  onExportHtml: () => void
  onExportPdf: () => void
  onNewFile: () => void
  onOpen: () => void
  onSave: () => void
  onSaveAs: () => void
  onThemeChange: (theme: ThemeMode) => void
  themeMode: ThemeMode
}

export function Toolbar({
  onExportHtml,
  onExportPdf,
  onNewFile,
  onOpen,
  onSave,
  onSaveAs,
  onThemeChange,
  themeMode,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar__group">
        <button type="button" onClick={onNewFile}>새 파일</button>
        <button type="button" onClick={onOpen}>열기</button>
        <button type="button" onClick={onSave}>저장</button>
        <button type="button" onClick={onSaveAs}>다른 이름으로 저장</button>
        <button type="button" onClick={onExportHtml}>HTML 내보내기</button>
        <button type="button" onClick={onExportPdf}>PDF 내보내기</button>
      </div>

      <label className="theme-select">
        <span>테마</span>
        <select value={themeMode} onChange={(event) => onThemeChange(event.target.value as ThemeMode)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </label>
    </header>
  )
}
