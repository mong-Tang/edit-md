import { isTauri } from '@tauri-apps/api/core'
import { openUrl } from '@tauri-apps/plugin-opener'
import { DocumentTabs } from './components/DocumentTabs'
import { EditorPane } from './components/EditorPane'
import { PreviewPane } from './components/PreviewPane'
import { StatusBar } from './components/StatusBar'
import { Toolbar } from './components/Toolbar'
import { useBeforeUnloadWarning } from './hooks/useBeforeUnloadWarning'
import { useDocumentState } from './hooks/useDocumentState'
import { useRecentFiles } from './hooks/useRecentFiles'
import { useTheme } from './hooks/useTheme'
import { createHtmlDocument } from './lib/export'
import { runtimeFileService } from './services/runtimeFileService'
import type { RecentFileEntry } from './types/recentFile'
import { useRef, useState } from 'react'

export function App() {
  const [statusMessage, setStatusMessage] = useState('준비됨')
  const [allowEditorContextMenu, setAllowEditorContextMenu] = useState(true)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const { themeMode, resolvedTheme, setThemeMode } = useTheme()
  const { addRecentFile, recentFiles, removeRecentFile } = useRecentFiles()
  const {
    activeTabId,
    activateTab,
    anyDirty,
    applyOpenedFile,
    closeTab,
    createNewDocument,
    currentFile,
    fileName,
    markdown,
    markSaved,
    openPicker,
    renameFile,
    statusText,
    tabs,
    updateCurrentFile,
    updateMarkdown,
  } = useDocumentState(runtimeFileService)

  useBeforeUnloadWarning(anyDirty)

  const handleSave = async () => {
    if (!currentFile) {
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
      setStatusMessage(`파일을 저장했습니다: ${nextFile.name}`)
      return
    }

    await runtimeFileService.saveFile({
      content: markdown,
      currentFile,
      mimeType: 'text/markdown;charset=utf-8',
      name: fileName,
    })
    addRecentFile(currentFile)
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
    if (file.backend === 'browser' || !file.path) {
      removeRecentFile(file)
      setStatusMessage('열 수 없는 최근 파일 항목을 목록에서 제거했습니다.')
      return
    }

    const reopened = await runtimeFileService.reopenRecentFile({
      backend: file.backend,
      name: file.name,
      path: file.path,
    })

    if (!reopened) {
      setStatusMessage(`최근 파일 열기에 실패했습니다: ${file.name}`)
      return
    }

    applyOpenedFile(reopened)
    addRecentFile(reopened.descriptor)
    setStatusMessage(`최근 파일을 다시 열었습니다: ${reopened.descriptor.name}`)
  }

  const handleCloseTab = (tabId: string) => {
    if (closeTab(tabId)) {
      setStatusMessage('탭을 닫았습니다.')
    }
  }

  const focusEditor = () => {
    editorRef.current?.focus()
    return editorRef.current
  }

  const runEditorCommand = (command: 'copy' | 'cut' | 'paste' | 'redo' | 'undo') => {
    focusEditor()
    document.execCommand(command)
  }

  const handleUndo = () => runEditorCommand('undo')
  const handleRedo = () => runEditorCommand('redo')
  const handleCut = () => runEditorCommand('cut')
  const handleCopy = () => runEditorCommand('copy')
  const handlePaste = () => runEditorCommand('paste')

  const handleSelectAll = () => {
    const editor = focusEditor()
    editor?.select()
  }

  const handleToggleEditorContextMenu = () => {
    setAllowEditorContextMenu((current) => {
      const next = !current
      setStatusMessage(
        next
          ? '편집창 우클릭 메뉴를 활성화했습니다.'
          : '편집창 우클릭 메뉴를 비활성화했습니다. 편집 메뉴는 계속 사용할 수 있습니다.',
      )
      return next
    })
  }

  const handleOpenMongTangAi = async () => {
    const url = 'https://mongtang-ai.vercel.app'
    try {
      if (isTauri()) {
        await openUrl(url)
      } else {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
      setStatusMessage('mongTang AI 링크를 열었습니다.')
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer')
      setStatusMessage('mongTang AI 링크를 브라우저로 열었습니다.')
    }
  }

  return (
    <div className="app-shell">
      <Toolbar
        allowEditorContextMenu={allowEditorContextMenu}
        onOpenMongTangAi={handleOpenMongTangAi}
        onCopy={handleCopy}
        onCut={handleCut}
        onExportHtml={handleExportHtml}
        onExportPdf={handleExportPdf}
        onNewFile={createNewDocument}
        onOpen={handleOpen}
        onPaste={handlePaste}
        onRecentFileSelect={handleRecentFileSelect}
        onRedo={handleRedo}
        recentFiles={recentFiles}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onSelectAll={handleSelectAll}
        onToggleEditorContextMenu={handleToggleEditorContextMenu}
        onThemeChange={setThemeMode}
        onUndo={handleUndo}
        themeMode={themeMode}
      />

      <DocumentTabs
        activeTabId={activeTabId}
        onClose={handleCloseTab}
        onSelect={activateTab}
        tabs={tabs.map((tab) => ({ fileName: tab.fileName, id: tab.id, isDirty: tab.isDirty }))}
      />

      <main className="workspace">
        <PreviewPane markdown={markdown} />
        <EditorPane
          allowContextMenu={allowEditorContextMenu}
          markdown={markdown}
          onChange={updateMarkdown}
          textareaRef={editorRef}
        />
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
