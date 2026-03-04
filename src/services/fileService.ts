import type { FileDescriptor, OpenedFile, SaveFilePayload } from '../types/file'

export interface FileService {
  openMarkdownFile(): Promise<OpenedFile | null>
  saveFile(payload: SaveFilePayload): Promise<void>
  saveFileAs(payload: SaveFilePayload): Promise<FileDescriptor | null>
  reopenRecentFile(file: FileDescriptor): Promise<OpenedFile | null>
}
