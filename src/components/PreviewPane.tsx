import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

type PreviewPaneProps = {
  markdown: string
}

export function PreviewPane({ markdown }: PreviewPaneProps) {
  return (
    <section className="pane preview-pane">
      <div className="pane__header">Live Preview</div>
      <div className="preview markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code(props) {
              const { children, className, node, ref, ...rest } = props
              void node
              void ref
              const match = /language-(\w+)/.exec(className || '')
              const code = String(children).replace(/\n$/, '')
              const isDark = document.documentElement.dataset.theme === 'dark'

              if (!match) {
                return (
                  <code className={className} {...rest}>
                    {children}
                  </code>
                )
              }

              return (
                <SyntaxHighlighter
                  {...rest}
                  language={match[1]}
                  PreTag="div"
                  style={isDark ? oneDark : oneLight}
                >
                  {code}
                </SyntaxHighlighter>
              )
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </section>
  )
}
