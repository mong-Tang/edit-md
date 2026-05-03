import { useMemo, useState } from 'react'
import type { FileService } from '../services/fileService'
import type { FileDescriptor, OpenedFile } from '../types/file'

const SAMPLE_NAME = 'untitled.md'
const INITIAL_MARKDOWN = ''

type DocumentTab = {
  id: string
  currentFile: FileDescriptor | null
  fileName: string
  isDirty: boolean
  markdown: string
  savedMarkdown: string
  history: string[]
  currentIndex: number
}

function createTab(overrides?: Partial<DocumentTab>): DocumentTab {
  const initialMarkdown = overrides?.markdown ?? INITIAL_MARKDOWN
  return {
    id: `tab-${crypto.randomUUID()}`,
    currentFile: null,
    fileName: SAMPLE_NAME,
    isDirty: false,
    markdown: initialMarkdown,
    savedMarkdown: initialMarkdown,
    history: [initialMarkdown],
    currentIndex: 0,
    ...overrides,
  }
}

function isSameFile(a: FileDescriptor | null | undefined, b: FileDescriptor | null | undefined) {
  return !!a && !!b && a.backend === b.backend && a.name === b.name && a.path === b.path
}

function isPristineUntitledTab(tab: DocumentTab) {
  return (
    !tab.currentFile &&
    !tab.isDirty &&
    tab.fileName === SAMPLE_NAME &&
    tab.markdown.trim().length === 0
  )
}

const MAX_HISTORY = 100

export function useDocumentState(fileService: FileService) {
  const [tabs, setTabs] = useState<DocumentTab[]>([createTab()])
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0].id)

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0],
    [activeTabId, tabs],
  )

  const anyDirty = useMemo(() => tabs.some((tab) => tab.isDirty), [tabs])
  const statusText = useMemo(() => (activeTab?.isDirty ? 'modified' : 'saved'), [activeTab])

  const canUndo = activeTab.currentIndex > 0
  const canRedo = activeTab.currentIndex < activeTab.history.length - 1

  const setActiveTabPatch = (patch: Partial<DocumentTab>) => {
    if (!activeTab) return
    setTabs((current) => current.map((tab) => (tab.id === activeTab.id ? { ...tab, ...patch } : tab)))
  }

  const openOrActivateTab = (file: OpenedFile) => {
    const existing = tabs.find((tab) => isSameFile(tab.currentFile, file.descriptor))
    if (existing) {
      setTabs((current) =>
        current.map((tab) =>
          tab.id === existing.id
            ? {
                ...tab,
                currentFile: file.descriptor,
                fileName: file.descriptor.name,
                isDirty: false,
                markdown: file.content,
                savedMarkdown: file.content,
                history: [file.content],
                currentIndex: 0,
              }
            : tab,
        ),
      )
      setActiveTabId(existing.id)
      return existing.id
    }

    if (activeTab && isPristineUntitledTab(activeTab)) {
      setTabs((current) =>
        current.map((tab) =>
          tab.id === activeTab.id
            ? {
                ...tab,
                currentFile: file.descriptor,
                fileName: file.descriptor.name,
                isDirty: false,
                markdown: file.content,
                savedMarkdown: file.content,
                history: [file.content],
                currentIndex: 0,
              }
            : tab,
        ),
      )
      setActiveTabId(activeTab.id)
      return activeTab.id
    }

    const nextTab = createTab({
      currentFile: file.descriptor,
      fileName: file.descriptor.name,
      isDirty: false,
      markdown: file.content,
      savedMarkdown: file.content,
      history: [file.content],
      currentIndex: 0,
    })

    setTabs((current) => [...current, nextTab])
    setActiveTabId(nextTab.id)
    return nextTab.id
  }

  const applyOpenedFile = (file: OpenedFile) => {
    openOrActivateTab(file)
  }

  const updateMarkdown = (value: string) => {
    if (!activeTab) return
    setTabs((current) =>
      current.map((tab) => {
        if (tab.id !== activeTab.id) return tab

        // 히스토리 관리 (단순화를 위해 매번 저장하되, 이전과 다를 때만 저장)
        let nextHistory = tab.history.slice(0, tab.currentIndex + 1)
        let nextIndex = tab.currentIndex

        if (nextHistory[nextIndex] !== value) {
          nextHistory.push(value)
          if (nextHistory.length > MAX_HISTORY) {
            nextHistory.shift()
          } else {
            nextIndex += 1
          }
        }

        return {
          ...tab,
          markdown: value,
          isDirty: value !== tab.savedMarkdown,
          history: nextHistory,
          currentIndex: nextIndex,
        }
      }),
    )
  }

  const undo = () => {
    if (!canUndo) return
    setTabs((current) =>
      current.map((tab) => {
        if (tab.id !== activeTabId) return tab
        const nextIndex = tab.currentIndex - 1
        return {
          ...tab,
          currentIndex: nextIndex,
          markdown: tab.history[nextIndex],
          isDirty: tab.history[nextIndex] !== tab.savedMarkdown,
        }
      }),
    )
  }

  const redo = () => {
    if (!canRedo) return
    setTabs((current) =>
      current.map((tab) => {
        if (tab.id !== activeTabId) return tab
        const nextIndex = tab.currentIndex + 1
        return {
          ...tab,
          currentIndex: nextIndex,
          markdown: tab.history[nextIndex],
          isDirty: tab.history[nextIndex] !== tab.savedMarkdown,
        }
      }),
    )
  }

  const createNewDocument = (options?: { markdown?: string }) => {
    const initialMarkdown = options?.markdown ?? INITIAL_MARKDOWN
    const nextTab = createTab({
      isDirty: false,
      markdown: initialMarkdown,
      savedMarkdown: initialMarkdown,
      history: [initialMarkdown],
      currentIndex: 0,
    })
    setTabs((current) => [...current, nextTab])
    setActiveTabId(nextTab.id)
  }

  const openPicker = async () => {
    const file = await fileService.openMarkdownFile()
    if (!file) return
    openOrActivateTab(file)
    return file
  }

  const activateTab = (tabId: string) => {
    setActiveTabId(tabId)
  }

  const closeTab = (tabId: string) => {
    const tab = tabs.find((item) => item.id === tabId)
    if (!tab) return false

    if (tabs.length === 1) {
      const fresh = createTab()
      setTabs([fresh])
      setActiveTabId(fresh.id)
      return true
    }

    const currentIndex = tabs.findIndex((item) => item.id === tabId)
    const fallback = tabs[currentIndex - 1] ?? tabs[currentIndex + 1]
    setTabs((current) => current.filter((item) => item.id !== tabId))
    if (activeTabId === tabId && fallback) {
      setActiveTabId(fallback.id)
    }
    return true
  }

  const renameFile = (nextFileName: string) => {
    setActiveTabPatch({ fileName: nextFileName })
  }

  const updateCurrentFile = (nextFile: FileDescriptor | null) => {
    setActiveTabPatch({ currentFile: nextFile, ...(nextFile ? { fileName: nextFile.name } : {}) })
  }

  const markSaved = () => {
    if (!activeTab) return
    setTabs((current) =>
      current.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              isDirty: false,
              savedMarkdown: tab.markdown,
            }
          : tab,
      ),
    )
  }

  return {
    activeTabId,
    activateTab,
    anyDirty,
    applyOpenedFile,
    canRedo,
    canUndo,
    closeTab,
    currentFile: activeTab?.currentFile ?? null,
    createNewDocument,
    fileName: activeTab?.fileName ?? SAMPLE_NAME,
    isDirty: activeTab?.isDirty ?? false,
    markdown: activeTab?.markdown ?? INITIAL_MARKDOWN,
    markSaved,
    openPicker,
    redo,
    renameFile,
    statusText,
    tabs,
    undo,
    updateCurrentFile,
    updateMarkdown,
  }
}
