import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const isTauriBuild = Boolean(process.env.TAURI_ENV_PLATFORM)
  const base = command === 'build' ? (isTauriBuild ? './' : '/edit-md/') : '/'

  return {
    plugins: [react()],
    base,
  }
})
