import { EditorPane } from './components/EditorPane'
import { PreviewPane } from './components/PreviewPane'
import { RecentFiles } from './components/RecentFiles'
import { StatusBar } from './components/StatusBar'
import { Toolbar } from './components/Toolbar'
import { useBeforeUnloadWarning } from './hooks/useBeforeUnloadWarning'
import { useDocumentState } from './hooks/useDocumentState'
import { useRecentFiles } from './hooks/useRecentFiles'
import { useTheme } from './hooks/useTheme'
import { createHtmlDocument } from './lib/export'
import { runtimeFileService } from './services/runtimeFileService'
import type { RecentFileEntry } from './types/recentFile'
import { useState } from 'react'

export function App() {
  const [statusMessage, setStatusMessage] = useState('준비됨')
  const { themeMode, resolvedTheme, setThemeMode } = useTheme()
  const { addRecentFile, recentFiles } = useRecentFiles()
  const {
    createNewDocument,
    currentFile,
    fileName,
    isDirty,
    markdown,
    markSaved,
    openPicker,
    renameFile,
    statusText,
    updateCurrentFile,
    updateMarkdown,
  } = useDocumentState(runtimeFileService)
  useBeforeUnloadWarning(isDirty)

  const handleSave = async () => {
    await runtimeFileService.saveFile({
      content: markdown,
      currentFile,
      mimeType: 'text/markdown;charset=utf-8',
      name: fileName,
    })
    addRecentFile(currentFile ?? { backend: 'browser', name: fileName })
    markSaved()
    setStatusMessage('파일을 저장했습니다.')
  }

  const handleSaveAs = async () => {
    const nextFile = await runtimeFileService.saveFileAs({
      content: markdown,
      currentFile,
      mimeType: 'text/markdown;charset=utf-8',
      name: fileName,
    })

    if (!nextFile) return

    renameFile(nextFile.name)
    updateCurrentFile(nextFile)
    addRecentFile(nextFile)
    markSaved()
    setStatusMessage(`다른 이름으로 저장했습니다: ${nextFile.name}`)
  }

  const handleExportHtml = async () => {
    const html = createHtmlDocument(fileName, markdown)
    await runtimeFileService.saveFileAs({
      content: html,
      currentFile: null,
      mimeType: 'text/html;charset=utf-8',
      name: fileName.replace(/\.md$/i, '') + '.html',
    })
    setStatusMessage('HTML 내보내기를 완료했습니다.')
  }

  const handleExportPdf = () => {
    window.print()
    setStatusMessage('PDF 인쇄/내보내기 창을 열었습니다.')
  }

  const handleOpen = async () => {
    const file = await openPicker()
    if (!file) return

    addRecentFile(file.descriptor)
    setStatusMessage(`파일을 열었습니다: ${file.descriptor.name}`)
  }

  const handleRecentFileSelect = async (file: RecentFileEntry) => {
    const reopened = await runtimeFileService.reopenRecentFile({
      backend: file.backend,
      name: file.name,
      path: file.path,
    })

    if (!reopened) {
      setStatusMessage(
        file.backend === 'browser'
          ? '브라우저 최근 파일은 보안 제한으로 자동 재열기를 지원하지 않습니다.'
          : `최근 파일 재열기에 실패했습니다: ${file.name}`,
      )
      return
    }

    updateCurrentFile(reopened.descriptor)
    renameFile(reopened.descriptor.name)
    updateMarkdown(reopened.content)
    markSaved()
    addRecentFile(reopened.descriptor)
    setStatusMessage(`최근 파일을 다시 열었습니다: ${reopened.descriptor.name}`)
  }

  return (
    <div className="app-shell">
      <Toolbar
        onExportHtml={handleExportHtml}
        onExportPdf={handleExportPdf}
        onNewFile={createNewDocument}
        onOpen={handleOpen}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onThemeChange={setThemeMode}
        themeMode={themeMode}
      />

      <RecentFiles onSelect={handleRecentFileSelect} recentFiles={recentFiles} />

      <main className="workspace">
        <EditorPane markdown={markdown} onChange={updateMarkdown} />
        <PreviewPane markdown={markdown} />
      </main>

      <StatusBar
        fileName={fileName}
        message={statusMessage}
        resolvedTheme={resolvedTheme}
        statusText={statusText}
        themeMode={themeMode}
      />
    </div>
  )
}
