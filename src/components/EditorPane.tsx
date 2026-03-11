import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useI18n } from '../i18n'

type QuickInsertOption = {
  cursorOffset?: number
  description: string
  id: string
  text: string
  token: string
}

function getCaretCoordinates(textarea: HTMLTextAreaElement, position: number) {
  const div = document.createElement('div')
  const span = document.createElement('span')
  const style = window.getComputedStyle(textarea)
  const properties = [
    'borderBottomWidth',
    'borderLeftWidth',
    'borderRightWidth',
    'borderTopWidth',
    'boxSizing',
    'fontFamily',
    'fontSize',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'letterSpacing',
    'lineHeight',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'tabSize',
    'textIndent',
    'textTransform',
    'whiteSpace',
    'width',
    'wordBreak',
    'wordSpacing',
    'wordWrap',
  ] as const

  div.style.position = 'absolute'
  div.style.visibility = 'hidden'
  div.style.whiteSpace = 'pre-wrap'
  div.style.wordWrap = 'break-word'
  div.style.overflow = 'hidden'
  div.style.left = '-9999px'
  div.style.top = '0'

  for (const property of properties) {
    div.style.setProperty(property, style.getPropertyValue(property))
  }

  div.textContent = textarea.value.slice(0, position)
  span.textContent = textarea.value.slice(position, position + 1) || ' '
  div.appendChild(span)
  document.body.appendChild(div)

  const result = {
    left: span.offsetLeft,
    top: span.offsetTop,
  }

  document.body.removeChild(div)
  return result
}

type EditorPaneProps = {
  allowContextMenu?: boolean
  indentSize: number
  markdown: string
  onChange: (value: string) => void
  textareaRef?: RefObject<HTMLTextAreaElement | null>
}

export function EditorPane({ allowContextMenu = true, indentSize, markdown, onChange, textareaRef }: EditorPaneProps) {
  const { t } = useI18n()
  const indentText = ' '.repeat(indentSize)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const selectionRef = useRef<{ end: number; start: number }>({ end: 0, start: 0 })
  const [isQuickInsertOpen, setIsQuickInsertOpen] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ left: 16, top: 16 })

  const quickInsertOptions: QuickInsertOption[] = useMemo(
    () => [
      { description: t('editor.quickInsert.h2'), id: 'h2', text: '## ', token: '##' },
      { description: t('editor.quickInsert.h3'), id: 'h3', text: '### ', token: '###' },
      { description: t('editor.quickInsert.list'), id: 'list', text: '- ', token: '-' },
      { description: t('editor.quickInsert.rule'), id: 'rule', text: '---\n', token: '---' },
      {
        cursorOffset: 4,
        description: t('editor.quickInsert.fence'),
        id: 'fence',
        text: '```\n```',
        token: '```',
      },
    ],
    [t],
  )

  const rememberSelection = (textarea: HTMLTextAreaElement) => {
    selectionRef.current = {
      end: textarea.selectionEnd,
      start: textarea.selectionStart,
    }
  }

  const openQuickInsert = (textarea: HTMLTextAreaElement) => {
    rememberSelection(textarea)

    const wrap = wrapRef.current
    if (!wrap) {
      setIsQuickInsertOpen(true)
      return
    }

    const caret = getCaretCoordinates(textarea, textarea.selectionStart)
    const textAreaStyle = window.getComputedStyle(textarea)
    const lineHeight = Number.parseFloat(textAreaStyle.lineHeight) || 20
    const left = Math.max(8, caret.left - textarea.scrollLeft + 8)
    const top = Math.max(8, caret.top - textarea.scrollTop + lineHeight + 8)

    setPopupPosition({ left, top })
    setIsQuickInsertOpen(true)
  }

  const applySelectionRange = (textarea: HTMLTextAreaElement, start: number, end: number) => {
    window.requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start, end)
    })
  }

  const handleTabIndent = (textarea: HTMLTextAreaElement) => {
    const { selectionStart, selectionEnd } = textarea
    const currentValue = textarea.value
    const hasSelection = selectionStart !== selectionEnd

    if (!hasSelection) {
      const next = `${currentValue.slice(0, selectionStart)}${indentText}${currentValue.slice(selectionEnd)}`
      const cursor = selectionStart + indentText.length
      onChange(next)
      applySelectionRange(textarea, cursor, cursor)
      return
    }

    const lineStart = currentValue.lastIndexOf('\n', selectionStart - 1) + 1
    const selected = currentValue.slice(lineStart, selectionEnd)
    const lineCount = selected.split('\n').length
    const indented = selected.replace(/^/gm, indentText)
    const next = `${currentValue.slice(0, lineStart)}${indented}${currentValue.slice(selectionEnd)}`
    const nextStart = selectionStart + indentText.length
    const nextEnd = selectionEnd + indentText.length * lineCount
    onChange(next)
    applySelectionRange(textarea, nextStart, nextEnd)
  }

  const handleShiftTabOutdent = (textarea: HTMLTextAreaElement) => {
    const { selectionStart, selectionEnd } = textarea
    const currentValue = textarea.value
    const hasSelection = selectionStart !== selectionEnd
    const lineStart = currentValue.lastIndexOf('\n', selectionStart - 1) + 1
    const selected = currentValue.slice(lineStart, selectionEnd)
    const lines = selected.split('\n')

    let removedBeforeStart = 0
    let removedTotal = 0

    const outdented = lines
      .map((line, index) => {
        let removed = 0
        let nextLine = line

        if (nextLine.startsWith('\t')) {
          removed = 1
          nextLine = nextLine.slice(1)
        } else {
          const leadingSpaces = nextLine.match(/^ +/)?.[0].length ?? 0
          removed = Math.min(indentText.length, leadingSpaces)
          nextLine = nextLine.slice(removed)
        }

        if (index === 0) {
          const cursorOffset = selectionStart - lineStart
          removedBeforeStart = Math.min(removed, Math.max(0, cursorOffset))
        }
        removedTotal += removed
        return nextLine
      })
      .join('\n')

    const next = `${currentValue.slice(0, lineStart)}${outdented}${currentValue.slice(selectionEnd)}`
    const nextStart = Math.max(lineStart, selectionStart - removedBeforeStart)
    const nextEnd = hasSelection ? Math.max(nextStart, selectionEnd - removedTotal) : nextStart
    onChange(next)
    applySelectionRange(textarea, nextStart, nextEnd)
  }

  const applyQuickInsert = (option: QuickInsertOption) => {
    const textarea = textareaRef?.current
    if (!textarea) return

    const currentValue = textarea.value
    const insertAt = Math.max(0, Math.min(selectionRef.current.start, currentValue.length))
    const next = `${currentValue.slice(0, insertAt)}${option.text}${currentValue.slice(insertAt)}`
    const nextCursor = insertAt + (option.cursorOffset ?? option.text.length)

    onChange(next)
    setIsQuickInsertOpen(false)
    applySelectionRange(textarea, nextCursor, nextCursor)
  }

  useEffect(() => {
    if (!isQuickInsertOpen) return

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsQuickInsertOpen(false)
        textareaRef?.current?.focus()
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!popupRef.current?.contains(event.target as Node)) {
        setIsQuickInsertOpen(false)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    window.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isQuickInsertOpen, textareaRef])

  useEffect(() => {
    if (!isQuickInsertOpen) return
    const popup = popupRef.current
    const wrap = wrapRef.current
    if (!popup || !wrap) return

    const minX = 8
    const minY = 8
    const maxX = Math.max(minX, wrap.clientWidth - popup.offsetWidth - 8)
    const maxY = Math.max(minY, wrap.clientHeight - popup.offsetHeight - 8)
    const clampedLeft = Math.min(Math.max(minX, popupPosition.left), maxX)
    const clampedTop = Math.min(Math.max(minY, popupPosition.top), maxY)

    if (clampedLeft !== popupPosition.left || clampedTop !== popupPosition.top) {
      setPopupPosition({ left: clampedLeft, top: clampedTop })
    }
  }, [isQuickInsertOpen, popupPosition.left, popupPosition.top])

  return (
    <section className="pane">
      <div className="pane__header">{t('editor.header')}</div>
      <div className="editor-wrap" ref={wrapRef}>
        <textarea
          aria-label={t('editor.aria')}
          className="editor"
          onContextMenu={(event) => {
            if (!allowContextMenu) {
              event.preventDefault()
            }
          }}
          ref={textareaRef}
          value={markdown}
          onKeyDown={(event) => {
            const triggerQuickInsert =
              (event.key === '?' || (event.key === '/' && event.shiftKey)) &&
              event.shiftKey &&
              event.ctrlKey &&
              !event.metaKey &&
              !event.altKey

            if (triggerQuickInsert) {
              event.preventDefault()
              openQuickInsert(event.currentTarget)
              return
            }

            if (event.key !== 'Tab') return
            event.preventDefault()
            if (event.shiftKey) {
              handleShiftTabOutdent(event.currentTarget)
              return
            }
            handleTabIndent(event.currentTarget)
          }}
          onSelect={(event) => rememberSelection(event.currentTarget)}
          onChange={(event) => onChange(event.target.value)}
        />
        {isQuickInsertOpen ? (
          <div
            className="editor-quick-insert"
            ref={popupRef}
            role="dialog"
            aria-label={t('editor.quickInsert.title')}
            style={{ left: `${popupPosition.left}px`, top: `${popupPosition.top}px` }}
          >
            <div className="editor-quick-insert__title">{t('editor.quickInsert.title')}</div>
            <div className="editor-quick-insert__list">
              {quickInsertOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="editor-quick-insert__item"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applyQuickInsert(option)}
                >
                  <span className="editor-quick-insert__token">{option.token}</span>
                  <span className="editor-quick-insert__desc">{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
