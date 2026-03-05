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
}

function createTab(overrides?: Partial<DocumentTab>): DocumentTab {
  return {
    id: `tab-${crypto.randomUUID()}`,
    currentFile: null,
    fileName: SAMPLE_NAME,
    isDirty: false,
    markdown: INITIAL_MARKDOWN,
    savedMarkdown: INITIAL_MARKDOWN,
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

export function useDocumentState(fileService: FileService) {
  const [tabs, setTabs] = useState<DocumentTab[]>([createTab()])
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0].id)

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0],
    [activeTabId, tabs],
  )

  const anyDirty = useMemo(() => tabs.some((tab) => tab.isDirty), [tabs])
  const statusText = useMemo(() => (activeTab?.isDirty ? 'modified' : 'saved'), [activeTab])

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
      current.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              markdown: value,
              isDirty: value !== tab.savedMarkdown,
            }
          : tab,
      ),
    )
  }

  const createNewDocument = () => {
    const nextTab = createTab()
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
    closeTab,
    currentFile: activeTab?.currentFile ?? null,
    createNewDocument,
    fileName: activeTab?.fileName ?? SAMPLE_NAME,
    isDirty: activeTab?.isDirty ?? false,
    markdown: activeTab?.markdown ?? INITIAL_MARKDOWN,
    markSaved,
    openPicker,
    renameFile,
    statusText,
    tabs,
    updateCurrentFile,
    updateMarkdown,
  }
}
