import type { RefObject } from 'react'

type EditorPaneProps = {
  allowContextMenu?: boolean
  markdown: string
  onChange: (value: string) => void
  textareaRef?: RefObject<HTMLTextAreaElement | null>
}

export function EditorPane({
  allowContextMenu = true,
  markdown,
  onChange,
  textareaRef,
}: EditorPaneProps) {
  return (
    <section className="pane">
      <div className="pane__header">Markdown Editor</div>
      <textarea
        aria-label="Markdown editor"
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
