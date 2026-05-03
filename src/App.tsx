import { isTauri } from '@tauri-apps/api/core'
import { openUrl } from '@tauri-apps/plugin-opener'
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { DocumentTabs } from './components/DocumentTabs'
import { EditorPane } from './components/EditorPane'
import { StartScreen } from './components/StartScreen'
import { StatusBar } from './components/StatusBar'
import { Toolbar } from './components/Toolbar'
import { ContextMenu } from './components/ContextMenu'
import { useBeforeUnloadWarning } from './hooks/useBeforeUnloadWarning'
import { useDocumentState } from './hooks/useDocumentState'
import { useRecentFiles } from './hooks/useRecentFiles'
import { useTheme } from './hooks/useTheme'
import { type MessageKey, useI18n } from './i18n'
import { runtimeFileService } from './services/runtimeFileService'
import type { RecentFileEntry } from './types/recentFile'

const AboutModal = lazy(async () => {
  const module = await import('./components/AboutModal')
  return { default: module.AboutModal }
})

const PreviewPane = lazy(async () => {
  const module = await import('./components/PreviewPane')
  return { default: module.PreviewPane }
})

const DEFAULT_UPDATE_FEED_URL = 'https://raw.githubusercontent.com/mong-Tang/edit-md/main/update.json'
const UPDATE_FEED_URL =
  (import.meta.env.VITE_UPDATE_FEED_URL as string | undefined)?.trim() || DEFAULT_UPDATE_FEED_URL
const START_GUIDE_HIDDEN_KEY = 'edit-md.hide-start-guide'
const INDENT_SIZE_KEY = 'edit-md.indent-size'
const OPEN_FILES_EVENT = 'app://open-files'
const DEFAULT_INDENT_SIZE: 2 | 4 | 8 = 2

type UpdateFeed = {
  downloadUrl: string
  notesUrl?: string
  version: string
}

type StatusState = {
  key: MessageKey
  params?: Record<string, string | number | undefined>
}

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n/g, '\n')
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
  const isDesktopRuntime = isTauri()
  const [statusMessage, setStatusMessage] = useState<StatusState>({ key: 'status.ready' })
  const [allowEditorContextMenu, setAllowEditorContextMenu] = useState(true)
  const [isStartScreen, setIsStartScreen] = useState(true)
  const [hideStartGuide, setHideStartGuide] = useState<boolean>(() => {
    if (isTauri()) return false
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(START_GUIDE_HIDDEN_KEY) === '1'
    } catch {
      return false
    }
  })
  const [indentSize, setIndentSize] = useState<2 | 4 | 8>(() => {
    if (typeof window === 'undefined') return DEFAULT_INDENT_SIZE
    try {
      const raw = Number.parseInt(window.localStorage.getItem(INDENT_SIZE_KEY) ?? '', 10)
      if (raw === 2 || raw === 4 || raw === 8) return raw
      return DEFAULT_INDENT_SIZE
    } catch {
      return DEFAULT_INDENT_SIZE
    }
  })
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false)
  const [aboutCustomLines, setAboutCustomLines] = useState<string[] | null>(null)
  const [aboutCustomTitle, setAboutCustomTitle] = useState<string | null>(null)
  const [aboutPrimaryActionLabel, setAboutPrimaryActionLabel] = useState<string | null>(null)
  const [aboutPrimaryActionUrl, setAboutPrimaryActionUrl] = useState<string | null>(null)
  const [aboutVersion, setAboutVersion] = useState('')
  const dirtyRef = useRef(false)
  const markdownRef = useRef('')
  const isClosingRef = useRef(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const autoUpdateCheckRef = useRef<() => void>(() => {})
  const { themeMode, setThemeMode } = useTheme()
  const { addRecentFile, recentFiles, removeRecentFile } = useRecentFiles()
  const {
    activeTabId,
    activateTab,
    anyDirty,
    applyOpenedFile,
    canRedo,
    canUndo,
    closeTab,
    createNewDocument,
    currentFile,
    fileName,
    markdown,
    markSaved,
    openPicker,
    redo,
    renameFile,
    statusText,
    tabs,
    undo,
    updateCurrentFile,
    updateMarkdown,
  } = useDocumentState(runtimeFileService)

  const setStatus = useCallback(
    (key: MessageKey, params?: Record<string, string | number | undefined>) => {
      setStatusMessage({ key, params })
    },
    [],
  )

  const [hasSelection, setHasSelection] = useState(false)
  const [canPaste, setCanPaste] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const checkClipboard = useCallback(async () => {
    // 브라우저 환경에서는 사전 읽기 시 보안 팝업이 뜨므로 항상 true로 설정하여 팝업을 방지합니다.
    if (typeof window !== 'undefined' && !isTauri()) {
      setCanPaste(true)
      return
    }

    try {
      const text = await navigator.clipboard.readText()
      setCanPaste(text.length > 0)
    } catch {
      setCanPaste(true)
    }
  }, [])

  const handleGlobalContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    if (isTauri()) {
      // 데스크톱 앱에서는 클립보드 체크 후 메뉴 표시
      void checkClipboard().then(() => {
        setContextMenu({ x: e.clientX, y: e.clientY })
      })
    } else {
      // 브라우저에서는 체크 없이 즉시 메뉴 표시 (팝업 방지)
      setCanPaste(true)
      setContextMenu({ x: e.clientX, y: e.clientY })
    }
  }, [checkClipboard])

  const handleUndo = useCallback(() => {
    undo()
  }, [undo])

  const handleRedo = useCallback(() => {
    redo()
  }, [redo])

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
    [isDesktopRuntime, setStatus],
  )

  const handleIndentSizeChange = useCallback(
    (next: 2 | 4 | 8) => {
      setIndentSize(next)
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(INDENT_SIZE_KEY, String(next))
        } catch {
          // ignore
        }
      }
      setStatus('status.indentSize.changed', { size: next })
    },
    [setStatus],
  )

  useBeforeUnloadWarning(anyDirty)
  dirtyRef.current = anyDirty
  markdownRef.current = markdown

  const hasPendingEditorValue = useCallback((baseline?: string) => {
    if (!editorRef.current) return false
    const currentValue = normalizeLineEndings(editorRef.current.value)
    const compareBaseline = normalizeLineEndings(baseline ?? markdownRef.current)
    return currentValue !== compareBaseline
  }, [])

  const confirmDiscard = useCallback(
    async (message: string) => {
      if (isTauri()) {
        try {
          const { confirm } = await import('@tauri-apps/plugin-dialog')
          return await confirm(message, {
            title: 'HanaDoc',
            kind: 'warning',
            okLabel: t('dialog.discard'),
            cancelLabel: t('dialog.cancel'),
          })
        } catch (error) {
          console.error('[App] Native dialog failed, falling back to window.confirm', error)
          return window.confirm(message)
        }
      }
      return window.confirm(message)
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
          const pendingEditorChange = hasPendingEditorValue()
          if (!dirtyRef.current && !pendingEditorChange) return

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
  }, [confirmDiscard, hasPendingEditorValue, t])

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
      const { createHtmlDocument } = await import('./lib/export')
      const html = await createHtmlDocument(fileName, markdown)
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

  const handleOpen = async () => {
    const file = await openPicker()
    if (!file) return
    setIsStartScreen(false)
    addRecentFile(file.descriptor)
    setStatus('status.open.done', { name: file.descriptor.name })
  }

  const handleOpenPath = useCallback(
    async (path: string) => {
      if (!isTauri() || !path) return false

      try {
        const { tauriOpenMarkdownPath } = await import('./services/tauriApi')
        const opened = await tauriOpenMarkdownPath(path)
        if (!opened) return false

        applyOpenedFile(opened)
        setIsStartScreen(false)
        addRecentFile(opened.descriptor)
        setStatus('status.open.done', { name: opened.descriptor.name })
        return true
      } catch (error) {
        console.error('[App] open by path failed', { path, error })
        return false
      }
    },
    [addRecentFile, applyOpenedFile, setStatus],
  )

  useEffect(() => {
    if (!isTauri()) return

    let unlisten: (() => void) | undefined
    let disposed = false

    void (async () => {
      try {
        const [{ invoke }, { listen }] = await Promise.all([
          import('@tauri-apps/api/core'),
          import('@tauri-apps/api/event'),
        ])

        const openRequestedPaths = async (incomingPaths: string[] = []) => {
          const pendingPaths = await invoke<string[]>('take_pending_open_files')
          const merged = [...incomingPaths, ...(pendingPaths ?? [])]
          const uniquePaths = [...new Set(merged.filter((path) => typeof path === 'string' && path.length > 0))]

          for (const path of uniquePaths) {
            await handleOpenPath(path)
          }
        }

        const dispose = await listen<{ paths?: string[] }>(OPEN_FILES_EVENT, (event) => {
          void openRequestedPaths(event.payload?.paths ?? [])
        })

        if (disposed) {
          dispose()
          return
        }

        unlisten = dispose
        await openRequestedPaths()
      } catch (error) {
        console.error('[App] open-files listener registration failed', { error })
      }
    })()

    return () => {
      disposed = true
      unlisten?.()
    }
  }, [handleOpenPath])

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
    setIsNewFileModalOpen(true)
  }

  const handleCreateNewFile = (mode: 'blank' | 'template') => {
    const templateContent = t('template.newFile.guide')
    setIsNewFileModalOpen(false)

    if (isStartScreen) {
      setIsStartScreen(false)
      if (mode === 'template') {
        updateMarkdown(templateContent)
        markSaved()
        setStatus('status.new.templateLoaded')
        return
      }
      updateMarkdown('')
      markSaved()
      setStatus('status.new.started')
      return
    }

    if (mode === 'template') {
      createNewDocument({ markdown: templateContent })
      setStatus('status.new.templateCreated')
      return
    }

    createNewDocument({ markdown: '' })
    setStatus('status.new.created')
  }

  const handleCloseTab = async (tabId: string) => {
    const targetTab = tabs.find((tab) => tab.id === tabId)
    if (!targetTab) return

    const pendingEditorChange = activeTabId === tabId && hasPendingEditorValue(targetTab.markdown)

    const isTabDirty = targetTab.isDirty || pendingEditorChange
    
    if (isTabDirty) {
      const message = t('dialog.tabDiscardConfirm', { name: targetTab.fileName })
      const discard = await confirmDiscard(message)
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
    const hasUnsaved = anyDirty || hasPendingEditorValue()
    if (hasUnsaved) {
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
    setAboutCustomTitle(null)
    setAboutCustomLines(null)
    setAboutPrimaryActionLabel(null)
    setAboutPrimaryActionUrl(null)
    setAboutVersion(version)
    setIsAboutOpen(true)
    setStatus('status.version.current', { version })
  }

  const handleCloseAboutModal = () => {
    setIsAboutOpen(false)
    setAboutCustomTitle(null)
    setAboutCustomLines(null)
    setAboutPrimaryActionLabel(null)
    setAboutPrimaryActionUrl(null)
  }

  const openUpdateResultModal = useCallback(
    (lines: string[], options?: { actionLabel?: string; actionUrl?: string }) => {
      setAboutCustomTitle(t('update.modal.title'))
      setAboutCustomLines(lines)
      setAboutPrimaryActionLabel(options?.actionLabel ?? null)
      setAboutPrimaryActionUrl(options?.actionUrl ?? null)
      setIsAboutOpen(true)
    },
    [t],
  )

  const handleCheckForUpdates = async (interactive = false) => {
    const currentVersion = await getCurrentVersion()
    if (!interactive) {
      setStatus('status.update.checking')
    }

    if (!UPDATE_FEED_URL) {
      if (interactive) {
        openUpdateResultModal([t('status.update.urlMissing', { version: currentVersion })])
      } else {
        setStatus('status.update.urlMissing', { version: currentVersion })
      }
      return
    }

    try {
      const response = await fetch(UPDATE_FEED_URL, { cache: 'no-store' })
      if (!response.ok) {
        if (interactive) {
          openUpdateResultModal([t('status.update.checkFailedCode', { code: response.status })])
        } else {
          setStatus('status.update.checkFailedCode', { code: response.status })
        }
        return
      }

      const payload = (await response.json()) as Partial<UpdateFeed>
      if (!payload.version || !payload.downloadUrl) {
        if (interactive) {
          openUpdateResultModal([t('status.update.invalidFormat')])
        } else {
          setStatus('status.update.invalidFormat')
        }
        return
      }

      if (compareVersions(payload.version, currentVersion) <= 0) {
        if (interactive) {
          openUpdateResultModal([t('status.update.latest', { version: currentVersion })])
        } else {
          setStatus('status.update.latest', { version: currentVersion })
        }
        return
      }

      if (interactive) {
        openUpdateResultModal(
          [
            t('status.update.newVersionAvailable', { version: payload.version }),
            t('status.version.current', { version: currentVersion }),
          ],
          {
            actionLabel: t('update.modal.openDownload'),
            actionUrl: payload.downloadUrl,
          },
        )
      } else {
        setStatus('status.update.newVersionAvailable', { version: payload.version })
      }
    } catch (error) {
      console.error('[App] update check failed', { error })
      if (interactive) {
        openUpdateResultModal([t('status.update.checkFailed')])
      } else {
        setStatus('status.update.checkFailed')
      }
    }
  }

  autoUpdateCheckRef.current = () => {
    void handleCheckForUpdates(false)
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

      if (key === 'p') {
        event.preventDefault()
        event.stopPropagation()
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

  useEffect(() => {
    if (isStartScreen) return

    let cleanup: (() => void) | null = null
    let isSyncing = false
    let syncTimeout: number | null = null

    const attachScrollListeners = () => {
      const editor = editorRef.current
      const preview = previewRef.current

      if (!editor || !preview) return null

      const handleEditorScroll = () => {
        if (isSyncing) return
        isSyncing = true
        
        const editorMax = editor.scrollHeight - editor.clientHeight
        const previewMax = preview.scrollHeight - preview.clientHeight
        
        if (editorMax > 0 && previewMax > 0) {
          const ratio = editor.scrollTop / editorMax
          preview.scrollTop = ratio * previewMax
        }

        if (syncTimeout) window.clearTimeout(syncTimeout)
        syncTimeout = window.setTimeout(() => { isSyncing = false }, 50)
      }

      const handlePreviewScroll = () => {
        if (isSyncing) return
        isSyncing = true

        const editorMax = editor.scrollHeight - editor.clientHeight
        const previewMax = preview.scrollHeight - preview.clientHeight
        
        if (editorMax > 0 && previewMax > 0) {
          const ratio = preview.scrollTop / previewMax
          editor.scrollTop = ratio * editorMax
        }

        if (syncTimeout) window.clearTimeout(syncTimeout)
        syncTimeout = window.setTimeout(() => { isSyncing = false }, 50)
      }

      editor.addEventListener('scroll', handleEditorScroll, { passive: true })
      preview.addEventListener('scroll', handlePreviewScroll, { passive: true })

      return () => {
        editor.removeEventListener('scroll', handleEditorScroll)
        preview.removeEventListener('scroll', handlePreviewScroll)
        if (syncTimeout) window.clearTimeout(syncTimeout)
      }
    }

    // 레이지 로딩 대응을 위해 요소가 준비될 때까지 폴링
    const pollTimer = setInterval(() => {
      if (cleanup) return
      cleanup = attachScrollListeners()
      if (cleanup) clearInterval(pollTimer)
    }, 100)

    return () => {
      clearInterval(pollTimer)
      if (cleanup) cleanup()
    }
  }, [isStartScreen, markdown, activeTabId])

  const statusBarFileName = isStartScreen ? t('status.startScreen') : fileName
  const statusBarStatusText = isStartScreen
    ? t('status.waiting')
    : statusText === 'modified'
      ? t('status.modified')
      : t('status.saved')
  const statusBarMessage = t(statusMessage.key, statusMessage.params)

  return (
    <div className="app-shell" onContextMenu={handleGlobalContextMenu}>
      <Toolbar
        allowEditorContextMenu={allowEditorContextMenu}
        canRedo={canRedo}
        canUndo={canUndo}
        hasOpenFiles={tabs.length > 0 && !isStartScreen}
        indentSize={indentSize}
        onCheckForUpdates={() => {
          void handleCheckForUpdates(true)
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
          handleStartGuidePreference(!hideStartGuide)
        }}
        onIndentSizeChange={handleIndentSizeChange}
        onSelectAll={handleSelectAll}
        onThemeChange={setThemeMode}
        onToggleEditorContextMenu={handleToggleEditorContextMenu}
        onUndo={handleUndo}
        recentFiles={recentFiles}
        hideStartGuide={hideStartGuide}
        hasSelection={hasSelection}
        canPaste={canPaste}
        themeMode={themeMode}
      />

      <DocumentTabs
        activeTabId={isStartScreen ? 'none' : activeTabId}
        onClose={(tabId) => {
          void handleCloseTab(tabId)
        }}
        onSelect={(tabId) => {
          if (tabId !== 'none') activateTab(tabId)
        }}
        tabs={
          isStartScreen
            ? [{ fileName: t('tab.noFile'), id: 'none', isDirty: false, isCloseable: false }]
            : tabs.map((tab) => ({
                fileName: tab.fileName,
                id: tab.id,
                isDirty: tab.isDirty,
                isCloseable: true,
              }))
        }
      />

      <main className={`workspace${isStartScreen ? ' workspace--start' : ''}`}>
        {isStartScreen ? (
          <section className="pane preview-pane">
            <div className="pane__header">{t('app.startPaneHeader')}</div>
            <div className="preview">
              <StartScreen
                canHideGuide={true}
                hideGuide={hideStartGuide}
                onHideGuideChange={handleStartGuidePreference}
              />
            </div>
          </section>
        ) : (
          <>
            <Suspense
              fallback={
                <section className="pane preview-pane">
                  <div className="pane__header">{t('preview.header')}</div>
                  <div className="preview" />
                </section>
              }
            >
              <PreviewPane currentFilePath={currentFile?.path ?? null} markdown={markdown} previewRef={previewRef} />
            </Suspense>
            <EditorPane
              allowContextMenu={allowEditorContextMenu}
              indentSize={indentSize}
              markdown={markdown}
              onChange={updateMarkdown}
              onSelectionChange={setHasSelection}
              textareaRef={editorRef}
            />
          </>
        )}
      </main>

      <Suspense fallback={null}>
        <AboutModal
          appVersion={aboutVersion}
          customLines={aboutCustomLines}
          customTitle={aboutCustomTitle}
          isOpen={isAboutOpen}
          onClose={handleCloseAboutModal}
          onOpenExternal={(url) => {
            void handleOpenExternalUrl(url)
          }}
          onPrimaryAction={
            aboutPrimaryActionUrl
              ? () => {
                  if (isTauri()) {
                    void openUrl(aboutPrimaryActionUrl)
                  } else {
                    window.open(aboutPrimaryActionUrl, '_blank', 'noopener,noreferrer')
                  }
                }
              : null
          }
          primaryActionLabel={aboutPrimaryActionLabel}
        />
      </Suspense>
      {isNewFileModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="newfile-modal" role="dialog" aria-modal="true" aria-label={t('newFileModal.title')}>
            <h2 className="newfile-modal__title">{t('newFileModal.title')}</h2>
            <p className="newfile-modal__desc">{t('newFileModal.description')}</p>
            <div className="newfile-modal__actions">
              <button
                type="button"
                className="newfile-modal__button"
                onClick={() => {
                  handleCreateNewFile('blank')
                }}
              >
                {t('newFileModal.blank')}
              </button>
              <button
                type="button"
                className="newfile-modal__button newfile-modal__button--primary"
                onClick={() => {
                  handleCreateNewFile('template')
                }}
              >
                {t('newFileModal.template')}
              </button>
              <button
                type="button"
                className="newfile-modal__button"
                onClick={() => {
                  setIsNewFileModalOpen(false)
                }}
              >
                {t('newFileModal.cancel')}
              </button>
            </div>
          </section>
        </div>
      ) : null}
      <StatusBar
        fileName={statusBarFileName}
        message={statusBarMessage}
        statusText={statusBarStatusText}
        onOpenMongTangAi={handleOpenMongTangAi}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          canRedo={canRedo}
          canUndo={canUndo}
          hasOpenFiles={tabs.length > 0}
          onClose={() => setContextMenu(null)}
          onCopy={handleCopy}
          onCut={handleCut}
          onPaste={handlePaste}
          onRedo={handleRedo}
          onSelectAll={handleSelectAll}
          onUndo={handleUndo}
          hasSelection={hasSelection}
          canPaste={canPaste}
        />
      )}
    </div>
  )
}
