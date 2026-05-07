import { isTauri } from '@tauri-apps/api/core'
import { openPath, openUrl } from '@tauri-apps/plugin-opener'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useI18n } from '../i18n'

type PreviewPaneProps = {
  currentFilePath?: string | null
  markdown: string
  previewRef?: React.RefObject<HTMLDivElement | null>
}

const EXTERNAL_PROTOCOLS = ['http://', 'https://', 'mailto:', 'tel:']
const WINDOWS_PATH_PATTERN = /^[a-zA-Z]:[\\/]/
const URL_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*:/

function convertFileUrlToPath(fileUrl: string) {
  const parsed = new URL(fileUrl)
  const pathname = decodeURIComponent(parsed.pathname).replace(/^\/([a-zA-Z]:)/, '$1')
  if (parsed.host) {
    return `//${parsed.host}${pathname}`
  }
  return pathname
}

function toFileUrl(path: string) {
  const normalized = path.replaceAll('\\', '/')
  if (/^[a-zA-Z]:/.test(normalized)) {
    return `file:///${encodeURI(normalized)}`
  }

  if (normalized.startsWith('//')) {
    return `file:${encodeURI(normalized)}`
  }

  return `file://${encodeURI(normalized.startsWith('/') ? normalized : `/${normalized}`)}`
}

function resolveLocalPath(href: string, currentFilePath?: string | null) {
  if (href.startsWith('file://')) {
    return convertFileUrlToPath(href)
  }

  if (WINDOWS_PATH_PATTERN.test(href) || href.startsWith('\\\\') || href.startsWith('//')) {
    return href
  }

  if (URL_SCHEME_PATTERN.test(href)) {
    return null
  }

  if (currentFilePath) {
    const baseUrl = toFileUrl(currentFilePath)
    const resolved = new URL(href, baseUrl)
    return convertFileUrlToPath(resolved.toString())
  }

  return null
}

function getTextFromChildren(children: any): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) {
    return children.map(getTextFromChildren).join('')
  }
  if (children && children.props && children.props.children) {
    return getTextFromChildren(children.props.children)
  }
  return ''
}

function remarkHighlight() {
  return (tree: any) => {
    const visit = (node: any) => {
      if (node.children) {
        const newChildren: any[] = []
        for (const child of node.children) {
          if (child.type === 'text' && child.value.includes('==')) {
            const regex = /==([^=\n]+)==/g
            let match
            let lastIndex = 0
            const text = child.value
            while ((match = regex.exec(text)) !== null) {
              const before = text.substring(lastIndex, match.index)
              if (before) {
                newChildren.push({ type: 'text', value: before })
              }
              newChildren.push({
                type: 'emphasis',
                data: { hName: 'mark' },
                children: [{ type: 'text', value: match[1] }]
              })
              lastIndex = regex.lastIndex
            }
            const after = text.substring(lastIndex)
            if (after) {
              newChildren.push({ type: 'text', value: after })
            }
          } else {
            newChildren.push(child)
            if (child.children) {
              visit(child)
            }
          }
        }
        node.children = newChildren
      }
    }
    visit(tree)
  }
}

export function PreviewPane({ currentFilePath, markdown, previewRef }: PreviewPaneProps) {
  const { t } = useI18n()

  const openInBrowser = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  const handleLinkClick = async (href?: string) => {
    if (!href) return

    const tauriRuntime = isTauri()
    const trimmedHref = href.trim()
    const normalizedHref = trimmedHref.toLowerCase()

    if (trimmedHref === 'open-history' || trimmedHref === 'history.md' || trimmedHref === './history.md') {
      window.dispatchEvent(new CustomEvent('open-changelog-history'))
      return
    }

    try {
      if (EXTERNAL_PROTOCOLS.some((protocol) => normalizedHref.startsWith(protocol))) {
        if (tauriRuntime) {
          await openUrl(trimmedHref)
        } else {
          openInBrowser(trimmedHref)
        }
        return
      }

      const localPath = resolveLocalPath(trimmedHref, currentFilePath)
      if (localPath) {
        if (tauriRuntime) {
          await openPath(localPath)
        } else {
          openInBrowser(toFileUrl(localPath))
        }
        return
      }

      if (!URL_SCHEME_PATTERN.test(trimmedHref)) {
        const appUrl = new URL(trimmedHref, window.location.href).toString()
        window.location.assign(appUrl)
        return
      }

      if (tauriRuntime) {
        await openUrl(trimmedHref)
      } else {
        openInBrowser(trimmedHref)
      }
    } catch (error) {
      console.error('[PreviewPane] 링크 열기 실패', { error, href: trimmedHref })

      const fallbackUrl = URL_SCHEME_PATTERN.test(trimmedHref)
        ? trimmedHref
        : new URL(trimmedHref, window.location.href).toString()

      if (tauriRuntime) {
        try {
          await openUrl(fallbackUrl)
        } catch (fallbackError) {
          console.error('[PreviewPane] 링크 열기 fallback 실패', { fallbackError, href: trimmedHref })
        }
      } else {
        openInBrowser(fallbackUrl)
      }
    }
  }

  return (
    <section className="pane preview-pane">
      <div className="pane__header">{t('preview.header')}</div>
      <div className="preview markdown-body" ref={previewRef}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkHighlight]}
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
              const codeString = getTextFromChildren(children)
              const code = codeString.replace(/\n$/, '')
              const match = /language-(\w+)/.exec(className || '')
              const isDark = document.documentElement.dataset.theme === 'dark'
              const isBlock = (className && className.startsWith('language-'))
                ? true
                : codeString.includes('\n')

              if (!match && !isBlock) {
                return (
                  <code className={className} {...rest}>
                    {children}
                  </code>
                )
              }

              const language = match ? match[1] : 'text'

              return (
                <SyntaxHighlighter
                  {...rest}
                  language={language}
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
