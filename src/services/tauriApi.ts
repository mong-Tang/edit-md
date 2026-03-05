import type { FileDescriptor, OpenedFile } from '../types/file'
import { translateCurrent } from '../i18n'

type DialogModule = typeof import('@tauri-apps/plugin-dialog')
type FsModule = typeof import('@tauri-apps/plugin-fs')
type DialogFilter = {
  extensions: string[]
  name: string
}

function getMarkdownFilters() {
  return [
    {
      extensions: ['md', 'markdown', 'txt'],
      name: translateCurrent('dialog.filter.markdownFiles'),
    },
  ] satisfies DialogFilter[]
}

function getMarkdownSaveFilters() {
  return [
    {
      extensions: ['md'],
      name: translateCurrent('dialog.filter.markdownMd'),
    },
    {
      extensions: ['txt'],
      name: translateCurrent('dialog.filter.textTxt'),
    },
  ] satisfies DialogFilter[]
}

function getPdfFilters() {
  return [
    {
      extensions: ['pdf'],
      name: translateCurrent('dialog.filter.pdfFiles'),
    },
  ] satisfies DialogFilter[]
}

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
    filters: getMarkdownFilters(),
    multiple: false,
    title: translateCurrent('dialog.title.openMarkdown'),
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
    filters: getMarkdownSaveFilters(),
    title: translateCurrent('dialog.title.saveMarkdown'),
  })

  if (!selected) {
    return null
  }

  const fs = await loadFsModule()
  await fs.writeTextFile(selected, content)
  return createTauriDescriptor(selected)
}

export async function tauriSaveBinaryFileAs(
  defaultName: string,
  content: ArrayBuffer,
): Promise<FileDescriptor | null> {
  const dialog = await loadDialogModule()
  const selected = await dialog.save({
    defaultPath: defaultName,
    filters: getPdfFilters(),
    title: translateCurrent('dialog.title.savePdf'),
  })

  if (!selected) {
    return null
  }

  const fs = await loadFsModule()
  await fs.writeFile(selected, new Uint8Array(content))
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
