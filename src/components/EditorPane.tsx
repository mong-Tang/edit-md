type EditorPaneProps = {
  markdown: string
  onChange: (value: string) => void
}

export function EditorPane({ markdown, onChange }: EditorPaneProps) {
  return (
    <section className="pane">
      <div className="pane__header">Markdown Editor</div>
      <textarea
        aria-label="Markdown editor"
        className="editor"
        value={markdown}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  )
}
