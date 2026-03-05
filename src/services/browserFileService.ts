import { downloadFile } from '../lib/file'
import { translateCurrent } from '../i18n'
import type { FileDescriptor } from '../types/file'
import type { FileService } from './fileService'

const ACCEPT = '.md,.markdown,.txt'

type OpenFilePicker = (options?: {
  excludeAcceptAllOption?: boolean
  multiple?: boolean
  types?: PickerFileType[]
}) => Promise<Array<{ getFile: () => Promise<File> }>>

type SaveFilePicker = (options?: {
  suggestedName?: string
  types?: PickerFileType[]
}) => Promise<{
  createWritable: () => Promise<{
    close: () => Promise<void>
    write: (content: BlobPart) => Promise<void>
  }>
  name?: string
}>

type PickerFileType = {
  accept: Record<string, string[]>
  description: string
}

function createBrowserDescriptor(name: string): FileDescriptor {
  return {
    backend: 'browser',
    name,
  }
}

function createHiddenInput() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = ACCEPT
  input.style.display = 'none'
  document.body.append(input)
  return input
}

function getMarkdownPickerTypes(): PickerFileType[] {
  return [
    {
      accept: { 'text/markdown': ['.md', '.markdown'], 'text/plain': ['.txt'] },
      description: translateCurrent('dialog.filter.markdownFiles'),
    },
  ]
}

function getMarkdownSavePickerTypes(): PickerFileType[] {
  return [
    {
      accept: { 'text/markdown': ['.md'] } as Record<string, string[]>,
      description: translateCurrent('dialog.filter.markdownMd'),
    },
    {
      accept: { 'text/plain': ['.txt'] } as Record<string, string[]>,
      description: translateCurrent('dialog.filter.textTxt'),
    },
  ]
}

async function openWithInputFallback() {
  const input = createHiddenInput()

  const file = await new Promise<File | null>((resolve) => {
    input.addEventListener(
      'change',
      () => {
        resolve(input.files?.[0] ?? null)
      },
      { once: true },
    )

    input.click()
  })

  input.remove()
  if (!file) return null

  return {
    content: await file.text(),
    descriptor: createBrowserDescriptor(file.name),
  }
}

function getSaveAsName(defaultName: string) {
  const nextName = window.prompt(translateCurrent('dialog.saveAsPrompt'), defaultName)
  if (!nextName) return null
  return nextName.trim() || defaultName
}

export const browserFileService: FileService = {
  async openMarkdownFile() {
    const picker = Reflect.get(window, 'showOpenFilePicker') as OpenFilePicker | undefined

    if (picker) {
      try {
        const [handle] = await picker({
          excludeAcceptAllOption: false,
          multiple: false,
          types: getMarkdownPickerTypes(),
        })

        const file = await handle.getFile()
        return {
          content: await file.text(),
          descriptor: createBrowserDescriptor(file.name),
        }
      } catch {
        return null
      }
    }

    return openWithInputFallback()
  },

  async saveFile({ content, currentFile, mimeType, name }) {
    void currentFile
    downloadFile(name, content, mimeType)
  },

  async saveFileAs({ content, mimeType, name }) {
    const picker = Reflect.get(window, 'showSaveFilePicker') as SaveFilePicker | undefined

    if (picker) {
      try {
        const handle = await picker({
          suggestedName: name,
          types: getMarkdownSavePickerTypes(),
        })
        const writable = await handle.createWritable()
        await writable.write(content)
        await writable.close()
        return createBrowserDescriptor(handle.name ?? name)
      } catch {
        return null
      }
    }

    const nextName = getSaveAsName(name)
    if (!nextName) return null

    downloadFile(nextName, content, mimeType)
    return createBrowserDescriptor(nextName)
  },

  async saveBinaryFileAs({ content, mimeType, name }) {
    const picker = Reflect.get(window, 'showSaveFilePicker') as SaveFilePicker | undefined

    if (picker) {
      try {
        const handle = await picker({
          suggestedName: name,
          types: [
            {
              accept: { [mimeType]: ['.pdf'] },
              description: translateCurrent('dialog.filter.pdfFiles'),
            },
          ],
        })
        const writable = await handle.createWritable()
        await writable.write(content)
        await writable.close()
        return createBrowserDescriptor(handle.name ?? name)
      } catch {
        return null
      }
    }

    downloadFile(name, content, mimeType)
    return createBrowserDescriptor(name)
  },

  async reopenRecentFile(file) {
    if (file.backend !== 'browser') {
      return null
    }

    return null
  },
}
