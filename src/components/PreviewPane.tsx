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

export function PreviewPane({ currentFilePath, markdown }: PreviewPaneProps) {
  const { t } = useI18n()

  const openInBrowser = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  const handleLinkClick = async (href?: string) => {
    if (!href) return

    const tauriRuntime = isTauri()
    const trimmedHref = href.trim()
    const normalizedHref = trimmedHref.toLowerCase()

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
