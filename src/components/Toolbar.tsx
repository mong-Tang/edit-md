import {
  FilePlus,
  FolderOpen,
  Save,
  X,
  FileOutput,
  LogOut,
  Undo,
  Redo,
  Scissors,
  Copy,
  Clipboard,
  MousePointerClick,
  Sun,
  Moon,
  Monitor,
  CheckCircle,
  Languages,
  ArrowRightToLine,
  BookOpen,
  RefreshCw,
  Info,
  Clock,
  Smile,
  Type,
} from 'lucide-react'
import { isTauri } from '@tauri-apps/api/core'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { truncateFileName } from '../lib/string'
import type { RecentFileEntry } from '../types/recentFile'
import type { ThemeMode } from '../types/theme'

type ToolbarProps = {
  allowEditorContextMenu: boolean
  canRedo: boolean
  canUndo: boolean
  hasOpenFiles: boolean
  indentSize: 2 | 4 | 8
  onCheckForUpdates: () => void
  onOpenMongTangAi: () => void
  onCopy: () => void
  onCut: () => void
  onExportHtml: () => void
  onCloseFile: () => void
  onExit: () => void
  onNewFile: () => void
  onOpen: () => void
  onPaste: () => void
  onRecentFileSelect: (file: RecentFileEntry) => void
  onRedo: () => void
  recentFiles: RecentFileEntry[]
  onSave: () => void
  onSaveAs: () => void
  onShowVersionInfo: () => void
  onShowHistory: () => void
  onSelectAll: () => void
  onToggleEditorContextMenu: () => void
  onShowStartGuide: () => void
  onThemeChange: (theme: ThemeMode) => void
  onIndentSizeChange: (size: 2 | 4 | 8) => void
  onUndo: () => void
  onEmojiClick: () => void
  hideStartGuide: boolean
  hasSelection: boolean
  canPaste: boolean
  themeMode: ThemeMode
}

type MenuKey = 'edit' | 'file' | 'help' | 'view' | null

export function Toolbar({
  allowEditorContextMenu,
  canRedo,
  canUndo,
  hasOpenFiles,
  indentSize,
  onCheckForUpdates,
  onOpenMongTangAi,
  onCopy,
  onCut,
  onExportHtml,
  onCloseFile,
  onExit,
  onNewFile,
  onOpen,
  onPaste,
  onRecentFileSelect,
  onRedo,
  recentFiles,
  onSave,
  onSaveAs,
  onShowVersionInfo,
  onShowHistory,
  onSelectAll,
  onToggleEditorContextMenu,
  onShowStartGuide,
  onThemeChange,
  onIndentSizeChange,
  onUndo,
  onEmojiClick,
  hideStartGuide,
  hasSelection,
  canPaste,
  themeMode,
}: ToolbarProps) {
  const { locale, setLocale, t } = useI18n()
  const isDesktopRuntime = isTauri()
  const [openMenu, setOpenMenu] = useState<MenuKey>(null)
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(-1)
  const [appWindow, setAppWindow] = useState<any>(null)

  useEffect(() => {
    if (isTauri()) {
      import('@tauri-apps/api/window').then((mod) => {
        setAppWindow(mod.getCurrentWindow())
      })
    }
  }, [])

  const handleMouseDown = async (e: React.MouseEvent) => {
    if (e.buttons === 1 && appWindow) {
      await appWindow.startDragging()
    }
  }

  const handleMinimize = () => appWindow?.minimize()
  const handleMaximize = async () => {
    if (appWindow) {
      try {
        await appWindow.toggleMaximize()
      } catch (err) {
        console.error('Failed to toggle maximize:', err)
      }
    }
  }
  const handleClose = () => appWindow?.close()

  const rootRef = useRef<HTMLElement | null>(null)

  const menuOrder: Exclude<MenuKey, null>[] = ['file', 'edit', 'view', 'help']

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null)
        setFocusedItemIndex(-1)
      }
    }

    const handleKeydown = (event: KeyboardEvent) => {
      // Escape to close
      if (event.key === 'Escape') {
        setOpenMenu(null)
        setFocusedItemIndex(-1)
        return
      }

      // If no menu is open, handle Alt + Mnemonics
      if (!openMenu) {
        if (event.altKey && !event.ctrlKey && !event.shiftKey) {
          const key = event.key.toLowerCase()
          const menuIdx = menuOrder.findIndex(m => m[0] === key)
          if (menuIdx !== -1) {
            event.preventDefault()
            setOpenMenu(menuOrder[menuIdx])
            setFocusedItemIndex(0) // Open and focus first item
          }
        }
        return
      }

      // If menu is open, handle navigation
      const currentItems = Array.from(rootRef.current?.querySelectorAll('.menu__dropdown .menu__item') || []) as HTMLButtonElement[]
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setFocusedItemIndex(prev => {
            let next = prev + 1
            while (next < currentItems.length && currentItems[next].disabled) next++
            return next < currentItems.length ? next : prev
          })
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedItemIndex(prev => {
            let next = prev - 1
            while (next >= 0 && currentItems[next].disabled) next--
            return next >= 0 ? next : prev
          })
          break
        case 'ArrowRight':
          event.preventDefault()
          const nextMenuIdx = (menuOrder.indexOf(openMenu) + 1) % menuOrder.length
          setOpenMenu(menuOrder[nextMenuIdx])
          setFocusedItemIndex(0)
          break
        case 'ArrowLeft':
          event.preventDefault()
          const prevMenuIdx = (menuOrder.indexOf(openMenu) - 1 + menuOrder.length) % menuOrder.length
          setOpenMenu(menuOrder[prevMenuIdx])
          setFocusedItemIndex(0)
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusedItemIndex !== -1 && currentItems[focusedItemIndex]) {
            currentItems[focusedItemIndex].click()
          }
          break
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [openMenu, focusedItemIndex])

  // Sync focus when focusedItemIndex changes
  useEffect(() => {
    if (openMenu && focusedItemIndex !== -1) {
      const currentItems = Array.from(rootRef.current?.querySelectorAll('.menu__dropdown .menu__item') || []) as HTMLButtonElement[]
      currentItems[focusedItemIndex]?.focus()
    }
  }, [focusedItemIndex, openMenu])

  const renderMnemonic = (text: string) => {
    const parts = text.split('&')
    if (parts.length < 2) return text
    
    return (
      <>
        {parts[0]}
        <u>{parts[1][0]}</u>
        {parts[1].slice(1)}
      </>
    )
  }

  const toggleMenu = (menu: Exclude<MenuKey, null>) => {
    setOpenMenu((current) => (current === menu ? null : menu))
    setFocusedItemIndex(0) // 메뉴를 열 때 첫 번째 항목에 포커스 준비
  }

  const runMenuAction = (action: () => void) => {
    setOpenMenu(null)
    setFocusedItemIndex(-1)
    action()
  }

  const getRecentTooltip = (file: RecentFileEntry) => {
    if (file.path) return file.path
    return file.backend === 'browser' ? t('toolbar.recent.browserTooltip') : file.name
  }

  return (
    <header className="toolbar" ref={rootRef} onMouseDown={handleMouseDown}>
      <div className="menu-bar" role="menubar" aria-label={t('menu.top.aria')} onMouseDown={(e) => e.stopPropagation()}>
        <div className="toolbar__brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '10px', paddingRight: '12px', borderRight: '1px solid var(--border)', marginRight: '6px', height: '20px', userSelect: 'none' }}>
          <div className="titlebar__logo" style={{ cursor: 'default', width: '18px', height: '18px', fontSize: '11px', borderRadius: '4px' }}>M</div>
          <span className="titlebar__title" style={{ fontWeight: 800, fontSize: '12px', cursor: 'default', letterSpacing: '-0.02em' }}>mongTang</span>
        </div>
        <div className="menu">
          <button
            type="button"
            className="menu__trigger"
            aria-expanded={openMenu === 'file'}
            aria-haspopup="true"
            onClick={() => toggleMenu('file')}
            onMouseEnter={() => {
              if (openMenu) setOpenMenu('file')
            }}
          >
            {renderMnemonic(t('menu.file'))}
          </button>
          {openMenu === 'file' ? (
            <div className="menu__dropdown" role="menu" aria-label={t('menu.file.aria')}>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onNewFile)}>
                <FilePlus size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.file.new')}</span>
                <span className="menu__item-shortcut">Ctrl+N</span>
              </button>
              <div className="menu__separator" />
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onOpen)}>
                <FolderOpen size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.file.open')}</span>
                <span className="menu__item-shortcut">Ctrl+O</span>
              </button>
              <button
                type="button"
                className="menu__item"
                disabled={!hasOpenFiles}
                role="menuitem"
                onClick={() => runMenuAction(onSave)}
              >
                <Save size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.file.save')}</span>
                <span className="menu__item-shortcut">Ctrl+S</span>
              </button>
              <button
                type="button"
                className="menu__item"
                disabled={!hasOpenFiles}
                role="menuitem"
                onClick={() => runMenuAction(onSaveAs)}
              >
                <Save size={16} aria-hidden="true" />
                <span>{t('menu.file.saveAs')}</span>
              </button>
              <div className="menu__separator" />
              <button
                type="button"
                className="menu__item"
                disabled={!hasOpenFiles}
                role="menuitem"
                onClick={() => runMenuAction(onCloseFile)}
              >
                <X size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.file.close')}</span>
                <span className="menu__item-shortcut">Ctrl+W</span>
              </button>
              <div className="menu__separator" />
              <button
                type="button"
                className="menu__item"
                disabled={!hasOpenFiles}
                role="menuitem"
                onClick={() => runMenuAction(onExportHtml)}
              >
                <FileOutput size={16} aria-hidden="true" />
                <span>{t('menu.file.exportHtml')}</span>
              </button>
              <div className="menu__separator" />
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onExit)}>
                <LogOut size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.file.exit')}</span>
                <span className="menu__item-shortcut">Ctrl+Q</span>
              </button>
              <div className="menu__separator" />
              <div className="menu__section-title">{t('menu.file.recent')}</div>
              {recentFiles.length === 0 ? (
                <div className="menu__hint">{t('menu.file.recent.empty')}</div>
              ) : (
                recentFiles.map((file) => (
                  <button
                    key={`${file.backend}-${file.path ?? file.name}-${file.updatedAt}`}
                    type="button"
                    className="menu__item menu__item--recent"
                    role="menuitem"
                    title={getRecentTooltip(file)}
                    onClick={() => runMenuAction(() => onRecentFileSelect(file))}
                  >
                    <div className="menu__recent-info">
                      <Clock size={14} aria-hidden="true" />
                      <span className="menu__recent-name">{truncateFileName(file.name, 28)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div className="menu">
          <button
            type="button"
            className="menu__trigger"
            aria-expanded={openMenu === 'edit'}
            aria-haspopup="true"
            onClick={() => toggleMenu('edit')}
            onMouseEnter={() => {
              if (openMenu) setOpenMenu('edit')
            }}
          >
            {renderMnemonic(t('menu.edit'))}
          </button>
          {openMenu === 'edit' ? (
            <div className="menu__dropdown" role="menu" aria-label={t('menu.edit.aria')}>
              <button
                type="button"
                className="menu__item"
                role="menuitem"
                onClick={() => runMenuAction(onEmojiClick)}
              >
                <Smile size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.edit.emoji')}</span>
                <span className="menu__item-shortcut">Win+.</span>
              </button>
              <div className="menu__separator" />
              <button
                type="button"
                className="menu__item"
                disabled={!canUndo}
                role="menuitem"
                onClick={() => runMenuAction(onUndo)}
              >
                <Undo size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.edit.undo')}</span>
                <span className="menu__item-shortcut">Ctrl+Z</span>
              </button>
              <button
                type="button"
                className="menu__item"
                role="menuitem"
                disabled={!canRedo}
                onClick={() => runMenuAction(onRedo)}
              >
                <Redo size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.edit.redo')}</span>
                <span className="menu__item-shortcut">Ctrl+Y</span>
              </button>
              <div className="menu__separator" />
              <button
                type="button"
                className="menu__item"
                disabled={!hasSelection}
                role="menuitem"
                onClick={() => runMenuAction(onCut)}
              >
                <Scissors size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.edit.cut')}</span>
                <span className="menu__item-shortcut">Ctrl+X</span>
              </button>
              <button
                type="button"
                className="menu__item"
                disabled={!hasSelection}
                role="menuitem"
                onClick={() => runMenuAction(onCopy)}
              >
                <Copy size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.edit.copy')}</span>
                <span className="menu__item-shortcut">Ctrl+C</span>
              </button>
              <button
                type="button"
                className="menu__item"
                disabled={!canPaste}
                role="menuitem"
                title={t('menu.edit.paste')}
                onClick={() => runMenuAction(onPaste)}
              >
                <Clipboard size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.edit.paste')}</span>
                <span className="menu__item-shortcut">Ctrl+V</span>
              </button>
              <button
                type="button"
                className="menu__item"
                disabled={!canPaste}
                role="menuitem"
                title={t('menu.edit.pastePlain.desc')}
                onClick={() => runMenuAction(onPaste)}
              >
                <Type size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.edit.pastePlain')}</span>
                <span className="menu__item-shortcut">Ctrl+Shift+V</span>
              </button>
              <div className="menu__separator" />
              <button
                type="button"
                className="menu__item"
                disabled={!hasOpenFiles}
                role="menuitem"
                onClick={() => runMenuAction(onSelectAll)}
              >
                <MousePointerClick size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.edit.selectAll')}</span>
                <span className="menu__item-shortcut">Ctrl+A</span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="menu">
          <button
            type="button"
            className="menu__trigger"
            aria-expanded={openMenu === 'view'}
            aria-haspopup="true"
            onClick={() => toggleMenu('view')}
            onMouseEnter={() => {
              if (openMenu) setOpenMenu('view')
            }}
          >
            {renderMnemonic(t('menu.view'))}
          </button>
          {openMenu === 'view' ? (
            <div className="menu__dropdown" role="menu" aria-label={t('menu.view.aria')}>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={themeMode === 'light'}
                onClick={() => runMenuAction(() => onThemeChange('light'))}
              >
                <Sun size={16} aria-hidden="true" />
                <span>{t('menu.view.theme.light')}</span>
                <span className="menu__check-mark" aria-hidden="true">
                  {themeMode === 'light' ? <CheckCircle size={14} /> : null}
                </span>
              </button>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={themeMode === 'dark'}
                onClick={() => runMenuAction(() => onThemeChange('dark'))}
              >
                <Moon size={16} aria-hidden="true" />
                <span>{t('menu.view.theme.dark')}</span>
                <span className="menu__check-mark" aria-hidden="true">
                  {themeMode === 'dark' ? <CheckCircle size={14} /> : null}
                </span>
              </button>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={themeMode === 'system'}
                onClick={() => runMenuAction(() => onThemeChange('system'))}
              >
                <Monitor size={16} aria-hidden="true" />
                <span>{t('menu.view.theme.system')}</span>
                <span className="menu__check-mark" aria-hidden="true">
                  {themeMode === 'system' ? <CheckCircle size={14} /> : null}
                </span>
              </button>
              <div className="menu__separator" />
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemcheckbox"
                aria-checked={allowEditorContextMenu}
                onClick={() => runMenuAction(onToggleEditorContextMenu)}
              >
                <MousePointerClick size={16} aria-hidden="true" />
                <span>{t('menu.view.contextMenu')}</span>
                <span className="menu__check-mark" aria-hidden="true">
                  {allowEditorContextMenu ? <CheckCircle size={14} /> : null}
                </span>
              </button>
              <div className="menu__separator" />
              <div className="menu__section-title">{t('menu.view.language')}</div>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={locale === 'ko'}
                onClick={() => runMenuAction(() => setLocale('ko'))}
              >
                <Languages size={16} aria-hidden="true" />
                <span>{t('menu.view.language.ko')}</span>
                <span className="menu__check-mark" aria-hidden="true">
                  {locale === 'ko' ? <CheckCircle size={14} /> : null}
                </span>
              </button>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={locale === 'en'}
                onClick={() => runMenuAction(() => setLocale('en'))}
              >
                <Languages size={16} aria-hidden="true" />
                <span>{t('menu.view.language.en')}</span>
                <span className="menu__check-mark" aria-hidden="true">
                  {locale === 'en' ? <CheckCircle size={14} /> : null}
                </span>
              </button>
              <div className="menu__separator" />
              <div className="menu__section-title">{t('menu.view.indent')}</div>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={indentSize === 2}
                onClick={() => runMenuAction(() => onIndentSizeChange(2))}
              >
                <ArrowRightToLine size={16} aria-hidden="true" />
                <span>{t('menu.view.indent.2')}</span>
                <span className="menu__check-mark" aria-hidden="true">
                  {indentSize === 2 ? <CheckCircle size={14} /> : null}
                </span>
              </button>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={indentSize === 4}
                onClick={() => runMenuAction(() => onIndentSizeChange(4))}
              >
                <ArrowRightToLine size={16} aria-hidden="true" />
                <span>{t('menu.view.indent.4')}</span>
                <span className="menu__check-mark" aria-hidden="true">
                  {indentSize === 4 ? <CheckCircle size={14} /> : null}
                </span>
              </button>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={indentSize === 8}
                onClick={() => runMenuAction(() => onIndentSizeChange(8))}
              >
                <ArrowRightToLine size={16} aria-hidden="true" />
                <span>{t('menu.view.indent.8')}</span>
                <span className="menu__check-mark" aria-hidden="true">
                  {indentSize === 8 ? <CheckCircle size={14} /> : null}
                </span>
              </button>
              <div className="menu__separator" />
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemcheckbox"
                aria-checked={!hideStartGuide}
                onClick={() => runMenuAction(onShowStartGuide)}
              >
                <BookOpen size={16} aria-hidden="true" />
                <span>{hideStartGuide ? t('menu.view.startGuide.show') : t('menu.view.startGuide.hide')}</span>
                <span className="menu__check-mark" aria-hidden="true">
                  {!hideStartGuide ? <CheckCircle size={14} /> : null}
                </span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="menu">
          <button
            type="button"
            className="menu__trigger"
            aria-expanded={openMenu === 'help'}
            aria-haspopup="true"
            onClick={() => toggleMenu('help')}
            onMouseEnter={() => {
              if (openMenu) setOpenMenu('help')
            }}
          >
            {renderMnemonic(t('menu.help'))}
          </button>
          {openMenu === 'help' ? (
            <div className="menu__dropdown" role="menu" aria-label={t('menu.help.aria')}>
              <button
                type="button"
                className="menu__item"
                role="menuitem"
                onClick={() => runMenuAction(onOpenMongTangAi)}
              >
                <RefreshCw size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('toolbar.link.mongTang')}</span>
              </button>
              <div className="menu__separator" />
              {isDesktopRuntime ? (
                <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onCheckForUpdates)}>
                  <RefreshCw size={16} aria-hidden="true" />
                  <span className="menu__item-label">{t('menu.help.checkUpdates')}</span>
                </button>
              ) : null}
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onShowVersionInfo)}>
                <Info size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.help.versionInfo')}</span>
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onShowHistory)}>
                <Clock size={16} aria-hidden="true" />
                <span className="menu__item-label">{t('menu.help.viewHistory')}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="toolbar__window-controls" onMouseDown={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '14px', height: '100%', userSelect: 'none' }}>
        <button
          type="button"
          onClick={handleMinimize}
          style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'opacity 0.2s', padding: 0 }}
          title="Minimize"
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        />
        <button
          type="button"
          onClick={handleMaximize}
          style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'opacity 0.2s', padding: 0 }}
          title="Maximize"
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        />
        <button
          type="button"
          onClick={handleClose}
          style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'opacity 0.2s', padding: 0 }}
          title="Close"
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        />
      </div>
    </header>
  )
}
