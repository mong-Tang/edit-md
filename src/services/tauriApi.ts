import type { FileDescriptor, OpenedFile } from '../types/file'

type DialogModule = typeof import('@tauri-apps/plugin-dialog')
type FsModule = typeof import('@tauri-apps/plugin-fs')

const MARKDOWN_FILTERS = [
  {
    extensions: ['md', 'markdown', 'txt'],
    name: 'Markdown Files',
  },
]

function getFileNameFromPath(path: string) {
  const normalized = path.replaceAll('\\', '/')
  const segments = normalized.split('/')
  return segments[segments.length - 1] || path
}

function createTauriDescriptor(path: string): FileDescriptor {
  return {
    backend: 'tauri',
    name: getFileNameFromPath(path),
    path,
  }
}

async function loadDialogModule(): Promise<DialogModule> {
  return import('@tauri-apps/plugin-dialog')
}

async function loadFsModule(): Promise<FsModule> {
  return import('@tauri-apps/plugin-fs')
}

export async function tauriOpenMarkdownFile(): Promise<OpenedFile | null> {
  const dialog = await loadDialogModule()
  const selected = await dialog.open({
    filters: MARKDOWN_FILTERS,
    multiple: false,
    title: 'Markdown 파일 열기',
  })

  if (!selected || Array.isArray(selected)) {
    return null
  }

  const fs = await loadFsModule()
  const content = await fs.readTextFile(selected)

  return {
    content,
    descriptor: createTauriDescriptor(selected),
  }
}

export async function tauriSaveFile(content: string, file: FileDescriptor): Promise<FileDescriptor> {
  if (!file.path) {
    throw new Error('Tauri saveFile requires a file path.')
  }

  const fs = await loadFsModule()
  await fs.writeTextFile(file.path, content)
  return file
}

export async function tauriSaveFileAs(defaultName: string, content: string): Promise<FileDescriptor | null> {
  const dialog = await loadDialogModule()
  const selected = await dialog.save({
    defaultPath: defaultName,
    filters: MARKDOWN_FILTERS,
    title: 'Markdown 파일 저장',
  })

  if (!selected) {
    return null
  }

  const fs = await loadFsModule()
  await fs.writeTextFile(selected, content)
  return createTauriDescriptor(selected)
}

export async function tauriReopenRecentFile(file: FileDescriptor): Promise<OpenedFile | null> {
  if (file.backend !== 'tauri' || !file.path) {
    return null
  }

  const fs = await loadFsModule()
  const content = await fs.readTextFile(file.path)

  return {
    content,
    descriptor: file,
  }
}
