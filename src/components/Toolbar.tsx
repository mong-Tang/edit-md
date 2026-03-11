import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import type { RecentFileEntry } from '../types/recentFile'
import type { ThemeMode } from '../types/theme'

type ToolbarProps = {
  allowEditorContextMenu: boolean
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
  onSelectAll: () => void
  onToggleEditorContextMenu: () => void
  onShowStartGuide: () => void
  onThemeChange: (theme: ThemeMode) => void
  onIndentSizeChange: (size: 2 | 4 | 8) => void
  onUndo: () => void
  themeMode: ThemeMode
}

type MenuKey = 'edit' | 'file' | 'help' | 'view' | null

export function Toolbar({
  allowEditorContextMenu,
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
  onSelectAll,
  onToggleEditorContextMenu,
  onShowStartGuide,
  onThemeChange,
  onIndentSizeChange,
  onUndo,
  themeMode,
}: ToolbarProps) {
  const { locale, setLocale, t } = useI18n()
  const [openMenu, setOpenMenu] = useState<MenuKey>(null)
  const rootRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null)
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const toggleMenu = (menu: Exclude<MenuKey, null>) => {
    setOpenMenu((current) => (current === menu ? null : menu))
  }

  const runMenuAction = (action: () => void) => {
    setOpenMenu(null)
    action()
  }

  const getRecentTooltip = (file: RecentFileEntry) => {
    if (file.path) return file.path
    return file.backend === 'browser' ? t('toolbar.recent.browserTooltip') : file.name
  }

  return (
    <header className="toolbar" ref={rootRef}>
      <div className="menu-bar" role="menubar" aria-label={t('menu.top.aria')}>
        <div className="menu">
          <button
            type="button"
            className="menu__trigger"
            aria-expanded={openMenu === 'file'}
            aria-haspopup="true"
            onClick={() => toggleMenu('file')}
          >
            {t('menu.file')}
          </button>
          {openMenu === 'file' ? (
            <div className="menu__dropdown" role="menu" aria-label={t('menu.file.aria')}>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onNewFile)}>
                {t('menu.file.new')}
              </button>
              <div className="menu__separator" />
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onOpen)}>
                {t('menu.file.open')}
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onSave)}>
                {t('menu.file.save')}
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onSaveAs)}>
                {t('menu.file.saveAs')}
              </button>
              <div className="menu__separator" />
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onCloseFile)}>
                {t('menu.file.close')}
              </button>
              <div className="menu__separator" />
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onExportHtml)}>
                {t('menu.file.exportHtml')}
              </button>
              <div className="menu__separator" />
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onExit)}>
                {t('menu.file.exit')}
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
                    <span className="menu__recent-name">{file.name}</span>
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
          >
            {t('menu.edit')}
          </button>
          {openMenu === 'edit' ? (
            <div className="menu__dropdown" role="menu" aria-label={t('menu.edit.aria')}>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onUndo)}>
                {t('menu.edit.undo')}
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onRedo)}>
                {t('menu.edit.redo')}
              </button>
              <div className="menu__separator" />
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onCut)}>
                {t('menu.edit.cut')}
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onCopy)}>
                {t('menu.edit.copy')}
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onPaste)}>
                {t('menu.edit.paste')}
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onSelectAll)}>
                {t('menu.edit.selectAll')}
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
          >
            {t('menu.view')}
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
                <span className="menu__check" aria-hidden="true">
                  {themeMode === 'light' ? '✓' : ''}
                </span>
                <span>{t('menu.view.theme.light')}</span>
              </button>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={themeMode === 'dark'}
                onClick={() => runMenuAction(() => onThemeChange('dark'))}
              >
                <span className="menu__check" aria-hidden="true">
                  {themeMode === 'dark' ? '✓' : ''}
                </span>
                <span>{t('menu.view.theme.dark')}</span>
              </button>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={themeMode === 'system'}
                onClick={() => runMenuAction(() => onThemeChange('system'))}
              >
                <span className="menu__check" aria-hidden="true">
                  {themeMode === 'system' ? '✓' : ''}
                </span>
                <span>{t('menu.view.theme.system')}</span>
              </button>
              <div className="menu__separator" />
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemcheckbox"
                aria-checked={allowEditorContextMenu}
                onClick={() => runMenuAction(onToggleEditorContextMenu)}
              >
                <span className="menu__check" aria-hidden="true">
                  {allowEditorContextMenu ? '✓' : ''}
                </span>
                <span>{t('menu.view.contextMenu')}</span>
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
                <span className="menu__check" aria-hidden="true">
                  {locale === 'ko' ? '✓' : ''}
                </span>
                <span>{t('menu.view.language.ko')}</span>
              </button>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={locale === 'en'}
                onClick={() => runMenuAction(() => setLocale('en'))}
              >
                <span className="menu__check" aria-hidden="true">
                  {locale === 'en' ? '✓' : ''}
                </span>
                <span>{t('menu.view.language.en')}</span>
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
                <span className="menu__check" aria-hidden="true">
                  {indentSize === 2 ? '✓' : ''}
                </span>
                <span>{t('menu.view.indent.2')}</span>
              </button>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={indentSize === 4}
                onClick={() => runMenuAction(() => onIndentSizeChange(4))}
              >
                <span className="menu__check" aria-hidden="true">
                  {indentSize === 4 ? '✓' : ''}
                </span>
                <span>{t('menu.view.indent.4')}</span>
              </button>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={indentSize === 8}
                onClick={() => runMenuAction(() => onIndentSizeChange(8))}
              >
                <span className="menu__check" aria-hidden="true">
                  {indentSize === 8 ? '✓' : ''}
                </span>
                <span>{t('menu.view.indent.8')}</span>
              </button>
              <div className="menu__separator" />
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onShowStartGuide)}>
                {t('menu.view.showStartGuide')}
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
          >
            {t('menu.help')}
          </button>
          {openMenu === 'help' ? (
            <div className="menu__dropdown" role="menu" aria-label={t('menu.help.aria')}>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onCheckForUpdates)}>
                {t('menu.help.checkUpdates')}
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onShowVersionInfo)}>
                {t('menu.help.versionInfo')}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <button type="button" className="toolbar__link" title="https://mongtang-ai.vercel.app" onClick={onOpenMongTangAi}>
        {t('toolbar.link.mongTang')}
      </button>
    </header>
  )
}
