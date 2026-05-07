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
import { useEffect, useRef, useLayoutEffect } from 'react'

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
  onEmojiClick: () => void
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
  onEmojiClick,
  canUndo,
  canRedo,
  hasOpenFiles,
  hasSelection,
  canPaste,
}: ContextMenuProps) {
  const { t } = useI18n()
  const menuRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current
      const { innerWidth, innerHeight } = window
      const { offsetWidth, offsetHeight } = menu

      let adjustedX = x
      let adjustedY = y

      // 오른쪽 경계 체크 (8px 여유)
      if (x + offsetWidth > innerWidth) {
        adjustedX = Math.max(0, innerWidth - offsetWidth - 8)
      }
      // 하단 경계 체크 (8px 여유)
      if (y + offsetHeight > innerHeight) {
        adjustedY = Math.max(0, innerHeight - offsetHeight - 8)
      }

      menu.style.left = `${adjustedX}px`
      menu.style.top = `${adjustedY}px`
    }
  }, [x, y])

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
      style={{ left: '-9999px', top: '-9999px' }}
      onContextMenu={handleContextMenu}
      role="menu"
    >
      <button
        className="menu__item"
        disabled={!hasOpenFiles}
        onClick={() => {
          onEmojiClick();
          onClose();
        }}
      >
        <Smile size={16} />
        <span className="menu__item-label">{t('menu.edit.emoji')}</span>
        <span className="menu__item-shortcut">Win+.</span>
      </button>

      <div className="menu__separator" />

      <button
        className="menu__item"
        disabled={!canUndo}
        onClick={() => { onUndo(); onClose(); }}
      >
        <Undo size={16} />
        <span className="menu__item-label">{t('menu.edit.undo')}</span>
        <span className="menu__item-shortcut">Ctrl+Z</span>
      </button>
      <button
        className="menu__item"
        disabled={!canRedo}
        onClick={() => { onRedo(); onClose(); }}
      >
        <Redo size={16} />
        <span className="menu__item-label">{t('menu.edit.redo')}</span>
        <span className="menu__item-shortcut">Ctrl+Y</span>
      </button>
      
      <div className="menu__separator" />
      
      <button
        className="menu__item"
        disabled={!hasSelection}
        onClick={() => { onCut(); onClose(); }}
      >
        <Scissors size={16} />
        <span className="menu__item-label">{t('menu.edit.cut')}</span>
        <span className="menu__item-shortcut">Ctrl+X</span>
      </button>
      <button
        className="menu__item"
        disabled={!hasSelection}
        onClick={() => { onCopy(); onClose(); }}
      >
        <Copy size={16} />
        <span className="menu__item-label">{t('menu.edit.copy')}</span>
        <span className="menu__item-shortcut">Ctrl+C</span>
      </button>
      <button
        className="menu__item"
        disabled={!canPaste}
        title={t('menu.edit.paste')}
        onClick={() => { onPaste(); onClose(); }}
      >
        <Clipboard size={16} />
        <span className="menu__item-label">{t('menu.edit.paste')}</span>
        <span className="menu__item-shortcut">Ctrl+V</span>
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
        <span className="menu__item-label">{t('menu.edit.pastePlain')}</span>
        <span className="menu__item-shortcut">Ctrl+Shift+V</span>
      </button>

      <div className="menu__separator" />

      <button
        className="menu__item"
        disabled={!hasOpenFiles}
        onClick={() => { onSelectAll(); onClose(); }}
      >
        <MousePointerClick size={16} />
        <span className="menu__item-label">{t('menu.edit.selectAll')}</span>
        <span className="menu__item-shortcut">Ctrl+A</span>
      </button>
    </div>
  )
}
