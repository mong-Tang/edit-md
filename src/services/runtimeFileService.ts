import type { FileService } from './fileService'
import { browserFileService } from './browserFileService'
import { tauriFileService } from './tauriFileService'

function isTauriRuntime() {
  return Reflect.has(window, '__TAURI__')
}

export const runtimeFileService: FileService = isTauriRuntime()
  ? tauriFileService
  : browserFileService
