import { useEffect, useState } from 'react'
import { X, Minus, Square, Copy } from 'lucide-react'
import { isTauri } from '@tauri-apps/api/core'
import { useI18n } from '../i18n'

export function TitleBar() {
  const { t } = useI18n()
  const [isMaximized, setIsMaximized] = useState(false)
  const [appWindow, setAppWindow] = useState<any>(null)

  useEffect(() => {
    if (isTauri()) {
      import('@tauri-apps/api/window').then((mod) => {
        const win = mod.getCurrentWindow()
        setAppWindow(win)
        
        win.isMaximized().then(setIsMaximized)
        const unlisten = win.onResized(async () => {
          setIsMaximized(await win.isMaximized())
        })
        return () => { unlisten.then(u => u()) }
      })
    }
  }, [])

  const handleMinimize = () => appWindow?.minimize()
  const handleMaximize = async () => {
    await appWindow?.toggleMaximize()
    setIsMaximized(await appWindow?.isMaximized() ?? false)
  }
  const handleClose = () => appWindow?.close()

  const handleMouseDown = async (e: React.MouseEvent) => {
    if (e.buttons === 1 && appWindow) {
      await appWindow.startDragging()
    }
  }

  return (
    <div 
      className="titlebar" 
      onMouseDown={handleMouseDown}
    >
      <div className="titlebar__left">
        <div className="titlebar__logo">M</div>
        <span className="titlebar__title">{t('about.title')}</span>
      </div>
      
      <div className="titlebar__right" onMouseDown={(e) => e.stopPropagation()}>
        <button 
          className="titlebar__button" 
          onClick={handleMinimize} 
          title="Minimize" 
          type="button"
        >
          <Minus size={14} />
        </button>
        <button 
          className="titlebar__button" 
          onClick={handleMaximize} 
          title={isMaximized ? 'Restore' : 'Maximize'} 
          type="button"
        >
          {isMaximized ? <Copy size={12} /> : <Square size={12} />}
        </button>
        <button 
          className="titlebar__button titlebar__button--close" 
          onClick={handleClose} 
          title="Close" 
          type="button"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
