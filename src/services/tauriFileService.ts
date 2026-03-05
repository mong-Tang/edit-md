import type { FileService } from './fileService'
import { browserFileService } from './browserFileService'
import {
  tauriOpenMarkdownFile,
  tauriReopenRecentFile,
  tauriSaveBinaryFileAs,
  tauriSaveFile,
  tauriSaveFileAs,
} from './tauriApi'

function logTauriStub(methodName: string) {
  console.info(`[TauriFileService] ${methodName} failed. Browser fallback is used.`)
}

export const tauriFileService: FileService = {
  async openMarkdownFile() {
    try {
      return await tauriOpenMarkdownFile()
    } catch {
      logTauriStub('openMarkdownFile')
      return browserFileService.openMarkdownFile()
    }
  },

  async saveFile(payload) {
    try {
      if (payload.currentFile?.backend === 'tauri' && payload.currentFile.path) {
        await tauriSaveFile(payload.content, payload.currentFile)
        return
      }

      const nextFile = await tauriSaveFileAs(payload.name, payload.content)
      if (!nextFile) return
      return
    } catch {
      logTauriStub('saveFile')
      return browserFileService.saveFile(payload)
    }
  },

  async saveFileAs(payload) {
    try {
      return await tauriSaveFileAs(payload.name, payload.content)
    } catch {
      logTauriStub('saveFileAs')
      return browserFileService.saveFileAs(payload)
    }
  },

  async saveBinaryFileAs(payload) {
    try {
      return await tauriSaveBinaryFileAs(payload.name, payload.content)
    } catch {
      logTauriStub('saveBinaryFileAs')
      return browserFileService.saveBinaryFileAs(payload)
    }
  },

  async reopenRecentFile(file) {
    try {
      return await tauriReopenRecentFile(file)
    } catch (error) {
      console.error('[TauriFileService] reopenRecentFile error', { file, error })
      logTauriStub('reopenRecentFile')
      return browserFileService.reopenRecentFile(file)
    }
  },
}
