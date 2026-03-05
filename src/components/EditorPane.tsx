import type { RefObject } from 'react'
import { useI18n } from '../i18n'

type EditorPaneProps = {
  allowContextMenu?: boolean
  markdown: string
  onChange: (value: string) => void
  textareaRef?: RefObject<HTMLTextAreaElement | null>
}

export function EditorPane({ allowContextMenu = true, markdown, onChange, textareaRef }: EditorPaneProps) {
  const { t } = useI18n()

  return (
    <section className="pane">
      <div className="pane__header">{t('editor.header')}</div>
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
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  )
}

