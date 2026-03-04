import { isTauri } from '@tauri-apps/api/core'
import type { FileService } from './fileService'
import { browserFileService } from './browserFileService'
import { tauriFileService } from './tauriFileService'

export const runtimeFileService: FileService = isTauri() ? tauriFileService : browserFileService
