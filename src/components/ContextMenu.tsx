import { useI18n } from '../i18n'
import {
  Undo,
  Redo,
  Scissors,
  Copy,
  Clipboard,
  MousePointerClick,
  Smile,
  Type,
} from 'lucide-react'
import { useEffect, useRef } from 'react'

type ContextMenuProps = {
  x: number
  y: number
  onClose: () => void
  onUndo: () => void
  onRedo: () => void
  onCut: () => void
  onCopy: () => void
  onPaste: () => void
  onSelectAll: () => void
  canUndo: boolean
  canRedo: boolean
  hasOpenFiles: boolean
  hasSelection: boolean
  canPaste: boolean
}

export function ContextMenu({
  x,
  y,
  onClose,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onSelectAll,
  canUndo,
  canRedo,
  hasOpenFiles,
  hasSelection,
  canPaste,
}: ContextMenuProps) {
  const { t } = useI18n()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Prevent right-click on the context menu itself
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: x, top: y }}
      onContextMenu={handleContextMenu}
      role="menu"
    >
      <button
        className="menu__item"
        disabled={!hasOpenFiles}
        onClick={() => {
          // 이모지 피커 (시스템 단축키 안내 위주)
          onClose();
        }}
      >
        <Smile size={16} />
        <span>{t('menu.edit.emoji')}</span>
        <span className="menu__hint">Win+.</span>
      </button>

      <div className="menu__separator" />

      <button
        className="menu__item"
        disabled={!canUndo}
        onClick={() => { onUndo(); onClose(); }}
      >
        <Undo size={16} />
        <span>{t('menu.edit.undo')}</span>
        <span className="menu__hint">Ctrl+Z</span>
      </button>
      <button
        className="menu__item"
        disabled={!canRedo}
        onClick={() => { onRedo(); onClose(); }}
      >
        <Redo size={16} />
        <span>{t('menu.edit.redo')}</span>
        <span className="menu__hint">Ctrl+Y</span>
      </button>
      
      <div className="menu__separator" />
      
      <button
        className="menu__item"
        disabled={!hasSelection}
        onClick={() => { onCut(); onClose(); }}
      >
        <Scissors size={16} />
        <span>{t('menu.edit.cut')}</span>
        <span className="menu__hint">Ctrl+X</span>
      </button>
      <button
        className="menu__item"
        disabled={!hasSelection}
        onClick={() => { onCopy(); onClose(); }}
      >
        <Copy size={16} />
        <span>{t('menu.edit.copy')}</span>
        <span className="menu__hint">Ctrl+C</span>
      </button>
      <button
        className="menu__item"
        disabled={!canPaste}
        title={t('menu.edit.paste')}
        onClick={() => { onPaste(); onClose(); }}
      >
        <Clipboard size={16} />
        <span>{t('menu.edit.paste')}</span>
        <span className="menu__hint">Ctrl+V</span>
      </button>
      <button
        className="menu__item"
        disabled={!canPaste}
        title={t('menu.edit.pastePlain.desc')}
        onClick={() => { 
          // 서식 없이 붙여넣기
          onPaste(); 
          onClose(); 
        }}
      >
        <Type size={16} />
        <span>{t('menu.edit.pastePlain')}</span>
        <span className="menu__hint">Ctrl+Shift+V</span>
      </button>

      <div className="menu__separator" />

      <button
        className="menu__item"
        disabled={!hasOpenFiles}
        onClick={() => { onSelectAll(); onClose(); }}
      >
        <MousePointerClick size={16} />
        <span>{t('menu.edit.selectAll')}</span>
        <span className="menu__hint">Ctrl+A</span>
      </button>
    </div>
  )
}
