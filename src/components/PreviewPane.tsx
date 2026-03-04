import { isTauri } from '@tauri-apps/api/core'
import { openPath, openUrl } from '@tauri-apps/plugin-opener'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

type PreviewPaneProps = {
  markdown: string
}

export function PreviewPane({ markdown }: PreviewPaneProps) {
  const handleLinkClick = async (href?: string) => {
    if (!href) return

    try {
      if (href.startsWith('file:///')) {
        const filePath = decodeURIComponent(href.replace('file:///', '').replaceAll('/', '\\'))

        if (isTauri()) {
          await openPath(filePath)
        } else {
          window.open(href, '_blank', 'noopener,noreferrer')
        }
        return
      }

      if (isTauri()) {
        await openUrl(href)
      } else {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    } catch {
      window.open(href, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section className="pane preview-pane">
      <div className="pane__header">Live Preview</div>
      <div className="preview markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a(props) {
              const { children, href, node, ref, ...rest } = props
              void node
              void ref

              return (
                <a
                  {...rest}
                  href={href}
                  onClick={(event) => {
                    event.preventDefault()
                    void handleLinkClick(href)
                  }}
                >
                  {children}
                </a>
              )
            },
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
