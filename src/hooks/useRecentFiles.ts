import { useEffect, useState } from 'react'
import type { FileDescriptor } from '../types/file'
import type { RecentFileEntry } from '../types/recentFile'

const STORAGE_KEY = 'edit-md-recent-files'
const MAX_RECENT_FILES = 5

function loadRecentFiles(): RecentFileEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as RecentFileEntry[]
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item) =>
        typeof item?.name === 'string' &&
        typeof item?.updatedAt === 'string' &&
        (item?.backend === 'browser' || item?.backend === 'tauri'),
    )
  } catch {
    return []
  }
}

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentFileEntry[]>(loadRecentFiles)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentFiles))
  }, [recentFiles])

  const addRecentFile = (file: FileDescriptor) => {
    const trimmed = file.name.trim()
    if (!trimmed) return

    setRecentFiles((current) => {
      const nextEntry: RecentFileEntry = {
        backend: file.backend,
        name: trimmed,
        path: file.path,
        updatedAt: new Date().toISOString(),
      }

      return [
        nextEntry,
        ...current.filter((item) => item.name !== trimmed || item.path !== file.path || item.backend !== file.backend),
      ].slice(0, MAX_RECENT_FILES)
    })
  }

  return {
    addRecentFile,
    recentFiles,
  }
}
