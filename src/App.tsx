import { isTauri } from '@tauri-apps/api/core'
import { openUrl } from '@tauri-apps/plugin-opener'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AboutModal } from './components/AboutModal'
import { DocumentTabs } from './components/DocumentTabs'
import { EditorPane } from './components/EditorPane'
import { PreviewPane } from './components/PreviewPane'
import { StartScreen } from './components/StartScreen'
import { StatusBar } from './components/StatusBar'
import { Toolbar } from './components/Toolbar'
import { useBeforeUnloadWarning } from './hooks/useBeforeUnloadWarning'
import { useDocumentState } from './hooks/useDocumentState'
import { useRecentFiles } from './hooks/useRecentFiles'
import { useTheme } from './hooks/useTheme'
import { type MessageKey, useI18n } from './i18n'
import { createHtmlDocument, createPdfBytesFromElement } from './lib/export'
import { runtimeFileService } from './services/runtimeFileService'
import type { RecentFileEntry } from './types/recentFile'

const UPDATE_FEED_URL = (import.meta.env.VITE_UPDATE_FEED_URL as string | undefined)?.trim()
const START_GUIDE_HIDDEN_KEY = 'edit-md.hide-start-guide'

type UpdateFeed = {
  downloadUrl: string
  notesUrl?: string
  version: string
}

type StatusState = {
  key: MessageKey
  params?: Record<string, string | number | undefined>
}

function compareVersions(a: string, b: string) {
  const parse = (value: string) =>
    value
      .trim()
      .replace(/^v/i, '')
      .split('.')
      .map((segment) => Number.parseInt(segment.replace(/\D.*/, ''), 10) || 0)

  const left = parse(a)
  const right = parse(b)
  const length = Math.max(left.length, right.length)

  for (let index = 0; index < length; index += 1) {
    const diff = (left[index] ?? 0) - (right[index] ?? 0)
    if (diff !== 0) return diff
  }

  return 0
}

export function App() {
  const { t } = useI18n()
  const [statusMessage, setStatusMessage] = useState<StatusState>({ key: 'status.ready' })
  const [allowEditorContextMenu, setAllowEditorContextMenu] = useState(true)
  const [isStartScreen, setIsStartScreen] = useState(true)
  const [hideStartGuide, setHideStartGuide] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(START_GUIDE_HIDDEN_KEY) === '1'
    } catch {
      return false
    }
  })
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [aboutVersion, setAboutVersion] = useState('')
  const dirtyRef = useRef(false)
  const markdownRef = useRef('')
  const isClosingRef = useRef(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const autoUpdateCheckRef = useRef<() => void>(() => {})
  const { themeMode, setThemeMode } = useTheme()
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

  const setStatus = useCallback(
    (key: MessageKey, params?: Record<string, string | number | undefined>) => {
      setStatusMessage({ key, params })
    },
    [],
  )

  const handleStartGuidePreference = useCallback(
    (next: boolean) => {
      setHideStartGuide(next)
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(START_GUIDE_HIDDEN_KEY, next ? '1' : '0')
        } catch {
          // ignore
        }
      }

      setStatus(next ? 'status.startGuide.hidden' : 'status.startGuide.shown')
    },
    [setStatus],
  )

  useBeforeUnloadWarning(anyDirty)
  dirtyRef.current = anyDirty
  markdownRef.current = markdown

  const confirmDiscard = useCallback(
    async (message: string) => {
      if (!isTauri()) {
        return window.confirm(message)
      }

      try {
        const { confirm } = await import('@tauri-apps/plugin-dialog')
        return await confirm(message, {
          title: 'edit-md',
          okLabel: t('dialog.discard'),
          cancelLabel: t('dialog.cancel'),
        })
      } catch {
        return window.confirm(message)
      }
    },
    [t],
  )

  useEffect(() => {
    if (!isTauri()) return

    let unlisten: (() => void) | undefined
    let disposed = false

    void (async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const appWindow = getCurrentWindow()

        const dispose = await appWindow.onCloseRequested(async (event) => {
          if (isClosingRef.current) return
          const hasPendingEditorValue =
            !!editorRef.current && editorRef.current.value !== markdownRef.current
          if (!dirtyRef.current && !hasPendingEditorValue) return

          event.preventDefault()
          const discard = await confirmDiscard(t('dialog.exitConfirm'))
          if (!discard) return

          isClosingRef.current = true
          await appWindow.close()
        })

        if (disposed) {
          dispose()
          return
        }

        unlisten = dispose
      } catch (error) {
        console.error('[App] close-requested listener registration failed', { error })
      }
    })()

    return () => {
      disposed = true
      unlisten?.()
    }
  }, [confirmDiscard, t])

  const handleSave = async () => {
    try {
      if (!currentFile) {
        const nextFile = await runtimeFileService.saveFileAs({
          content: markdown,
          currentFile,
          mimeType: 'text/markdown;charset=utf-8',
          name: fileName,
        })

        if (!nextFile) {
          setStatus('status.save.cancelled')
          return
        }

        renameFile(nextFile.name)
        updateCurrentFile(nextFile)
        addRecentFile(nextFile)
        markSaved()
        setStatus('status.save.doneWithName', { name: nextFile.name })
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
      setStatus('status.save.done')
    } catch (error) {
      console.error('[App] save failed', { currentFile, error })
      setStatus('status.save.failed')
    }
  }

  const handleSaveAs = async () => {
    try {
      const nextFile = await runtimeFileService.saveFileAs({
        content: markdown,
        currentFile,
        mimeType: 'text/markdown;charset=utf-8',
        name: fileName,
      })
      if (!nextFile) {
        setStatus('status.saveAs.cancelled')
        return
      }

      renameFile(nextFile.name)
      updateCurrentFile(nextFile)
      addRecentFile(nextFile)
      markSaved()
      setStatus('status.saveAs.done', { name: nextFile.name })
    } catch (error) {
      console.error('[App] save as failed', { error })
      setStatus('status.saveAs.failed')
    }
  }

  const handleExportHtml = async () => {
    try {
      const html = createHtmlDocument(fileName, markdown)
      const saved = await runtimeFileService.saveFileAs({
        content: html,
        currentFile: null,
        mimeType: 'text/html;charset=utf-8',
        name: fileName.replace(/\.md$/i, '') + '.html',
      })

      if (!saved) {
        setStatus('status.exportHtml.cancelled')
        return
      }

      setStatus('status.exportHtml.done', { name: saved.name })
    } catch (error) {
      console.error('[App] export html failed', { error })
      setStatus('status.exportHtml.failed')
    }
  }

  const handleExportPdf = async () => {
    const previewElement = window.document.querySelector('.preview.markdown-body') as HTMLElement | null
    if (!previewElement) {
      setStatus('status.exportPdf.targetMissing')
      return
    }

    try {
      const pdfContent = await createPdfBytesFromElement(previewElement)
      const saved = await runtimeFileService.saveBinaryFileAs({
        content: pdfContent,
        mimeType: 'application/pdf',
        name: fileName.replace(/\.md$/i, '') + '.pdf',
      })

      if (!saved) {
        setStatus('status.exportPdf.cancelled')
        return
      }

      setStatus('status.exportPdf.done', { name: saved.name })
    } catch (error) {
      console.error('[App] export pdf failed', { error })
      setStatus('status.exportPdf.failed')
    }
  }

  const handleOpen = async () => {
    const file = await openPicker()
    if (!file) return
    setIsStartScreen(false)
    addRecentFile(file.descriptor)
    setStatus('status.open.done', { name: file.descriptor.name })
  }

  const handleRecentFileSelect = async (file: RecentFileEntry) => {
    if (file.backend === 'browser' || !file.path) {
      removeRecentFile(file)
      setStatus('status.recent.invalidRemoved')
      return
    }

    const reopened = await runtimeFileService.reopenRecentFile({
      backend: file.backend,
      name: file.name,
      path: file.path,
    })

    if (!reopened) {
      removeRecentFile(file)
      setStatus('status.recent.reopenFailedRemoved', { name: file.name })
      return
    }

    applyOpenedFile(reopened)
    setIsStartScreen(false)
    addRecentFile(reopened.descriptor)
    setStatus('status.recent.reopened', { name: reopened.descriptor.name })
  }

  const handleNewFile = () => {
    if (isStartScreen) {
      setIsStartScreen(false)
      setStatus('status.new.started')
      return
    }

    createNewDocument()
    setStatus('status.new.created')
  }

  const handleCloseTab = async (tabId: string) => {
    const targetTab = tabs.find((tab) => tab.id === tabId)
    if (!targetTab) return

    const hasPendingEditorValue =
      activeTabId === tabId &&
      !!editorRef.current &&
      editorRef.current.value !== targetTab.markdown

    if (targetTab.isDirty || hasPendingEditorValue) {
      const discard = await confirmDiscard(t('dialog.tabDiscardConfirm', { name: targetTab.fileName }))
      if (!discard) {
        setStatus('status.tabClose.cancelled')
        return
      }
    }

    if (closeTab(tabId)) {
      if (tabs.length === 1) {
        setIsStartScreen(true)
      }
      setStatus('status.tabClose.done')
    } else {
      setStatus('status.tabClose.cancelled')
    }
  }

  const handleCloseCurrentTab = async () => {
    if (isStartScreen) {
      setStatus('status.tabClose.noFile')
      return
    }

    await handleCloseTab(activeTabId)
  }

  const handleExit = async () => {
    if (anyDirty) {
      const discard = await confirmDiscard(t('dialog.exitConfirm'))
      if (!discard) {
        setStatus('status.exit.cancelled')
        return
      }
    }

    if (!isTauri()) {
      window.close()
      return
    }

    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      isClosingRef.current = true
      await getCurrentWindow().close()
    } catch (error) {
      console.error('[App] exit failed', { error })
      const reason = error instanceof Error ? error.message : String(error)
      setStatus('status.exit.failed', { reason })
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
      setStatus(next ? 'status.contextMenu.enabled' : 'status.contextMenu.disabled')
      return next
    })
  }

  const handleOpenExternalUrl = async (url: string) => {
    const tauriRuntime = isTauri()

    try {
      if (tauriRuntime) {
        await openUrl(url)
      } else {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
      setStatus('status.mongTang.opened')
    } catch (error) {
      console.error('[Toolbar] mongTang AI open failed', { error })

      if (!tauriRuntime) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }

      setStatus('status.mongTang.failed')
    }
  }

  const handleOpenMongTangAi = async () => {
    await handleOpenExternalUrl('https://mongtang-ai.vercel.app')
  }

  const getCurrentVersion = async () => {
    if (!isTauri()) {
      return 'dev'
    }

    try {
      const { getVersion } = await import('@tauri-apps/api/app')
      return await getVersion()
    } catch {
      return 'unknown'
    }
  }

  const handleShowVersionInfo = async () => {
    const version = await getCurrentVersion()
    setAboutVersion(version)
    setIsAboutOpen(true)
    setStatus('status.version.current', { version })
  }

  const handleCloseAboutModal = () => {
    setIsAboutOpen(false)
  }

  const handleCheckForUpdates = async () => {
    const currentVersion = await getCurrentVersion()

    if (!UPDATE_FEED_URL) {
      setStatus('status.update.urlMissing', { version: currentVersion })
      return
    }

    try {
      const response = await fetch(UPDATE_FEED_URL, { cache: 'no-store' })
      if (!response.ok) {
        setStatus('status.update.checkFailedCode', { code: response.status })
        return
      }

      const payload = (await response.json()) as Partial<UpdateFeed>
      if (!payload.version || !payload.downloadUrl) {
        setStatus('status.update.invalidFormat')
        return
      }

      if (compareVersions(payload.version, currentVersion) <= 0) {
        setStatus('status.update.latest', { version: currentVersion })
        return
      }

      const goDownload = window.confirm(
        t('dialog.update.newVersionConfirm', {
          version: payload.version,
          currentVersion,
        }),
      )

      if (!goDownload) {
        setStatus('status.update.newVersionAvailable', { version: payload.version })
        return
      }

      if (isTauri()) {
        await openUrl(payload.downloadUrl)
      } else {
        window.open(payload.downloadUrl, '_blank', 'noopener,noreferrer')
      }

      setStatus('status.update.opened', { version: payload.version })
    } catch (error) {
      console.error('[App] update check failed', { error })
      setStatus('status.update.checkFailed')
    }
  }

  autoUpdateCheckRef.current = () => {
    void handleCheckForUpdates()
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      autoUpdateCheckRef.current()
    }, 180_000)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const hasModifier = event.ctrlKey || event.metaKey
      if (!hasModifier) return

      const key = event.key.toLowerCase()

      if (key === 'n') {
        event.preventDefault()
        handleNewFile()
        return
      }

      if (key === 'o') {
        event.preventDefault()
        void handleOpen()
        return
      }

      if (key === 's') {
        event.preventDefault()
        void handleSave()
        return
      }

      if (key === 'w') {
        event.preventDefault()
        void handleCloseCurrentTab()
        return
      }

      if (key === 'q') {
        event.preventDefault()
        void handleExit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTabId, isStartScreen, markdown, fileName, currentFile, tabs])

  const statusBarFileName = isStartScreen ? t('status.startScreen') : fileName
  const statusBarStatusText = isStartScreen
    ? t('status.waiting')
    : statusText === 'modified'
      ? t('status.modified')
      : t('status.saved')
  const statusBarMessage = t(statusMessage.key, statusMessage.params)

  return (
    <div className="app-shell">
      <Toolbar
        allowEditorContextMenu={allowEditorContextMenu}
        onCheckForUpdates={() => {
          void handleCheckForUpdates()
        }}
        onCopy={handleCopy}
        onCut={handleCut}
        onCloseFile={() => {
          void handleCloseCurrentTab()
        }}
        onExit={() => {
          void handleExit()
        }}
        onExportHtml={handleExportHtml}
        onExportPdf={handleExportPdf}
        onNewFile={handleNewFile}
        onOpen={handleOpen}
        onOpenMongTangAi={handleOpenMongTangAi}
        onPaste={handlePaste}
        onRecentFileSelect={handleRecentFileSelect}
        onRedo={handleRedo}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onShowVersionInfo={() => {
          void handleShowVersionInfo()
        }}
        onShowStartGuide={() => {
          handleStartGuidePreference(false)
        }}
        onSelectAll={handleSelectAll}
        onThemeChange={setThemeMode}
        onToggleEditorContextMenu={handleToggleEditorContextMenu}
        onUndo={handleUndo}
        recentFiles={recentFiles}
        themeMode={themeMode}
      />

      {!isStartScreen ? (
        <DocumentTabs
          activeTabId={activeTabId}
          onClose={(tabId) => {
            void handleCloseTab(tabId)
          }}
          onSelect={activateTab}
          tabs={tabs.map((tab) => ({ fileName: tab.fileName, id: tab.id, isDirty: tab.isDirty }))}
        />
      ) : null}

      <main className={`workspace${isStartScreen ? ' workspace--start' : ''}`}>
        {isStartScreen ? (
          <section className="pane preview-pane">
            <div className="pane__header">{t('app.startPaneHeader')}</div>
            <div className="preview">
              <StartScreen hideGuide={hideStartGuide} onHideGuideChange={handleStartGuidePreference} />
            </div>
          </section>
        ) : (
          <>
            <PreviewPane currentFilePath={currentFile?.path ?? null} markdown={markdown} />
            <EditorPane
              allowContextMenu={allowEditorContextMenu}
              markdown={markdown}
              onChange={updateMarkdown}
              textareaRef={editorRef}
            />
          </>
        )}
      </main>

      <AboutModal
        appVersion={aboutVersion}
        isOpen={isAboutOpen}
        onClose={handleCloseAboutModal}
        onOpenExternal={(url) => {
          void handleOpenExternalUrl(url)
        }}
      />
      <StatusBar fileName={statusBarFileName} message={statusBarMessage} statusText={statusBarStatusText} />
    </div>
  )
}
