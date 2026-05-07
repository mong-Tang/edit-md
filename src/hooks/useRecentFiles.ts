import { useEffect, useState } from 'react'
import type { FileDescriptor } from '../types/file'
import type { RecentFileEntry } from '../types/recentFile'

const STORAGE_KEY = 'edit-md-recent-files'
const MAX_RECENT_FILES = 10

function normalizePath(p: string): string {
  if (!p) return ''
  let normalized = p.replace(/\\/g, '/')
  if (/^[A-Za-z]:/.test(normalized)) {
    normalized = normalized.charAt(0).toLowerCase() + normalized.slice(1)
  }
  return normalized
}

function canReopenRecentFile(file: Pick<RecentFileEntry, 'backend' | 'path'>) {
  return file.backend === 'tauri' && typeof file.path === 'string' && file.path.length > 0
}

function loadRecentFiles(): RecentFileEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as RecentFileEntry[]
    if (!Array.isArray(parsed)) return []

    const filtered = parsed.filter(
      (item) =>
        typeof item?.name === 'string' &&
        typeof item?.updatedAt === 'string' &&
        (item?.backend === 'browser' || item?.backend === 'tauri') &&
        canReopenRecentFile(item),
    )

    // Automatically deduplicate based on normalized path and backend on load!
    const seen = new Set<string>()
    const unique: RecentFileEntry[] = []
    for (const item of filtered) {
      const key = `${item.backend}:${normalizePath(item.path)}`
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(item)
      }
    }
    return unique
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
    if (!trimmed || file.backend !== 'tauri' || !file.path) return

    setRecentFiles((current) => {
      const normalizedNewPath = normalizePath(file.path)
      const nextEntry: RecentFileEntry = {
        backend: file.backend,
        name: trimmed,
        path: file.path,
        updatedAt: new Date().toISOString(),
      }

      return [
        nextEntry,
        ...current.filter((item) => {
          const normalizedExistingPath = normalizePath(item.path)
          return (
            item.name.trim() !== trimmed ||
            normalizedExistingPath !== normalizedNewPath ||
            item.backend !== file.backend
          )
        }),
      ].slice(0, MAX_RECENT_FILES)
    })
  }

  const removeRecentFile = (file: Pick<RecentFileEntry, 'backend' | 'name' | 'path'>) => {
    const normalizedTarget = normalizePath(file.path)
    setRecentFiles((current) =>
      current.filter(
        (item) =>
          item.backend !== file.backend ||
          item.name !== file.name ||
          normalizePath(item.path) !== normalizedTarget,
      ),
    )
  }

  return {
    addRecentFile,
    recentFiles,
    removeRecentFile,
  }
}
