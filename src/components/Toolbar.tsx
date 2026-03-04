import { useEffect, useRef, useState } from 'react'
import type { RecentFileEntry } from '../types/recentFile'
import type { ThemeMode } from '../types/theme'

type ToolbarProps = {
  allowEditorContextMenu: boolean
  onOpenMongTangAi: () => void
  onCopy: () => void
  onCut: () => void
  onExportHtml: () => void
  onExportPdf: () => void
  onNewFile: () => void
  onOpen: () => void
  onPaste: () => void
  onRecentFileSelect: (file: RecentFileEntry) => void
  onRedo: () => void
  recentFiles: RecentFileEntry[]
  onSave: () => void
  onSaveAs: () => void
  onSelectAll: () => void
  onToggleEditorContextMenu: () => void
  onThemeChange: (theme: ThemeMode) => void
  onUndo: () => void
  themeMode: ThemeMode
}

type MenuKey = 'edit' | 'file' | 'view' | null

function getRecentTooltip(file: RecentFileEntry) {
  if (file.path) return file.path
  return file.backend === 'browser'
    ? '브라우저 방식으로 기록된 항목은 경로를 제공하지 않습니다.'
    : file.name
}

export function Toolbar({
  allowEditorContextMenu,
  onOpenMongTangAi,
  onCopy,
  onCut,
  onExportHtml,
  onExportPdf,
  onNewFile,
  onOpen,
  onPaste,
  onRecentFileSelect,
  onRedo,
  recentFiles,
  onSave,
  onSaveAs,
  onSelectAll,
  onToggleEditorContextMenu,
  onThemeChange,
  onUndo,
  themeMode,
}: ToolbarProps) {
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

  return (
    <header className="toolbar" ref={rootRef}>
      <div className="menu-bar" role="menubar" aria-label="상단 메뉴">
        <div className="menu">
          <button
            type="button"
            className="menu__trigger"
            aria-expanded={openMenu === 'file'}
            aria-haspopup="true"
            onClick={() => toggleMenu('file')}
          >
            파일(F)
          </button>
          {openMenu === 'file' ? (
            <div className="menu__dropdown" role="menu" aria-label="파일 메뉴">
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onNewFile)}>
                새 파일
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onOpen)}>
                열기
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onSave)}>
                저장
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onSaveAs)}>
                다른 이름으로 저장
              </button>
              <div className="menu__separator" />
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onExportHtml)}>
                HTML 내보내기
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onExportPdf)}>
                PDF 내보내기
              </button>
              <div className="menu__separator" />
              <div className="menu__section-title">최근 파일</div>
              {recentFiles.length === 0 ? (
                <div className="menu__hint">표시할 최근 파일이 없습니다.</div>
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
            편집(E)
          </button>
          {openMenu === 'edit' ? (
            <div className="menu__dropdown" role="menu" aria-label="편집 메뉴">
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onUndo)}>
                실행 취소
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onRedo)}>
                다시 실행
              </button>
              <div className="menu__separator" />
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onCut)}>
                잘라내기
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onCopy)}>
                복사
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onPaste)}>
                붙여넣기
              </button>
              <button type="button" className="menu__item" role="menuitem" onClick={() => runMenuAction(onSelectAll)}>
                모두 선택
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
            보기(V)
          </button>
          {openMenu === 'view' ? (
            <div className="menu__dropdown" role="menu" aria-label="보기 메뉴">
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={themeMode === 'light'}
                onClick={() => runMenuAction(() => onThemeChange('light'))}
              >
                <span className="menu__check" aria-hidden="true">{themeMode === 'light' ? '✓' : ''}</span>
                <span>라이트 테마</span>
              </button>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={themeMode === 'dark'}
                onClick={() => runMenuAction(() => onThemeChange('dark'))}
              >
                <span className="menu__check" aria-hidden="true">{themeMode === 'dark' ? '✓' : ''}</span>
                <span>다크 테마</span>
              </button>
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemradio"
                aria-checked={themeMode === 'system'}
                onClick={() => runMenuAction(() => onThemeChange('system'))}
              >
                <span className="menu__check" aria-hidden="true">{themeMode === 'system' ? '✓' : ''}</span>
                <span>시스템 테마</span>
              </button>
              <div className="menu__separator" />
              <button
                type="button"
                className="menu__item menu__item--toggle"
                role="menuitemcheckbox"
                aria-checked={allowEditorContextMenu}
                onClick={() => runMenuAction(onToggleEditorContextMenu)}
              >
                <span className="menu__check" aria-hidden="true">{allowEditorContextMenu ? '✓' : ''}</span>
                <span>편집창 우클릭 활성</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <button type="button" className="toolbar__link" title="https://mongtang-ai.vercel.app" onClick={onOpenMongTangAi}>
        mongTang AI
      </button>
    </header>
  )
}
