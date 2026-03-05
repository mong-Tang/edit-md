export type FileBackend = 'browser' | 'tauri'

export type FileDescriptor = {
  backend: FileBackend
  name: string
  path?: string
}

export type OpenedFile = {
  content: string
  descriptor: FileDescriptor
}

export type SaveFilePayload = {
  content: string
  currentFile?: FileDescriptor | null
  mimeType: string
  name: string
}

export type SaveBinaryFilePayload = {
  content: ArrayBuffer
  mimeType: string
  name: string
}
