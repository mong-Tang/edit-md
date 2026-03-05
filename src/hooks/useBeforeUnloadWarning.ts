import { useEffect } from 'react'
import { isTauri } from '@tauri-apps/api/core'

export function useBeforeUnloadWarning(enabled: boolean) {
  useEffect(() => {
    if (isTauri()) return
    if (!enabled) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled])
}
