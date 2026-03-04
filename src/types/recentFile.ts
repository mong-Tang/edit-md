export type RecentFileEntry = {
  backend: 'browser' | 'tauri'
  name: string
  path?: string
  updatedAt: string
}
